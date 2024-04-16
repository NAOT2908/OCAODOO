# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class StockPicking(models.Model):
    _inherit = 'stock.picking'
    _description = 'Total Demand And Done Quantity Count'

    demand_quantity = fields.Float(string='No. Demand Quantity',compute='_compute_total_demand_quantity')
    done_quantity = fields.Float(string='No. Done Quantity', compute='_compute_total_done_quantity')

    @api.depends('move_ids_without_package')
    def _compute_total_demand_quantity(self):
        total_demand = 0
        if self.move_ids_without_package:
            for rec in self.move_ids_without_package:
                total_demand += rec.product_uom_qty
                self.demand_quantity = total_demand
        else:
            self.demand_quantity = 0


    @api.depends('move_ids_without_package')
    def _compute_total_done_quantity(self):
        total_done = 0
        if self.move_ids_without_package:
            for rec in self.move_ids_without_package:
                total_done += rec.quantity
                self.done_quantity = total_done
        else:
            self.done_quantity = 0

