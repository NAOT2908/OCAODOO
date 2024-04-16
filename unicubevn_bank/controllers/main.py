# -*- coding: utf-8 -*-
import json
import logging
import re

import werkzeug.exceptions

from odoo.exceptions import AccessError
from odoo.http import request, route, Controller, Response

_logger = logging.getLogger(__name__)


class UniCubeBankController(Controller):
    _ipn_url = "/ipn/unicube"

    def err_hanleding(exception):
        if isinstance(exception, AccessError):
            print(exception)
            print(AccessError)
            return True
            # return request.redirect("/slides?invite_error=no_rights", 302)

    # Route logic
    @route(_ipn_url, auth="public", type="json", methods=["POST"],
           csrf=True, cors="*", handle_params_access_error=err_hanleding)
    def ipn_handling(self, **kw):
        data = request.get_json_data()
        print(f"data: {data}")
        _logger.info(f"ipn_handling function processing with data:\n {data}")
        _logger.info("Step 1: Check Provider")
        provider = self.check_provider(data)
        _logger.info(f"Step 2: Store data - {provider}")
        data_obj = {
            'name': provider if provider else 'unknown',
            'data': json.dumps(data),
        }
        store_result = request.env['ipn.log'].sudo().create(data_obj)
        _logger.info(f"Store result {store_result}")

        if provider:
            _logger.info("Step 3: IPN Handling - starting...")
            result = self.invoice_handling(provider, data)
            _logger.info(f"Step 3: IPN Handling - result: {result}")
            if result:
                if type(result) is not Response:
                    store_result.write({'account_payment_id': result.id})
                    return {"message": "Successful"}
                else:
                    print(result.status)
                    print(result.content_type)
                    print(result.response)
                    return {'status': result.status,
                            'content_type': result.content_type,
                            'respone': result.response}

        return {"message": "This provider is not supported"}

    def check_provider(self, data):
        return False

    def invoice_handling(self, provider, data):
        return False

    @route(['/vietqr', '/vietqr/<path:value>', '/vietqr/<bill_value>/<bill_purpose>/<path:value>'], type='http',
           auth="public", cors="*")
    def get_vietqr(self, bill_value='', bill_purpose='', bill_no='', **kwargs):
        """Contoller able to render VietQR images 
        Samples::

            <img t-att-src="'/vietqr/20000/%s' % ('Thanh toan mua hang')"/>
            <img t-att-src="'/vietqr?bill_value=%s&amp;bill_purpose=%s&amp;width=%s&amp;height=%s' %
                (20000, 'Thanh toan bill', 200, 200)"/>

        :param bill_value: Value of the bill
        :param bill_purpose: Payment purpose
        :param width: Pixel width of the barcode
        :param height: Pixel height of the barcode
        :param humanreadable: Accepted values: 0 (default) or 1. 1 will insert the readable value
        at the bottom of the output image
        :param quiet: Accepted values: 0 (default) or 1. 1 will display white
        margins on left and right.
        :param mask: The mask code to be used when rendering this QR-code.
                     Masks allow adding elements on top of the generated image,
                     such as the Swiss cross in the center of QR-bill codes.
        :param barLevel: QR code Error Correction Levels. Default is 'L'.
        :param qrtype: if have value = 'static' , is Static QR Code; if absent , is Dynamic QR Code
        :param partner_id: will user the Id of Odoo partner to search for the bank account, then use the first one to generate QR
        ref: https://hg.reportlab.com/hg-public/reportlab/file/830157489e00/src/reportlab/graphics/barcode/qr.py#l101
        """
        try:
            _logger.info("Start set QR dimension")
            _logger.debug(request.env.ref('base.main_company').default_bank_acc.acc_number)

            # set height and width value of QR
            acc_number = kwargs.get('bank_acc') if 'bank_acc' in kwargs else False
            qr_height = int(kwargs.get('height')) if 'height' in kwargs else 120
            qr_width = int(kwargs.get('weight')) if 'weight' in kwargs else 120
            amount = int(kwargs.get('amount')) if 'amount' in kwargs else 0
            content = kwargs.get('content') if 'content' in kwargs else 0
            if acc_number:
                banks_found = request.env['res.partner.bank'].sudo().search(
                    [('acc_number', '=', acc_number)])[0]
            else:
                banks_found = request.env.ref('base.main_company').default_bank_acc

            if banks_found:
                print("\n banks_found: %s" % banks_found)
                print("\n amount: %s" % amount)
                # Generate VietQR value string
                value = banks_found.get_qr(amount=amount, content=content)
                print("\n QR value: %s" % value)

                # Call Odoo's built-in report qr
                qrcode = request.env['ir.actions.report'].barcode("QR", value, width=qr_width, height=qr_height)

                #

                return request.make_response(qrcode, headers=[('Content-Type', 'image/png')])
            else:
                raise werkzeug.exceptions.HTTPException(description='Cannot convert into barcode.')
        except (ValueError, AttributeError) as X:
            print(X)
            raise werkzeug.exceptions.HTTPException(description='Cannot convert into barcode.')
