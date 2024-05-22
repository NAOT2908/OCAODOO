# -*- coding: utf-8 -*-

from odoo.osv import expression
from odoo import models, fields, api, exceptions,_
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
class Product_Product(models.Model):
    _inherit = ['product.product']
    begin_quantity = fields.Float(string='Begin Quantity', compute='_compute_begin_quantity', store=False)
    begin_weight = fields.Float(string='Begin Weight', compute='_compute_begin_weight', store=False)
    begin_value = fields.Float(string='Begin Value', compute='_compute_begin_value', store=False)
    in_quantity = fields.Float(string='In Quantity', compute='_compute_in_quantity', store=False)
    in_weight = fields.Float(string='In Weight', compute='_compute_in_weight', store=False)
    in_value = fields.Float(string='In Value', compute='_compute_in_value', store=False)
    out_quantity = fields.Float(string='Out Quantity', compute='_compute_out_quantity', store=False)
    out_weight = fields.Float(string='Out Weight', compute='_compute_out_weight', store=False)
    out_value = fields.Float(string='Out Value', compute='_compute_out_value', store=False)
    end_quantity = fields.Float(string='End Quantity', compute='_compute_end_quantity', store=False)
    end_weight = fields.Float(string='End Weight', compute='_compute_end_weight', store=False)
    end_value = fields.Float(string='End Value', compute='_compute_end_value', store=False)


    @api.depends('qty_available')
    def _compute_begin_quantity(self):
        for record in self:
            record.begin_quantity = record.qty_available + record.out_quantity - record.in_quantity

    @api.depends('qty_available')
    def _compute_begin_weight(self):
        for record in self:
            record.begin_weight = record.begin_quantity * record.weight

    @api.depends('qty_available')
    def _compute_begin_value(self):
        for record in self:
            record.begin_value = record.standard_price * record.begin_quantity

    @api.depends('qty_available')
    def _compute_in_quantity(self):
        for record in self:
            domain = []
            from_date = self._context.get('from_date')
            to_date = self._context.get('to_date')
            warehouse = self._context.get('warehouse')
            if warehouse:
                domain = [('location_dest_id.warehouse_id', '=', warehouse),('location_usage', '!=',  'internal'),('location_dest_usage', '=', 'internal')]
            else:
                domain = [('location_usage', 'not in',  ('internal','transit')),('location_dest_usage', 'in', ('internal','transit'))]
            domain = domain + [('product_id', '=', record.id),('date', '>=', from_date),('date', '<', to_date),('state', '=', 'done')]          
            lines = self.env['stock.move.line'].search(domain)
            total_quantity = sum(line.quantity for line in lines)
            record.in_quantity = total_quantity

    @api.depends('qty_available')
    def _compute_in_weight(self):
        for record in self:
            record.in_weight = record.in_quantity * record.weight

    @api.depends('qty_available')
    def _compute_in_value(self):
        for record in self:
            record.in_value = record.standard_price * record.in_quantity

    @api.depends('qty_available')
    def _compute_out_quantity(self):
        for record in self:
            domain = []
            from_date = self._context.get('from_date')
            to_date = self._context.get('to_date')
            warehouse = self._context.get('warehouse')
            if warehouse:
                domain = [('location_id.warehouse_id', '=', warehouse),('location_usage', '=', 'internal'),('location_dest_usage','!=','internal')]
            else:
                domain = [('location_usage', 'in',  ('internal','transit')),('location_dest_usage', 'not in', ('internal','transit'))]
                
            domain = domain + [('product_id', '=', record.id),('date', '>=', from_date),('date', '<', to_date),('state', '=', 'done'),]          
            lines = self.env['stock.move.line'].search(domain)
            total_quantity = sum(line.quantity for line in lines)
            record.out_quantity = total_quantity

    @api.depends('qty_available')
    def _compute_out_weight(self):
        for record in self:
            record.out_weight = record.out_quantity * record.weight

    @api.depends('qty_available')
    def _compute_out_value(self):
        for record in self:
            record.out_value = record.standard_price * record.out_quantity

    @api.depends('qty_available')
    def _compute_end_quantity(self):
        for record in self:
            record.end_quantity = record.qty_available

    @api.depends('qty_available')
    def _compute_end_weight(self):
        for record in self:
            record.end_weight = record.end_quantity * record.weight

    @api.depends('qty_available')
    def _compute_end_value(self):
        for record in self:
            record.end_value =    record.standard_price * record.end_quantity

    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___product_readonly_4','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Product_Template(models.Model):
    _inherit = ['product.template']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___product_readonly_4','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Quant(models.Model):
    _inherit = ['stock.quant']
    warehouse_id = fields.Many2one('stock.warehouse', store='True')


    def action_apply_inventory(self):
        if self.env.user.has_group('smartbiz_stock.group_roles_inventory_adjustment___allow_apply_3') :
            return super().action_apply_inventory()
        raise UserError('Bạn không có quyền để thực hiện tác vụ này. Liên hệ với quản trị để cấp quyền vào nhóm: Kiểm kê - Được phép áp dụng nếu muốn truy cập.')

    def _onchange_product_id(self):
        self = self.sudo()
        super()._onchange_product_id()
        
    def _get_gather_domain_(self, product_id, location_id, lot_id=None, package_id=None, owner_id=None, strict=False):
        domain = [('product_id', '=', product_id.id)]
        if not strict:
            if lot_id:
                domain = expression.AND([['|', ('lot_id', '=', lot_id.ids), ('lot_id', '=', False)], domain])
            if package_id:
                domain = expression.AND([[('package_id', '=', package_id.id)], domain])
            if owner_id:
                domain = expression.AND([[('owner_id', '=', owner_id.id)], domain])
            domain = expression.AND([[('location_id', 'child_of', location_id.id)], domain])
        else:
            domain = expression.AND([['|', ('lot_id', '=', lot_id.ids), ('lot_id', '=', False)] if lot_id else [('lot_id', '=', False)], domain])
            domain = expression.AND([[('package_id', '=', package_id and package_id.id or False)], domain])
            domain = expression.AND([[('owner_id', '=', owner_id and owner_id.id or False)], domain])
            domain = expression.AND([[('location_id', '=', location_id.id)], domain])
        if self.env.context.get('with_expiration'):
            domain = expression.AND([['|', ('expiration_date', '>=', self.env.context['with_expiration']), ('expiration_date', '=', False)], domain])
        return domain

    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___move_readonly_6','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Lot(models.Model):
    _inherit = ['stock.lot']
    product_qty = fields.Float(store='True')


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___move_readonly_6','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Move(models.Model):
    _inherit = ['stock.move']
    lots = fields.Many2many('stock.lot', string='Lots')
    product_id = fields.Many2one('product.product', store='True')
    transfer_request_line_id = fields.Many2one('smartbiz_stock.transfer_request_line', string='Transfer Request Line')


    def _update_reserved_quantity(self, need, location_id, quant_ids=None, lot_id=None, package_id=None, owner_id=None, strict=True):
        if self.lots:
            lot_id = self.lots
        return super()._update_reserved_quantity(need=need,location_id=location_id,quant_ids=quant_ids,lot_id=lot_id,package_id=package_id,owner_id=owner_id,strict=strict)
        
        
    def _get_available_quantity(self, location_id, lot_id=None, package_id=None, owner_id=None, strict=False, allow_negative=False):
        if self.lots:
            lot_id = self.lots
        return super()._get_available_quantity(location_id=location_id,lot_id=lot_id,package_id=package_id,owner_id=owner_id,strict=strict,allow_negative=allow_negative)

    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___move_readonly_6','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Warehouse(models.Model):
    _inherit = ['stock.warehouse']
    customize_reception = fields.Boolean(string='Customize Reception', default = 'True')


    def write(self, vals):
        super().write(vals)
        for warehouse in self:
            input_loc = self.env['stock.location'].search([('barcode', '=',warehouse.code + '-INPUT'),'|',('active', '=', False), ('active', '!=', False)],limit=1)
            quality_loc = self.env['stock.location'].search([('barcode', '=',warehouse.code + '-QUALITY'),'|',('active', '=', False), ('active', '!=', False)],limit=1)
            stock_loc = self.env['stock.location'].search([('barcode', '=',warehouse.code + '-STOCK'),'|',('active', '=', False), ('active', '!=', False)],limit=1)
            
            barcode = warehouse.code + '-INPUT-QC'
            qc_picking_type = self.env['stock.picking.type'].search([('barcode', '=',barcode),'|',('active', '=', False), ('active', '!=', False)],limit=1)
            if not qc_picking_type:
                qc_picking_type = self.env['stock.picking.type'].create({
                    'name': 'Kiểm tra chất lượng', 'barcode': barcode, 'sequence_code': 'INPUT-QC', 'warehouse_id': warehouse.id, 
                    'code': 'internal', 'show_operations': True, 'use_create_lots': False, 'use_existing_lots': True, 
                    'default_location_src_id': input_loc.id, 'default_location_dest_id': quality_loc.id })
            barcode = warehouse.code + '-STORE'
            store_picking_type = self.env['stock.picking.type'].search([('barcode', '=',barcode),'|',('active', '=', False), ('active', '!=', False)],limit=1)
            if not store_picking_type:
                store_picking_type = self.env['stock.picking.type'].create({
                    'name': 'Lưu kho', 'barcode': barcode, 'sequence_code': 'STORE', 'warehouse_id': warehouse.id, 
                    'code': 'internal', 'show_operations': True, 'use_create_lots': False, 'use_existing_lots': True, 
                    'default_location_src_id': quality_loc.id, 'default_location_dest_id': stock_loc.id })
                
            qc_rule = self.env['stock.rule'].search([('location_src_id', '=', input_loc.id), ('location_dest_id', '=', quality_loc.id)],limit=1)
            store_rule_3 = self.env['stock.rule'].search([('location_src_id', '=', quality_loc.id), ('location_dest_id', '=', stock_loc.id)],limit=1)
            store_rule_2 = self.env['stock.rule'].search([('location_src_id', '=', input_loc.id), ('location_dest_id', '=', stock_loc.id)],limit=1)
            if warehouse.reception_steps == 'three_steps' and warehouse.customize_reception:
                qc_picking_type.write({'active':True})
                store_picking_type.write({'active':True,'default_location_src_id': quality_loc.id, 'default_location_dest_id': stock_loc.id})
                qc_rule.write({ 'picking_type_id': qc_picking_type.id })
                store_rule_3.write({ 'picking_type_id': store_picking_type.id })
            elif warehouse.reception_steps == 'two_steps' and warehouse.customize_reception:
                qc_picking_type.write({'active':False})
                store_picking_type.write({'active':True,'default_location_src_id': input_loc.id, 'default_location_dest_id': stock_loc.id})
                store_rule_2.write({ 'picking_type_id': store_picking_type.id })
            else:
                qc_picking_type.write({'active':False})
                store_picking_type.write({'active':False})


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_PickingType(models.Model):
    _inherit = ['stock.picking.type']
    name = fields.Char(store='True')


    def open_picking_kanban(self):
        view_id = self.env.ref('smartbiz_stock.stock_picking_kanban').id
        context = {
            'search_default_picking_type_id': [self.id],
            'search_default_to_do_transfers':1,
            'default_picking_type_id': self.id,
            'default_company_id': self.company_id.id,
        }
        action = {
            'type': 'ir.actions.act_window',       
            'views':[(view_id,'kanban')],
            'name': self.display_name,
            'res_model': 'stock.picking',
            'target': 'current',
            'context':context
        }
        return action

    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Product_Category(models.Model):
    _inherit = ['product.category']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Uom_Uom(models.Model):
    _inherit = ['uom.uom']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Uom_Category(models.Model):
    _inherit = ['uom.category']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_MoveLine(models.Model):
    _inherit = ['stock.move.line']
    picking_type_id = fields.Many2one('stock.picking.type', store='True')


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___move_readonly_6','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Location(models.Model):
    _inherit = ['stock.location']
    capacity = fields.Float(string='Capacity')
    capacity_type = fields.Selection([('quantity','Quantity'),('weight','Weight'),('volume','Volume'),], string='Capacity Type')


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Route(models.Model):
    _inherit = ['stock.route']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Rule(models.Model):
    _inherit = ['stock.rule']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Product_Attribute(models.Model):
    _inherit = ['product.attribute']


    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___configuaration_readonly_5','read':True,'write':False,'create':False,'unlink':True },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class Stock_Picking(models.Model):
    _inherit = ['stock.picking']
    picking_order_ids = fields.Many2many('stock.picking', 'picking_picking_rel_1', 'picking_order_ids_1', 'picking_order_ids_2', string='Picking Order')
    warehouse_id = fields.Many2one('stock.warehouse', string='Warehouse', compute='_compute_warehouse_id', store=True)
    picking_type_id = fields.Many2one('stock.picking.type', store='True')
    transfer_request_id = fields.Many2one('smartbiz_stock.transfer_request', string='Transfer Request')


    @api.depends('picking_type_id')
    def _compute_warehouse_id(self):
        for record in self:
            record.warehouse_id = record.picking_type_id.warehouse_id

    def action_confirm(self):
        for pk in self:
            if any(not record.group_id for record in pk.move_ids):
                group_id = pk.group_id.create({
                    'name': pk.name,
                    'partner_id': pk.partner_id.id,
                    'move_type':'one'
                })
                for move in pk.move_ids:
                    move.write({'group_id':group_id})
        return super().action_confirm()

    @api.model
    def picking_filter_on_barcode(self, barcode):
        """ Searches ready pickings for the scanned product/package/lot.
        """
        barcode_type = None
        nomenclature = self.env.company.nomenclature_id
        if nomenclature.is_gs1_nomenclature:
            parsed_results = nomenclature.parse_barcode(barcode)
            if parsed_results:
                # filter with the last feasible rule
                for result in parsed_results[::-1]:
                    if result['rule'].type in ('product', 'package', 'lot'):
                        barcode_type = result['rule'].type
                        break

        active_id = self.env.context.get('active_id')
        picking_type = self.env['stock.picking.type'].browse(self.env.context.get('active_id'))
        base_domain = [
            ('picking_type_id', '=', picking_type.id),
            ('state', 'not in', ['cancel', 'done', 'draft'])
        ]

        picking_nums = 0
        additional_context = {'active_id': active_id}
        if barcode_type == 'product' or not barcode_type:
            product = self.env['product.product'].search([('barcode', '=', barcode)], limit=1)
            if product:
                picking_nums = self.search_count(base_domain + [('product_id', '=', product.id)])
                additional_context['search_default_product_id'] = product.id
        if self.env.user.has_group('stock.group_tracking_lot') and (barcode_type == 'package' or (not barcode_type and not picking_nums)):
            package = self.env['stock.quant.package'].search([('name', '=', barcode)], limit=1)
            if package:
                pack_domain = ['|', ('move_line_ids.package_id', '=', package.id), ('move_line_ids.result_package_id', '=', package.id)]
                picking_nums = self.search_count(base_domain + pack_domain)
                additional_context['search_default_move_line_ids'] = barcode
        if self.env.user.has_group('stock.group_production_lot') and (barcode_type == 'lot' or (not barcode_type and not picking_nums)):
            lot = self.env['stock.lot'].search([
                ('name', '=', barcode),
                ('company_id', '=', picking_type.company_id.id),
            ], limit=1)
            if lot:
                lot_domain = [('move_line_ids.lot_id', '=', lot.id)]
                picking_nums = self.search_count(base_domain + lot_domain)
                additional_context['search_default_lot_id'] = lot.id
        if not barcode_type and not picking_nums:  # Nothing found yet, try to find picking by name.
            picking_nums = self.search_count(base_domain + [('name', '=', barcode)])
            additional_context['search_default_name'] = barcode

        if not picking_nums:
            if barcode_type:
                return {
                    'warning': {
                        'message': _("No %(picking_type)s ready for this %(barcode_type)s", picking_type=picking_type.name, barcode_type=barcode_type),
                    }
                }
            return {
                'warning': {
                    'title': _('No product, lot or package found for barcode %s', barcode),
                    'message': _('Scan a product, a lot/serial number or a package to filter the transfers.'),
                }
            }

        action = picking_type.open_picking_kanban()
        action['context'].update(additional_context)
        return {'action': action}

    @api.model
    def open_new_picking_barcode(self):
        """ Creates a new picking of the current picking type and open it.

        :return: the action used to open the picking, or false
        :rtype: dict
        """
        context = self.env.context
        if context.get('active_model') == 'stock.picking.type':
            picking_type = self.env['stock.picking.type'].browse(context.get('active_id'))
            if picking_type.exists():
                new_picking = self.create_new_picking(picking_type)
                return new_picking.id
        return False

    @api.model
    def create_new_picking(self, picking_type):
        """ Create a new picking for the given picking type.

        :param picking_type:
        :type picking_type: :class:`~odoo.addons.stock.models.stock_picking.PickingType`
        :return: a new picking
        :rtype: :class:`~odoo.addons.stock.models.stock_picking.Picking`
        """
        # Find source and destination Locations
        location_dest_id, location_id = picking_type.warehouse_id._get_partner_locations()
        if picking_type.default_location_src_id:
            location_id = picking_type.default_location_src_id
        if picking_type.default_location_dest_id:
            location_dest_id = picking_type.default_location_dest_id

        # Create and confirm the picking
        return self.env['stock.picking'].create({
            'user_id': False,
            'picking_type_id': picking_type.id,
            'location_id': location_id.id,
            'location_dest_id': location_dest_id.id,
        })

    def open_new_batch_picking_barcode(self):
        picking_batch = self.env['stock.picking.batch'].create({})
        return picking_batch.id

    def update_batch_picking(self,picking_id,values,batch_id):
        batch_id = self.env['stock.picking.batch'].browse(batch_id)
        batch_id.write(values)
        return self.get_data(picking_id,batch_id.id)

    def get_barcode_data(self,barcode,filters,barcodeType):
        if barcodeType:
            if barcodeType == 'lots':
                record = self.env['stock.lot'].search_read([('name','=',barcode),('product_id','=',filters['product_id'])],limit=1,
                                                           fields=self._get_fields('stock.lot'))
            elif barcodeType == 'products':
                record = self.env['product.product'].search_read([('barcode','=',barcode)],limit=1,
                                                           fields=self._get_fields('product.product'))
            elif barcodeType == 'locations':
                record = self.env['stock.location'].search_read([('barcode','=',barcode)],limit=1,
                                                           fields=self._get_fields('stock.location'))
            elif barcodeType == 'packages':
                record = self.env['stock.quant.package'].search([('name','=',barcode)],limit=1)
                if record:
                    prods = []
                    for quant in record.quant_ids:
                        product_id = quant.product_id.id
                        product_uom_id = quant.product_id.uom_id.id
                        location_id = quant.location_id.id
                        quantity = quant.quantity
                        lot_id = quant.lot_id.id
                        prods.append(
                            {'product_id': product_id, 'location_id': location_id, 'quantity': quantity, 'lot_id': lot_id,'product_uom_id':product_uom_id})
                    record = [{'id': record.id, 'name': record.name, 'location': record.location_id.id, 'products': prods}]
            if record:
                return {'barcode':barcode,'match':True,'barcodeType':barcodeType,'record':record[0],'fromCache':False}
        else:
            if filters:
                record = self.env['stock.lot'].search_read([('name', '=', barcode), ('product_id', '=', filters['product_id'])],
                                                 limit=1, fields=self._get_fields('stock.lot'))
                if record:
                    return {'barcode':barcode,'match':True,'barcodeType':'lots','record':record[0],'fromCache':False}
            record = self.env['product.product'].search_read([('barcode', '=', barcode)], limit=1,
                                                           fields=self._get_fields('product.product'))
            if record:
                return {'barcode': barcode, 'match': True, 'barcodeType': 'products', 'record': record[0],'fromCache':False}

            record = self.env['stock.location'].search_read([('barcode', '=', barcode)], limit=1,
                                                           fields=self._get_fields('stock.location'))
            if record:
                return {'barcode': barcode, 'match': True, 'barcodeType': 'locations', 'record': record[0],'fromCache':False}

            record = self.env['stock.quant.package'].search([('name', '=', barcode)], limit=1)
            if record:
                prods = []
                for quant in record.quant_ids:
                    product_id = quant.product_id.id
                    product_uom_id = quant.product_id.uom_id.id
                    location_id = quant.location_id.id
                    quantity = quant.quantity
                    lot_id = quant.lot_id.id
                    prods.append(
                        {'product_id': product_id, 'location_id': location_id, 'quantity': quantity, 'lot_id': lot_id,'product_uom_id':product_uom_id})
                record = {'id': record.id, 'name': record.name, 'location': record.location_id.id, 'products': prods}
                return {'barcode': barcode, 'match': True, 'barcodeType': 'packages', 'record': record,'fromCache':False}
        return {'barcode': barcode, 'match': False, 'barcodeType': barcodeType, 'record': False,'fromCache':False}

    def _get_fields(self,model):
        if model == 'mrp.production':
            return ['name','state','product_id','product_uom_id','product_uom_qty','qty_produced','qty_producing','date_start','date_deadline','date_finished','company_id']
        if model == 'stock.move':
            return ['state','date','date_deadline','product_id','product_uom','product_uom_qty','quantity','product_qty','location_id','location_dest_id']
        if model == 'stock.move.line':
            return ['state','move_id','date','product_id','product_uom_id','quantity','qty_done','location_id','location_dest_id','package_id','result_package_id','lot_id']
        if model == 'product.product':
            return ['barcode', 'default_code', 'tracking', 'display_name', 'uom_id']
        if model == 'stock.location':
            return ['display_name', 'barcode', 'parent_path']
        if model == 'stock.package.type':
            return ['barcode', 'name']
        if model == 'stock.quant.package':
            return ['name','location_id','quant_ids']
        if model == 'stock.lot':
            return ['name', 'ref', 'product_id','expiration_date','create_date','product_qty']
        if model == 'uom.uom':
            return ['name','category_id','factor','rounding',]
        if model == 'stock.quant':
            return ['product_id','location_id','inventory_date','inventory_quantity','inventory_quantity_set','quantity','product_uom_id','lot_id','package_id','owner_id','inventory_diff_quantity','user_id',]
        return []
        
    def get_data(self,picking_id,batch_id=False):
        if batch_id:
            batch_id = self.env['stock.picking.batch'].browse(batch_id)
            picking = batch_id.picking_ids
        else:
            picking = self.search([['id','=',picking_id]],limit=1)
        moves = picking.move_ids        
        products = moves.product_id      
        uoms = moves.product_uom      
        move_lines = moves.move_line_ids
        packages = move_lines.package_id | move_lines.result_package_id
        lots = move_lines.lot_id|self.env['stock.lot'].search( [('company_id', '=', picking.company_id.id), ('product_id', 'in', products.ids)])
        source_locations = self.env['stock.location'].search([('id', 'child_of', picking.location_id.ids)])
        destination_locations = self.env['stock.location'].search([('id', 'child_of', picking.location_dest_id.ids)])
        locations = move_lines.location_id | move_lines.location_dest_id | moves.location_id | moves.location_dest_id  | source_locations |destination_locations
        mls = []
        mvs = []
        for ml in move_lines:
            mls.append({
            'id':ml.id,
            'move_id':ml.move_id.id,
            'picking_id': ml.picking_id.id,
            'picking_name': ml.picking_id.name,
            'picking_type_code': ml.picking_id.picking_type_id.code or '',
            'state': ml.state,
            'date': ml.date,
            'product_id' :ml.product_id.id,
            'product_name' :ml.product_id.display_name or '',
            'product_barcode': ml.product_id.barcode or '',
            'product_tracking': ml.product_id.tracking,
            'product_uom': ml.product_id.uom_id.name or '',
            'product_uom_id': ml.product_id.uom_id.id,
            'quantity':ml.quantity,
            'lot_id':ml.lot_id.id,
            'lot_name':ml.lot_name or ml.lot_id.name,
            'location_id':ml.location_id.id,
            'location_name':ml.location_id.display_name or '',
            'location_barcode':ml.location_id.barcode or '',
            'location_dest_id':ml.location_dest_id.id,
            'location_dest_name':ml.location_dest_id.display_name or '',
            'location_dest_barcode':ml.location_dest_id.barcode or '',
            'result_package_id':ml.result_package_id.id,
            'result_package_name':ml.result_package_id.name or '',
            'package_id':ml.package_id.id,
            'package_name':ml.package_id.name or '',
            'picked':ml.picked or False,
            'batch_picking_type_id': batch_id.picking_type_id.id if batch_id else False
        })
        for mv in moves:
            picked = all(line.picked for line in mv.move_line_ids)
            mvs.append({
            'id':mv.id,
            'picking_id': mv.picking_id.id,
            'picking_name': mv.picking_id.name,
            'picking_type_code': mv.picking_id.picking_type_id.code or '',
            'state': mv.state,
            'date': mv.date,
            'product_id' :mv.product_id.id,
            'product_name' :mv.product_id.display_name or '',
            'product_barcode': mv.product_id.barcode or '',
            'product_tracking': mv.product_id.tracking,
            'product_uom': mv.product_id.uom_id.name or '',
            'product_uom_id': mv.product_id.uom_id.id,
            'product_uom_qty': mv.product_uom_qty,
            'quantity':mv.quantity,
            'product_qty':mv.product_qty,       
            'location_id':mv.location_id.id,
            'location_name':mv.location_id.display_name or '',
            'location_barcode':mv.location_id.barcode or '',
            'location_dest_id':mv.location_dest_id.id,
            'location_dest_name':mv.location_dest_id.display_name or '',
            'location_dest_barcode':mv.location_dest_id.barcode or '',
            'picked': mv.picked or False,
            'all_lines_picked':picked

        })
        packs = []
        for pack in packages:
            prods = []
            for quant in pack.quant_ids:
                product_id = quant.product_id.id
                product_uom_id = quant.product_id.uom_id.id
                location_id = quant.location_id.id
                quantity = quant.quantity
                lot_id = quant.lot_id.id
                prods.append({'product_id':product_id,'location_id':location_id,'quantity':quantity,'lot_id':lot_id,'product_uom_id':product_uom_id})
            packs.append({'id':pack.id,'name':pack.name,'location':pack.location_id.id,'products':prods})
        data = {           
            'moves': mvs,         
            'move_lines': mls,
            'packages': packs,
            'lots': lots.read(picking._get_fields('stock.lot')),
            'locations': locations.read(picking._get_fields('stock.location')),
            'products': products.read(picking._get_fields('product.product')),
            'uoms':uoms.read(picking._get_fields('uom.uom')),
            'company_id': picking.company_id.id,
            'partner_id':picking.partner_id.id,
            'partner_name':picking.partner_id.name,
            'user_id':picking.user_id.id,
            'user_name': picking.user_id.name,
            # 'note' : picking.note ,
            'location_id':picking.location_id.id,
            'location_dest_id': picking.location_dest_id.id,
            'picking_type_code': batch_id.picking_type_id.code if batch_id else picking.picking_type_id.code,
            'state': batch_id.state if batch_id else picking.state,
            'name': batch_id.name if batch_id else picking.name,
        }
        return data
    def create_move(self,picking_id,values,batch_id=False):
        move = self.env['stock.move'].create(values)
        data = self.get_data(picking_id,batch_id)
        return {'move_id':move.id,'data':data}

    def save_data(self,picking_id,data,batch_id=False):
        quantity = float(data['quantity'])
        package_id = data['package_id'] if 'package_id' in data.keys() else False
        result_package_id = data['result_package_id'] if 'result_package_id' in data.keys()  else False


        if not data['lot_id'] and data['lot_name']:
            lot_id = self.env['stock.lot'].search([('name','=',data['lot_name']),(['product_id','=',data['product_id']])],limit=1)
            if lot_id:
                data['lot_id'] = lot_id.id
            else:
                data['lot_id'] = self.env['stock.lot'].create({'name':data['lot_name'],'product_id':data['product_id']}).id

        update = {'quantity': quantity, 'location_id': data['location_id'],
             'location_dest_id': data['location_dest_id'], 'lot_id': data['lot_id'],'lot_name': data['lot_name'],
             'package_id':package_id,'result_package_id':result_package_id,'picked':True}
        create = { 'product_id': data['product_id'], 'product_uom_id': data['product_uom_id'],
             'quantity': quantity, 'location_id': data['location_id'],'picking_id':data['picking_id'],
             'location_dest_id': data['location_dest_id'], 'lot_id': data['lot_id'], 'lot_name': data['lot_name'],
             'package_id':package_id,'result_package_id':result_package_id,'picked':True}

        if data['id']:
            self.env['stock.move.line'].browse(data['id']).write(update)
        else:
            self.env['stock.move.line'].create(create)
        return self.get_data(picking_id,batch_id)

    def create_pack(self,picking_id,data,package_name,batch_id=False):
        if package_name:
            package = self.env['stock.quant.package'].search([('name','=',package_name)],limit=1)
            if package:
                package_id = package.id
            else:
                package_id = self.env['stock.quant.package'].create({'name':package_name})
        else:
            package_id = self.env['stock.quant.package'].create({})

        data['result_package_id'] = package_id.id
        return self.save_data(picking_id,data,batch_id)

    def delete_move_line(self,picking_id,move_line_id,batch_id=False):
        self.env['stock.move.line'].browse(move_line_id).unlink()
        return self.get_data(picking_id,batch_id)

    def delete_move(self,picking_id,move_id,batch_id=False):
        self.env['stock.move'].browse(move_id).unlink()
        return self.get_data(picking_id,batch_id)

    def done_move_line(self,picking_id,move_line_id,batch_id=False):
        self.env['stock.move.line'].browse(move_line_id)._action_done()
        return self.get_data(picking_id,batch_id)

    def done_move(self,picking_id,move_id,batch_id=False):
        self.env['stock.move'].browse(move_id)._action_done()
        return self.get_data(picking_id,batch_id)

    def barcode_action_done(self,picking_id,batch_id=False):
        if batch_id:
            self.env['stock.picking.batch'].browse(batch_id).action_done()
        else:
            self.browse(picking_id).button_validate()
        return self.get_data(picking_id,batch_id)

    def print_line(self,move_line_id):
        line = self.env['stock.move.line'].browse(move_line_id)
        line.print_label()
    def cancel_picking(self,picking_id):
        self.browse(picking_id).action_cancel()
        return self.get_data(picking_id)



    @api.model
    def check_access_rights(self, operation, raise_exception=True):
        if self.env.su:
            return True
        permissions = [{'group':'smartbiz_stock.group_roles_inventory___move_readonly_6','read':True,'write':False,'create':False,'unlink':False },]
        if any(self.env.user.has_group(perm['group']) for perm in permissions):
            return any(self.env.user.has_group(perm['group']) and perm[operation] for perm in permissions)
        return super().check_access_rights(operation, raise_exception=raise_exception)

