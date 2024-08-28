from odoo import fields, models

class CloseReasonWizard(models.TransientModel):
    _name = 'close.reason.wizard'

    reason_id = fields.Many2one(comodel_name='close.reason', string='Reason',required=True)
    

    def action_close_subs(self):
        subs_id = self.env.context.get('rec_id')
        if subs_id:
            subscription = self.env['sale.order'].browse(subs_id)
            if subscription:
                subscription.subscription_status = 'c'
                msg = "Subscription Closed : Reason - " +  self.reason_id.desc
                subscription.message_post(body=msg)