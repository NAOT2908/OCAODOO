# -*- coding: utf-8 -*-

from odoo import api, fields, models
from odoo import http
from odoo.http import request

class UserAuditLogs(models.Model):
    """ For tracking user activity by adding user logs """
    _name = "user.audit.log"
    _description = "User Audit Details"

    name = fields.Char(string="Reference", required=True, readonly=True,
                       default='New', help="For getting reference")
    user_id = fields.Many2one('res.users', string="User",
                              help="For getting user")
    record = fields.Integer(string="Record ID",
                            help="For getting which record has accessed")
    model_id = fields.Many2one('ir.model', string="Object",
                               help="For getting which model has accessed")
    operation_type = fields.Selection(selection=[('read', 'Read'),
                                                 ('write', 'Write'),
                                                 ('create', 'Create'),
                                                 ('delete', 'Delete')],
                                      string="Type",
                                      help="For getting which operation has "
                                           "been performed")
    date = fields.Datetime(string="Date",
                           help="For getting which time the operation has done")
    ip_address = fields.Char(string="IP Address", help="The IP address of the user", readonly=True)
    order_id = fields.Char(string="Order ID", help="Order name", readonly=True)
    # picking_id = fields.Many2one('stock.picking',string="Picking Record ID", help="ID or name of the related record")
    # sale_id = fields.Many2one('sale.order',string="Sale Record ID", help="ID or name of the related record")
    # purchase_id = fields.Many2one('purchase.order',string="Purchase Record ID", help="ID or name of the related record")

  
    @api.model_create_multi
    def create(self, values):
        """ For adding sequence number """
        vals = values[0]
        if vals.get('name', 'New'):
            vals['name'] = self.env['ir.sequence'].next_by_code(
                'user.audit.log')
        # Lấy giá trị record từ giá trị được tạo
        record_id = vals.get('record')
        model_id = vals.get('model_id')
          
        # model = self.env['ir.model'].search([('id', '=', model_id)])
        model = self.env['ir.model'].browse(model_id)
        
        

        if model:
            record = self.env[model.model].sudo().browse(record_id)
            
            if record:
                vals['order_id'] = record.name
                # vals['picking_id'] = record.name
                # vals['sale_id'] = record.name
                # vals['purchase_id'] = record.name
            
            
        # ip_address = request.httprequest.remote_addr
        ip_address = request.httprequest.environ['REMOTE_ADDR'] 
        
        vals['ip_address'] = ip_address
        
        res = super(UserAuditLogs, self).create(vals)
        return res
