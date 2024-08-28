# -*- coding: utf-8 -*-

from odoo import api, fields, models


class InheritSaleOrder(models.Model):
    _inherit = 'sale.order'
    _description = 'Sale Order'

    is_merge_order = fields.Boolean(string='Is Merge Order',store=True)
    merge_date = fields.Date(string="Merge date",)
    merge_sale_orders = fields.Char(string='Merge Sale Orders')
    merge_user_id = fields.Many2one('res.users', string='Merge By')
