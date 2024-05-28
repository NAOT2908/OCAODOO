# -*- coding: utf-8 -*-

from odoo import fields, models

class SaleReport(models.Model):
    _inherit = "sale.report"

    purchase_price = fields.Float(readonly=True)

    def _select(self):
        select_str = super(SaleReport, self)._select()
        select_str += ", l.purchase_price as purchase_price"
        return select_str

    def _group_by(self):
        group_by_str = super(SaleReport, self)._group_by()
        group_by_str += ", l.purchase_price"
        return group_by_str

    def _from(self):
        from_str = super(SaleReport, self)._from()
        return from_str

    def _where(self):
        where_str = super(SaleReport, self)._where()
        return where_str
