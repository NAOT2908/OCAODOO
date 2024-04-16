# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order'
    _description = 'Purchase Order Total Purchase,Received and Billed Quantity'

    purchase_quantity = fields.Float(string='No. Ordered Quantity', compute='_compute_total_purchase_quantity')
    received_quantity = fields.Float(string='No. Received Quantity', compute='_compute_total_received_quantity')
    bill_quantity = fields.Float(string='No. Billed Quantity', compute='_compute_total_bill_quantity')

    @api.depends('order_line')
    def _compute_total_purchase_quantity(self):
        total_purchase = 0
        if self.order_line:
            for rec in self.order_line:
                total_purchase += rec.product_qty
                self.purchase_quantity = total_purchase
        else:
            self.purchase_quantity = 0


    @api.depends('order_line')
    def _compute_total_received_quantity(self):
        total_received = 0
        if self.order_line:
            for rec in self.order_line:
                total_received += rec.qty_received
                self.received_quantity = total_received
        else:
            self.received_quantity = 0


    @api.depends('order_line')
    def _compute_total_bill_quantity(self):
        total_bill = 0
        if self.order_line:
            for rec in self.order_line:
                total_bill += rec.qty_invoiced
                self.bill_quantity = total_bill
        else:
            self.bill_quantity = 0

