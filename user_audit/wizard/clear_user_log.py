# -*- coding: utf-8 -*-

from odoo import fields, models


class ClearUserLog(models.TransientModel):
    """ Model that uses to Clear the User Audit Logs"""
    _name = "clear.user.log"
    _description = "Clear User Logs"

    full_log = fields.Boolean(string="Full Log",
                              help="Enabling we can clear full log details")
    is_read = fields.Boolean(string="Read",
                             help="Enabling we can clear all read activities")
    is_write = fields.Boolean(string="Write",
                              help="Enabling we can clear all write activities")
    is_create = fields.Boolean(string="Create",
                               help="Enabling we can clear all create "
                                    "activities")
    is_delete = fields.Boolean(string="Delete",
                               help="Enabling we can clear all delete "
                                    "activities")
    to_date = fields.Datetime(string="To Date",
                              help="Enabling we can clear all activities "
                                   "up to the date")
    model_id = fields.Many2one('ir.model', string="Object",
                               help="Clear selected model's activities")

    def action_clear_user_logs(self):
        """ Function that helps to clear the log data based
                        on the data from the wizard"""
        if self.full_log:
            self.env['user.audit.log'].search([]).unlink()
        elif self.is_create and self.is_write and self.is_read and self.is_delete:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'create'),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'read'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.is_create and self.is_write and self.is_read:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'create'),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.is_create and self.is_write and self.is_delete:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'create'),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.is_create and self.is_read and self.is_delete:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'create'),
                 ('operation_type', '=', 'read'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.is_delete and self.is_write and self.is_read:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'delete'),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_create and self.is_read:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'create'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_create and self.is_write:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'create'),
                 ('operation_type', '=', 'write')]).unlink()
        elif self.to_date and self.is_create and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'create'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.to_date and self.is_write and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.to_date and self.is_read and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'read'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.to_date and self.is_write and self.is_read:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_create and self.is_read:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'create'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_create and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'delete'),
                 ('operation_type', '=', 'create')]).unlink()
        elif self.to_date and self.is_create and self.is_write:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'create'),
                 ('operation_type', '=', 'write')]).unlink()
        elif self.to_date and self.is_write and self.is_read:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_write and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_read and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'write'),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.to_date and self.is_create:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'create')]).unlink()
        elif self.to_date and self.is_delete:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'delete')]).unlink()
        elif self.to_date and self.is_read:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'read')]).unlink()
        elif self.to_date and self.is_write:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date),
                 ('operation_type', '=', 'write')]).unlink()
        elif self.is_create:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'create')]).unlink()
        elif self.is_read:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'read')]).unlink()
        elif self.is_write:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'write')]).unlink()
        elif self.is_delete:
            self.env['user.audit.log'].search(
                [('operation_type', '=', 'delete')]).unlink()
        elif self.to_date:
            self.env['user.audit.log'].search(
                [('date', '<', self.to_date)]).unlink()
        else:
            self.env['user.audit.log'].search([]).unlink()
