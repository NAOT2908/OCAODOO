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
                if update_qty != 0:
                    qty = move.product_uom_qty + update_qty
                    move.write({'product_uom_qty':qty})
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
            # move.write({'product_uom_qty': move.product_uom_qty + 1})
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



