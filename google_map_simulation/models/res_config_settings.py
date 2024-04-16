from odoo import fields, models, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'
    _description = 'Res Config Settings'

    google_map_api_key = fields.Char(config_parameter='google_map_api_key')

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        ICPSudo = self.env['ir.config_parameter'].sudo()
        google_map_api_key = ICPSudo.get_param('google_map_api_key')
        res.update(google_map_api_key=google_map_api_key)
        return res
