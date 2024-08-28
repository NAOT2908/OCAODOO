# -*- coding: utf-8 -*-
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    """Inherits the model res.config.settings to add the field"""
    _inherit = 'res.config.settings'

    is_show_product_image = fields.Boolean(
        string="Show Product Image",
        config_parameter='product_image.is_show_product_image',
        help='Show product Image in sale report')
