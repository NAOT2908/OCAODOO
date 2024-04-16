#  Copyright (c) by The Bean Family, 2023.
#
#  License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
#  These code are maintained by The Bean Family.
from odoo import fields, models, api
from odoo.osv import expression

class ResBank(models.Model):
    _inherit = 'res.bank'

    full_name = fields.Char('Full Name')
    short_name = fields.Char('Short Name')
    logo_url = fields.Char('Link Url')
    transfer_supported = fields.Boolean("Transfer Supported")
    lookup_supported = fields.Boolean("Lookup Supported")
    swift_code = fields.Char('Swift Code')
    
    def name_get(self):
        result = []
        for bank in self:
            name = bank.name + (bank.full_name and (' - ' + bank.full_name) or '') + (bank.bic and (' - ' + bank.bic) or '')
            result.append((bank.id, name))
        return result
    
    # @api.model
    # def _name_search(self, name, args=None, operator='ilike', limit=100, name_get_uid=None):
    #     args = args or []
    #     domain = []
    #     if name:
    #         domain = ['|','|', ('bic', '=ilike', name + '%'), ('name', operator, name),('full_name', '=ilike', '%'+ name + '%')]
    #         if operator in expression.NEGATIVE_TERM_OPERATORS:
    #             domain = ['&'] + domain
    #     return self._search(domain + args, limit=limit, access_rights_uid=name_get_uid)
    
