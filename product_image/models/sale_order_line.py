# -*- coding: utf-8 -*-
from odoo import fields, models, api


class SaleOrderLine(models.Model):
    """Inherits the model sale.order.line to add a field"""
    _inherit = 'sale.order.line'

    order_line_image = fields.Binary(string="Image", related='product_id.image_1920',
                                     help='Product Image in Sale orderLine')
    
    # @api.onchange('product_id')
    # def onchange_purchase_order_product(self):
    #     for product in self:
    #         product.order_line_image = product.product_id.image_1920
