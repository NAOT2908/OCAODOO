# -*- coding: utf-8 -*-

from odoo import models, fields, api

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
    
   

class StockPicking(models.Model):
    _inherit = 'stock.picking'

    def button_validate(self):
      
      res = super(StockPicking, self).button_validate()
      for pk in self:
          self.update_picking_data(pk.move_ids)
        
      return res

    def update_picking_data(self,moves):
        for move in moves:
            origin = move.picking_id.origin
            data = {}
            move_dests = move.move_dest_ids
            for m in move_dests:
                if origin != m.picking_id.origin and origin:
                    data['origin'] = origin
                m.picking_id.write(data)
                self.update_picking_data(move_dests)
                break
            break    