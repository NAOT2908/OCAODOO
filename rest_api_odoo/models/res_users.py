# -*- coding:utf-8 -*-
import uuid
from odoo import fields, models


class ResUsers(models.Model):
    """This class is used to inherit users and add api key generation"""
    _inherit = 'res.users'

    api_key = fields.Char(string="API Key", readonly=True,
                          help="Api key for connecting with the "
                               "Database.The key will be "
                               "generated when authenticating "
                               "rest api.")

    def generate_api(self, username):
        """This function is used to generate api-key for each user"""
        users = self.env['res.users'].sudo().search([('login', '=', username)])
        if not users.api_key:
            users.api_key = str(uuid.uuid4())
            key = users.api_key
        else:
            key = users.api_key
        return key
