# -*- coding: utf-8 -*-

from odoo import api, fields, models


class ProductProduct(models.Model):
    """
    This is an Odoo model for product products. It inherits from the
    'product.product' model and extends its functionality by adding a
    computed field for product alert state.

     Methods:
        _compute_alert_tag(): Computes the value of the 'alert_tag' field based on the
        product's stock quantity and configured low stock alert parameters
    """
    _inherit = 'product.product'

    alert_tag = fields.Char(
        string='Product Alert Tag', compute='_compute_alert_tag',
        help='This field represents the alert tag of the product.')

    @api.depends('qty_available')
    def _compute_alert_tag(self):
        """Computes the value of the 'alert_tag' field based on the product's
        stock quantity and configured low stock alert parameters."""
        stock_alert = self.env['ir.config_parameter'].sudo().get_param(
            'low_stocks_product_alert.is_low_stock_alert')
        for rec in self:
            if stock_alert:
                is_low_stock = True if rec.detailed_type == 'product' and rec.qty_available <= int(
                    self.env['ir.config_parameter'].sudo().get_param(
                        'low_stocks_product_alert.min_low_stock_alert')) else False
                rec.alert_tag = rec.qty_available if is_low_stock else False
            else:
                rec.alert_tag = False
