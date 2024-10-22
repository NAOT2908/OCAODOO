# -*- coding: utf-8 -*-

from odoo import models, fields, api # type: ignore

class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'
    _description = 'Sale Order Line'

    note_stock = fields.Char(string="Note")

class StockMove(models.Model):
    _inherit = 'stock.move'

    note_stock = fields.Char(string="Note")

    def _action_confirm(self, merge=True, merge_into=False):
        return super(StockMove, self.sudo())._action_confirm(merge=merge,merge_into=merge_into)

    def _action_done(self, cancel_backorder=False):
        moves = super(StockMove,self)._action_done(cancel_backorder=cancel_backorder)
        for m in moves:
            dest_moves = m.move_dest_ids.filtered(lambda x: x.state not in ['done', 'cancel'])
            quantity = m.product_uom_qty
            dest_quantity = sum(l.product_uom_qty for l in dest_moves )
            update_qty = quantity - dest_quantity
            for move in dest_moves:
                if update_qty < 0 or update_qty > 0:
                    qty = move.product_uom_qty + update_qty
                    move.with_context(force_write=True).write({'product_uom_qty':qty })
                    update_qty = 0
                    move.picking_id.action_assign()
        return moves

class SaleOrder(models.Model):
    _inherit = 'sale.order'
    _description = 'Sale Order'


    def action_confirm(self):
        res =  super(SaleOrder, self).action_confirm()
        for line in self.order_line:
           
            related_moves = self.env['stock.move'].search([('sale_line_id', '=', line.id)])
            self._update_move_notes(related_moves, line.note_stock)
            
        return res

    def _update_move_notes(self, moves, note_stock):
        for move in moves:
            move.write({'note_stock': note_stock})
            self._update_move_notes(move.move_orig_ids, note_stock)


class PurchaseOrder(models.Model):
    _inherit = 'purchase.order' 


    def button_confirm(self):
        res = super(PurchaseOrder, self).button_confirm()
        for picking in self.picking_ids:
            # picking.write({'origin': self.origin})
            if self.origin:
                picking.write({'origin': self.origin})
            else:
                picking.write({'origin': self.name})
        return res
    
class PurchaseOrderCancel(models.TransientModel):
    _name = "purchase.order.cancel"
    _description = "Purchase Orders Cancel"

    def cancel_order(self):
        purchase_orders = self.env['purchase.order'].browse(
            self._context.get('active_ids', []))
        purchase_orders.write({'state': 'cancel'})
        return purchase_orders   

class StockPicking(models.Model):
    _inherit = 'stock.picking'

    attachments_copied = fields.Boolean(default=False, copy=False)

    def button_validate(self):
      res = super(StockPicking, self).button_validate()
      for pk in self:
          self.update_picking_data(pk.move_ids)
      return res

    def update_picking_data(self, moves):
        for move in moves:
            origin = move.picking_id.origin
            partner_id = move.picking_id.partner_id.id
            data = {}
            move_dests = move.move_dest_ids
            for m in move_dests:
                if origin != m.picking_id.origin and origin:
                    data['origin'] = origin
                if partner_id != m.picking_id.partner_id.id and partner_id:
                    data['partner_id'] = partner_id
                if not m.picking_id.attachments_copied:
                    self.copy_attachments(move.picking_id, m.picking_id)
                    data['attachments_copied'] = True
                m.picking_id.write(data)
                self.update_picking_data(move_dests)
                
                break
            break    
    def copy_attachments(self, source_picking, dest_picking):
        # Tìm các tệp đính kèm từ phiếu nguồn
        attachments = self.env['ir.attachment'].search([
            ('res_model', '=', 'stock.picking'),
            ('res_id', '=', source_picking.id)
        ])
        # Sao chép từng tệp đính kèm từ phiếu nguồn sang phiếu đích
        for attachment in attachments:
            attachment.copy({'res_model': 'stock.picking', 'res_id': dest_picking.id})

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