class smartbiz_stock_StockReport(models.Model):
    _name = "smartbiz_stock.stock_report"
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = "Stock Report"
    from_date = fields.Date(string='From Date')
    to_date = fields.Date(string='To Date')
    name = fields.Char(string='Name', compute='_compute_name', store=True)
    state = fields.Selection([('not_viewed','Not Viewed'),('viewed','Viewed'),], string= 'Status', readonly= False, copy = True, index = False, default = 'not_viewed')


    @api.depends('from_date', 'to_date')
    def _compute_name(self):
        for record in self:
            record.name = "Từ "+ str(record.from_date) + " Đến " + str(record.to_date)

    def action_not_viewed_view_report(self):
        tree_view_id = self.env.ref('smartbiz_stock.product_product_tree').id
        form_view_id = self.env.ref('smartbiz_stock.product_product_form').id
        pivot_view_id = self.env.ref('smartbiz_stock.product_product_pivot').id
        graph_view_id = self.env.ref('smartbiz_stock.product_product_graph').id
        search_view_id = self.env.ref('smartbiz_stock.product_product_search').id
        domain = [('type', '=', 'product')]
        to_date_obj = self.to_date + timedelta(days=1)
        product_id = self.env.context.get('product_id', False)
        product_tmpl_id = self.env.context.get('product_tmpl_id', False)
        if product_id:
            domain = expression.AND([domain, [('id', '=', product_id)]])
        elif product_tmpl_id:
            domain = expression.AND([domain, [('product_tmpl_id', '=', product_tmpl_id)]])
        # We pass `to_date` in the context so that `qty_available` will be computed across
        # moves until date.
        action = {
            'type': 'ir.actions.act_window',
            'views': [(search_view_id,'search'),(tree_view_id, 'tree'), (form_view_id, 'form'), (pivot_view_id, 'pivot'), (graph_view_id, 'graph')],
            'view_mode': 'tree,form,pivot,graph',
            'name': _('Products'),
            'res_model': 'product.product',
            'search_view_id':search_view_id,
            'domain': domain,
            'context': dict(self.env.context, to_date=to_date_obj,from_date=self.from_date,edit=False,delete=False,create=False,search_default_available_products_filter= 1)
        }
        self.write({'state':'viewed'})
        return action

        
        
    def save_excel(self,workbook,file_name):
        output = BytesIO()
        workbook.save(output)

        #workbook.close()

        # Tạo response
        file_data = base64.b64encode(output.getvalue())
        output.close()

        # Tạo attachment
        attachment = self.env['ir.attachment'].create({
            'name': file_name,
            'type': 'binary',
            'datas': file_data,
            'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'res_model': self._name,
            'res_id': self.id
        })

        # Trả về action để download file
        return {
            'type': 'ir.actions.act_url',
            'url': '/web/content/{attachment.id}?download=true',
            'target': 'new',
        }
        
    def load_excel(self,file_name):
        current_dir = os.path.dirname(__file__)
        # Lùi lại hai cấp thư mục để đến thư mục gốc của module
        module_dir = os.path.abspath(os.path.join(current_dir, os.pardir))

        # Xây dựng đường dẫn đến file template
        template_path = os.path.join(module_dir, 'data', file_name)

        return load_workbook(template_path)

