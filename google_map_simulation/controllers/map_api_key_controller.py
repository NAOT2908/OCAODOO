from odoo import http


class GoogleMapSimulationController(http.Controller):
    @http.route('/google_map_simulation/get-google-map-api-key', type="json", auth="user",cors="*",csrf=False)
    def get_google_map_api_key(self, **kwargs):
        # ICPSudo = self.env['ir.config_parameter'].sudo()
        google_map_api_key = ''  # ICPSudo.get_param('google_map_api_key')
        return 'abcdef'
