

from odoo import api, fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    basic = fields.Char('Basic',)
    barcode = fields.Char('barcode')