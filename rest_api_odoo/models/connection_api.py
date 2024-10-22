# -*- coding:utf-8 -*-
from odoo import fields, models


class ConnectionApi(models.Model):
    """This class is used to create an api model in which we can create
    records with models and fields, and also we can specify methods."""
    _name = 'connection.api'
    _rec_name = 'model_id'

    model_id = fields.Many2one('ir.model', string="Model",
                               domain="[('transient', '=', False)]",
                               help="Select model which can be accessed by "
                                    "REST api requests.")
    is_get = fields.Boolean(string='GET',
                            help="Select this to enable GET method "
                                 "while sending requests.")
    is_post = fields.Boolean(string='POST',
                             help="Select this to enable POST method"
                                  "while sending requests.")
    is_put = fields.Boolean(string='PUT',
                            help="Select this to enable PUT method "
                                 "while sending requests.")
    is_delete = fields.Boolean(string='DELETE',
                               help="Select this to enable DELETE method "
                                    "while sending requests.")
