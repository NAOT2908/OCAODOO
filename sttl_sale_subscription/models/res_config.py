from odoo import models, fields


class ResConfig(models.TransientModel):
    _inherit = "res.config.settings"

    notification_days = fields.Char(string="Subscription nofification days", 
                    config_parameter="sttl_sale_subscription.notification_duration", default=10)
                    