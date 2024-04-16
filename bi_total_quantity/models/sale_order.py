# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api


class SaleOrder(models.Model):
    _inherit = 'sale.order'
    _description = 'Sale Order Total Order,Deliverd And invoice Quantity Count'

    order_quantity = fields.Float(string='No. Ordered Quantity', compute='_compute_total_order_quantity', default=0)
    deliver_quantity = fields.Float(string='No. Delivered Quantity', compute='_compute_total_delivery_quantity',
                                    default=0)
    invoice_quantity = fields.Float(string='No. Invoiced Quantity', compute='_compute_total_invoiced_quantity',
                                    default=0)

    @api.depends('order_line')
    def _compute_total_order_quantity(self):
        total_order = 0
        if self.order_line:
            for rec in self.order_line:
                total_order += rec.product_uom_qty
                self.order_quantity = total_order
        else:
            self.order_quantity = 0


    @api.depends('order_line')
    def _compute_total_delivery_quantity(self):
        total_delivered = 0
        if self.order_line:
            for rec in self.order_line:
                total_delivered += rec.qty_delivered
                self.deliver_quantity = total_delivered
        else:
            self.deliver_quantity = 0


    @api.depends('order_line')
    def _compute_total_invoiced_quantity(self):
        total_invoice = 0
        if self.order_line:
            for rec in self.order_line:
                total_invoice += rec.qty_invoiced
                self.invoice_quantity = total_invoice
        else:
            self.invoice_quantity = 0


