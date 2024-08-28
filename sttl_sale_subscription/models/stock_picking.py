from odoo import models


class StockPicking(models.Model):
    _inherit = 'stock.picking'

    def button_validate(self):
        result = super(StockPicking,self).button_validate()
        for rec in self:
            so = self.env['sale.order'].search([('name','=',rec.origin)],limit=1)
            if so and so.recurrance_id and so.subscription_status == 'b':
                so.action_invoice(so)
        return result