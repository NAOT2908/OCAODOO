#   Copyright (c) by The UniCube, 2023.
#   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
#   These code are maintained by The UniCube.
from odoo import models, fields


class AccountPayment(models.Model):
    _inherit = "account.payment"

    counter_bank_id = fields.Many2one('res.partner.bank', string="Counter Bank Account",
                                      readonly=False, store=True, tracking=True,
                                      domain="[('id', 'in', available_partner_bank_ids)]",
                                      check_company=True,
                                      ondelete='restrict',
                                      )