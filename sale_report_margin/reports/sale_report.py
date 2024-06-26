

from odoo import fields, models


class SaleReport(models.Model):
    _inherit = "sale.report"

    purchase_price = fields.Float(readonly=True)

    def _select_additional_fields(self):
        res = super()._select_additional_fields()
        res["purchase_price"] = "SUM(l.purchase_price)"
        return res
