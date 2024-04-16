#  Copyright (c) by The Bean Family, 2023.
#
#  License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
#  These code are maintained by The Bean Family.
from odoo import models, fields


class ResCompany(models.Model):
    _inherit = "res.company"

    default_bank_acc = fields.Many2one(comodel_name='res.partner.bank', string='Default Bank Account',
                                       domain="[('partner_id','=', partner_id)]")