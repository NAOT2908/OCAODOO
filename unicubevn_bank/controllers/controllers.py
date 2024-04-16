# -*- coding: utf-8 -*-
# from odoo import http


# class BeanBank(http.Controller):
#     @http.route('/unicubevn_bank/unicubevn_bank', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/unicubevn_bank/unicubevn_bank/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('unicubevn_bank.listing', {
#             'root': '/unicubevn_bank/unicubevn_bank',
#             'objects': http.request.env['unicubevn_bank.unicubevn_bank'].search([]),
#         })

#     @http.route('/unicubevn_bank/unicubevn_bank/objects/<model("unicubevn_bank.unicubevn_bank"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('unicubevn_bank.object', {
#             'object': obj
#         })