class smartbiz_stock_TransferRequest(models.Model):
    _name = "smartbiz_stock.transfer_request"
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _description = "Transfer Request"
    name = fields.Char(string='Request', default = 'New')
    date = fields.Datetime(string='Date')
    transfer_request_type_id = fields.Many2one('smartbiz_stock.transfer_request_type', string='Transfer Request Type')
    transfer_request_line_ids = fields.One2many('smartbiz_stock.transfer_request_line', 'transfer_request_id')
    picking_ids = fields.One2many('stock.picking', 'transfer_request_id')
    state = fields.Selection([('draft','Draft'),('done','Done'),], string= 'Status', readonly= False, copy = True, index = False, default = 'draft')


    def action_draft_create_order(self):
        Picking = self.env['stock.picking']
        Move = self.env['stock.move']
        
        for record in self.filtered(lambda m: m.state != 'done'):
            pickings = {}
            for trl in record.transfer_request_line_ids:
                default_picking_type = record._get_default_picking_type(trl.product_id)
                temps = []
                for trtd in record.transfer_request_type_id.transfer_request_type_detail_ids:
                    picking_type = trtd.picking_type_id
                    sequence = trtd.sequence
                    location_src = picking_type.default_location_src_id
                    location_dest = picking_type.default_location_dest_id
                    quantity = trl.quantity
                    quants = record.env['stock.quant'].search([('location_id','child_of',location_src.id),('product_id','=',trl.product_id.id),('lot_id','in',trl.lots_ids.ids)])
                    onhand_quantity = sum(quants.mapped('quantity'))
                    temps.append({
                        'product': trl.product_id,
                        'origin':record.name,
                        'quantity': quantity,
                        'onhand_quantity': onhand_quantity,
                        'lots_ids': trl.lots_ids.ids,
                        'picking_type': picking_type,
                        'default_picking_type': default_picking_type,
                        'location_src': location_src,
                        'location_dest': location_dest,
                        'sequence':sequence,
                        'transfer_request_id':record.id,
                        'transfer_request_line_id':trl.id
                    })
                item = record._find_record(temps)
                key = item['picking_type'].id
                if key not in pickings:
                    pickings[key] = []
                pickings[key].append(item)
                
            for picking_type_id, products in pickings.items():
                picking = Picking.create({
                    'picking_type_id': picking_type_id,
                    'location_id': products[0]['location_src'].id,
                    'location_dest_id': products[0]['location_dest'].id,
                    'transfer_request_id': products[0]['transfer_request_id'],
                    'origin': products[0]['origin'],
                    # Thêm các trường khác như partner_id nếu cần
                })

                for product in products:
                    Move.create({
                        'name': product['product'].display_name,
                        'product_id': product['product'].id,
                        'product_uom_qty': product['quantity'],
                        'product_uom': product['product'].uom_id.id,
                        'picking_id': picking.id,
                        'location_id': product['location_src'].id,
                        'location_dest_id': product['location_dest'].id,
                        'transfer_request_line_id': product['transfer_request_line_id'],
                        'lots': product['lots_ids'],
                        # Có thể cần thêm các trường khác tùy thuộc vào logic cụ thể
                    })

                picking.action_confirm()
                #picking.action_assign()

            record.write({'state':'done'})

        
        
    def _find_record(self,records):
        # Bước 1: Lọc ra các bản ghi có "số lượng" > 0
        valid_records = [record for record in records if record['onhand_quantity'] > 0]
        
        if len(valid_records) == 0:
            # Bước 6: Nếu không có bản ghi nào có "số lượng" > 0, lấy bản ghi có "kiểu điều chuyển" bằng "kiểu điều chuyển mặc định"
            default_record = next((record for record in records if record['picking_type'] == record['default_picking_type']), records[0] if records else None)
            return default_record
        
        if len(valid_records) == 1:
            # Bước 3: Nếu chỉ có một bản ghi "số lượng" > 0, lấy bản ghi đó
            return valid_records[0]
        
        # Bước 2: Kiểm tra xem trong số các bản ghi hợp lệ, có bản ghi nào "kiểu điều chuyển" bằng "kiểu điều chuyển mặc định" không
        default_transfer_record = next((record for record in valid_records if record['picking_type'] == record['default_picking_type']), None)
        
        if default_transfer_record:
            # Bước 5: Có bản ghi "kiểu điều chuyển" bằng "kiểu điều chuyển mặc định"
            return default_transfer_record
        else:
            # Bước 4: Lấy bản ghi có "mức độ quan trọng" lớn nhất
            return min(valid_records, key=lambda x: x['sequence'])
            
    def _get_default_picking_type(self,product):
        if '(VW' in product.name:
            return self.env['stock.picking.type'].search([('barcode','=','F58-COMP3-PICK')],limit=1)
        else:
            return self.env['stock.picking.type'].search([('barcode','=','F110-COMP3-PICK')],limit=1)

    @api.model
    def create(self, values):
        if values.get('name', 'New') == 'New':
           values['name'] = self.env['ir.sequence'].next_by_code('smartbiz_stock.transfer_request') or 'New'


        res = super().create(values)


        return res

