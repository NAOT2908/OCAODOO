from odoo import models,api,fields
import datetime

class Account(models.Model):
    _inherit = 'account.move'

    def action_post(self):
        for rec in self:
            if rec.invoice_origin and rec.invoice_origin.startswith("S"):
                rec = self.env['sale.order'].search([('name','=',rec.invoice_origin)],limit=1)
                if rec:
                    if rec.recurrance_id:
                        next_date = False
                        today = rec.next_invoice_date if rec.next_invoice_date else datetime.datetime.today().date()
                        period = rec.recurrance_id
                        if period.unit == 'days':
                            next_date = today + datetime.timedelta(days=period.duration)
                        if period.unit == 'weeks':
                            next_date = today + datetime.timedelta(weeks=period.duration)
                        if period.unit == 'month':
                            next_date = today + datetime.timedelta(period.duration* 365 /12)
                        if period.unit == 'year':
                            next_date = today + datetime.timedelta(days=365 * period.duration)
                        if next_date:
                            rec.next_invoice_date = next_date
                            rec.subscription_status = "b"
                        # else:
                        #     rec.next_invoice_date = datetime.datetime.today().date()
                        #     rec.subscription_status = "b" 

        super(Account,self).action_post()