#   Copyright (c) by The UniCube, 2023.
#   License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
#   These code are maintained by The UniCubey.
from datetime import datetime

from odoo import models, fields


class IpnLog(models.Model):
    _name = "ipn.log"
    _order = "id desc"
    _description = "IPN Log"

    name = fields.Char("Provider Code")
    data = fields.Char("Callback Data")
    account_payment_id = fields.Many2one("account.payment", "Account Payment")


