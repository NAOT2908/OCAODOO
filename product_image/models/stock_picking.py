from odoo import api, fields, models,_
from odoo.tools import DEFAULT_SERVER_DATETIME_FORMAT
from odoo.tools.float_utils import float_compare, float_round, float_is_zero
from itertools import groupby


class StockMove(models.Model):
    _inherit = "stock.move"
    product_image_stock = fields.Image(string="Image", related='product_id.image_1920')
    
    # @api.onchange('product_id')
    # def onchange_product_image(self):
    #     for product in self:
    #         product.product_image_stock = product.product_id.image_1920
    