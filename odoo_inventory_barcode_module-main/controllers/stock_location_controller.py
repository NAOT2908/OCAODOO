from odoo import http
from odoo.http import request

class StockLocationController(http.Controller):

    # Get default values for stock picking create
    @http.route('/api/stock-location/find-by-barcode', type='json', auth='user', methods=['POST'], csrf=False)
    def get_default_picking_values(self, **post):
        # Get the barcode from the request
        barcode = post.get('barcode')

        if not barcode:
            return {
                'success': False,
                'error': 'Barcode is required'
            }

        try:
            # Search for the source location using the barcode
            source_location = request.env['stock.location'].sudo().search([('barcode', '=', barcode)], limit=1)

            if not source_location:
                return {
                    'success': False,
                    'error': f"Stock location with barcode '{barcode}' not found."
                }

            # Return the picking type ID and name
            return {
                'success': True,
                'data': {
                    'location_id': source_location.id,
                    'location_name': source_location.name,
                }
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


