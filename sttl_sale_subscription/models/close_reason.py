
from odoo import models,fields 

class CloseReason(models.Model):
    _name = 'close.reason'
    _description = 'Subscription Close Reason'

    name = fields.Char(string='name')
    desc = fields.Char(string='Description')
    
    