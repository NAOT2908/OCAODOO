# -*- coding: utf-8 -*-

from odoo.osv import expression
from odoo import models, fields, api, exceptions,_, tools
import os
import base64,pytz,logging
from datetime import datetime, timedelta
import datetime as date_time
import random
from odoo.exceptions import UserError, ValidationError
_logger = logging.getLogger(__name__)
from io import BytesIO
import xlsxwriter
from openpyxl import load_workbook


from odoo import models, fields, api

class MrpBomReport(models.Model):
    _name = "mrp.bom_report"
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = "Reserve Report"

    date_from = fields.Date(string='Start Date')
    to_date = fields.Date(string='To Date')
    name = fields.Char(string='Name', compute='_compute_name', store=True)
    date_from = fields.Date(string='Start Date')
    state = fields.Selection(
        [('not_viewed', 'Not Viewed'), ('viewed', 'Viewed')],
        string='Status', readonly=False, copy=True, index=False, default='not_viewed'
    )
    filter = fields.Boolean(string='Enable filter by date')
    filter_user = fields.Boolean(string='Filter On Responsible')
    responsible_id = fields.Many2many('res.users', string='Responsible')
    product_id = fields.Many2many('product.product', string='Product')

    @api.onchange('filter_user')
    def onchange_filter_mode(self):
        if not self.filter_user:
            self.responsible_id = False

    @api.onchange('filter')
    def onchange_filter_state(self):
        if not self.filter:
            self.date_from = None

    @api.depends('date_from', 'to_date')
    def _compute_name(self):
        for record in self:
            record.name = "Từ " + str(record.date_from) + " Đến " + str(record.to_date)

    def action_not_viewed_view_report(self):
        self.ensure_one()
        self.env['mrp.mrp_report_line']._create_view(self.date_from, self.to_date)  # Kiểm tra xem phương thức này có tồn tại
        self.sudo().write({'state': 'viewed'})
        return {
            'type': 'ir.actions.act_window',
            'name': 'Bom Report',
            'view_mode': 'tree,pivot,graph',
            'res_model': 'mrp.mrp_report_line',
        }
    def check_report(self):
        """
            Function to fetch the mrp orders according to the filters given in
            the wizard and print the XLS report
        """
        orders = []
        conditions = []
        if self.product_id:
            conditions.append(('product_id', 'in', self.product_id.ids))
        if self.state:
            conditions.append(('state', '=', self.state))
        if self.date_from:
            conditions.append(('date_start', '>=', self.date_from))
        if self.responsible_id:
            conditions.append(('user_id', 'in', self.responsible_id.ids))

        mrp_orders = self.env['mrp.production'].search(conditions)
        for rec in mrp_orders:
            orders.append({
                'name': rec.name,
                'product': rec.product_id.name,
                'quantity': rec.product_qty,
                'unit': rec.product_uom_category_id.name,
                'responsible': rec.user_id.name,
                'start_date': rec.date_start,
                'state': dict(self.env['mrp.production']._fields[
                    'state']._description_selection(
                    self.env)).get(rec['state']),
            })
        data = {
            'date_from': self.date_from,
            'state': dict(self.env['mrp.production']._fields[
                'state']._description_selection(
                self.env)).get(rec['state']),
            'mrp': orders
        }
        return {
            'type': 'ir.actions.report',
            'data': {
                'model': 'mrp.report.wizard',
                'options': json.dumps(data, default=date_utils.json_default),
                'output_format': 'xlsx',
                'report_name': 'Manufacturing Report', },
            'report_type': 'xlsx',
        }

    def print_pdf(self):
        """
            Function to fetch the mrp orders according to the filters given in
            the wizard and print the PDF report
        """
        orders = []
        conditions = []
        if self.product_id:
            conditions.append(('product_id', 'in', self.product_id.ids))
        if self.state:
            conditions.append(('state', '=', self.state))
        if self.date_from:
            conditions.append(('date_start', '>=', self.date_from))
        if self.responsible_id:
            conditions.append(('user_id', 'in', self.responsible_id.ids))
        mrp_orders = self.env['mrp.production'].search(conditions)
        for rec in mrp_orders:
            orders.append({
                'name': rec.name,
                'image': rec.product_id.image_1920,
                'product': rec.product_id.name,
                'quantity': rec.product_qty,
                'unit': rec.product_uom_category_id.name,
                'responsible': rec.user_id.name,
                'start_date': rec.date_start,
                'state': dict(self.env['mrp.production']._fields[
                    'state']._description_selection(
                    self.env)).get(rec['state']),
            })
        data = {
            'date_from': self.date_from,
            'state': [order['state'] for order in orders] if self.state else None,
            'mrp': orders
        }
        return self.env.ref(
            'manufacturing_reports.action_mrp_report').report_action(self,
                                                                     data=data)

    def get_xlsx_report(self, data, response):
        """
            Setting the position to print the datas in the xlsx file
        """
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        head_format = workbook.add_format({
            'bold': True,
            'align': 'center',
            'valign': 'vcenter',
            'fg_color': '#dec5c5'
        })
        sheet = workbook.add_worksheet()
        cell_format = workbook.add_format({'font_size': '12px', 'bold': True})
        head = workbook.add_format(
            {'align': 'center', 'bold': True, 'font_size': '20px'})
        txt_head = workbook.add_format({'font_size': '12px'})
        sheet.set_column('B:B', 15)
        sheet.set_column('C:C', 15)
        sheet.set_column('D:D', 16)
        sheet.set_column('E:E', 11)
        sheet.set_column('F:F', 11)
        sheet.set_column('G:G', 15)
        sheet.set_column('H:H', 19)
        sheet.set_column('I:I', 15)
        sheet.merge_range('C2:I3', 'Manufacturing Orders', head_format)
        if data['date_from']:
            sheet.write('C6', 'From:', cell_format)
            sheet.merge_range('D6:E6', data['date_from'], txt_head)
        if data['state'] and self.state:
            sheet.write('C7', 'State:', cell_format)
            sheet.merge_range('D7:E7', data['state'], txt_head)
        else:
            sheet.write('C7', 'State:', cell_format)
        row = 9
        col = 2
        sheet.write(row, col, 'Reference', cell_format)
        sheet.write(row, col + 1, 'Product', cell_format)
        sheet.write(row, col + 2, 'Quantity', cell_format)
        sheet.write(row, col + 3, 'Unit', cell_format)
        sheet.write(row, col + 4, 'Responsible', cell_format)
        sheet.write(row, col + 5, 'Start Date', cell_format)
        sheet.write(row, col + 6, 'State', cell_format)
        for rec in data['mrp']:
            row += 1
            sheet.write(row, col, rec['name'])
            sheet.write(row, col + 1, rec['product'])
            sheet.write(row, col + 2, rec['quantity'])
            sheet.write(row, col + 3, rec['unit'])
            sheet.write(row, col + 4, rec['responsible'])
            sheet.write(row, col + 5, rec['start_date'])
            sheet.write(row, col + 6, rec['state'])
        workbook.close()
        output.seek(0)
        response.stream.write(output.read())
        output.close()



class MrpBomReportLine(models.Model):
    _name = "mrp.bom_report_line"
    _auto = False
    _description = "MRP BOM Report Line"

    warehouse_id = fields.Many2one('stock.warehouse', string='Warehouse')
    product_id = fields.Many2one('product.product', string='Product')
    quantity = fields.Float(string='Số lượng')
    product_uom_qty = fields.Float(string='Số lượng cần sử dụng')
    product_qty = fields.Float(string='Số lượng thực tế')
    should_consume_qty = fields.Float(string='Số lượng cần sử dụng')
