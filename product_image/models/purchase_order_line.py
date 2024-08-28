# -*- coding: utf-8 -*-

from odoo import api, fields, models,_

class PurchaseOrderLine(models.Model):
    _inherit = "purchase.order.line"
    
    purchase_image_product = fields.Image(string="Image", related='product_id.image_1920')
    
    # @api.onchange('product_id')
    # def onchange_purchase_order_product(self):
    #     for product in self:
    #         product.purchase_image_product = product.product_id.image_1920


