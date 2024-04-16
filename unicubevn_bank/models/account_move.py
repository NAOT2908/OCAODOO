#   Copyright (c) by The Bean Family, 2023.
#   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
#   These code are maintained by The Bean Family.
import logging
import uuid

from odoo import models, fields, api

_logger = logging.getLogger(__name__)


class AccountMove(models.Model):
    _inherit = 'account.move'
    qr_raw_data = fields.Char(string="QR data", compute="_compute_qr_data", store=True, default=False)
    qr_id = fields.Char("QR UUID", default=False)

    @api.depends('partner_bank_id', 'amount_residual', 'name', 'ref', 'state', 'payment_state')
    def _compute_qr_data(self, anchor="CUB", txn_code="I"):
        try:
            for record in self:
                if record.company_id.country_id.code == "VN" and 'invoice' in record.move_type:
                    # if not self.qr_id:
                    pay_content = f"{str(record.name).replace('/', '')}"
                    if record.journal_id.type == "sale":
                        pay_content = f"Pay invoice {pay_content}"
                    if record.journal_id.type == "purchase":
                        txn_code = "O"
                        pay_content = f"Pay bill {str(record.name).replace('/', '')}"
                    record.qr_id = f"{anchor}{txn_code}{str(uuid.uuid1())[:8]}".upper()
                    record.qr_code_method = 'emv_qr'
                    _logger.info(
                        f"structured_communication: {record.qr_id} {record.ref if record.ref else pay_content}")
                    # ===== Generate VietQR
                    qr_data = record.partner_bank_id.get_qr_data('emv_qr', record.amount_residual, record.currency_id,
                                                                 '', '',
                                                                 f"{record.qr_id} {record.ref if record.ref else pay_content}")
                    # ===== Don't use absolute path for get QR. =====
                    # base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
                    self.qr_raw_data = qr_data
        except Exception as X:
            _logger.info(f"_compute_qr_data have error:\n {X}")