class smartbiz_stock_TransferRequestLine(models.Model):
    _name = "smartbiz_stock.transfer_request_line"
    _description = "Transfer Request Line"
    product_id = fields.Many2one('product.product', string='Product')
    lots_ids = fields.Many2many('stock.lot', string='Lots')
    quantity = fields.Float(string='Quantity')
    transfer_request_id = fields.Many2one('smartbiz_stock.transfer_request', string='Transfer Request')


class smartbiz_stock_TransferRequestType(models.Model):
    _name = "smartbiz_stock.transfer_request_type"
    _description = "Transfer Request Type"
    name = fields.Char(string='Name')
    transfer_request_type_detail_ids = fields.One2many('smartbiz_stock.transfer_request_type_detail', 'transfer_request_type_id')


class smartbiz_stock_TransferRequestTypeDetail(models.Model):
    _name = "smartbiz_stock.transfer_request_type_detail"
    _description = "Transfer Request Type Detail"
    sequence = fields.Integer(string='Sequence')
    picking_type_id = fields.Many2one('stock.picking.type', string='Picking Type')
    transfer_request_type_id = fields.Many2one('smartbiz_stock.transfer_request_type', string='Transfer Request Type')


class Stock_PickingBatch(models.Model):
    _inherit = ['stock.picking.batch']
    name = fields.Char(store='True')


