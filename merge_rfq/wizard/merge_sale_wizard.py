# -*- coding: utf-8 -*-
# type: ignore
from odoo import fields, api, models, _
from odoo.exceptions import UserError
from datetime import datetime


class MergeSaleOrder(models.TransientModel):
    _name = 'merge.sale.order'
    name = fields.Char(string="Name")
    merge_type = fields.Selection(selection=[
        ('new_cancel', 'Create new quotation and cancel all selected quotation'),
        ('new_delete', 'Create new quotation and delete all selected quotation'),
        ('merge_cancel', 'Merge quotation on existing selected quotation and cancel others'),
        (
        'merge_delete', 'Merge quotation on existing selected quotation and delete others')],
        default='new_cancel'
    )
    sale_order_id = fields.Many2one('sale.order', 'Sale Order')
    customer_id = fields.Many2one('res.partner', string='Customer')
    
    @api.onchange('merge_type')
    def onchange_merge_type(self):
        res = {'domain': {}}
        
        if self.merge_type in ['merge_cancel', 'merge_delete', 'new_cancel', 'new_delete']:
            sale_orders = self.env['sale.order'].browse(self._context.get('active_ids', []))
            
            res['domain']['sale_order_id'] = [('id', 'in', [sale.id for sale in sale_orders])]
            res['domain']['customer_id'] = [('id', 'in', sale_orders.mapped('partner_id.id'))]
    
        return res
    
    def merge_orders(self):
        sale_orders = self.env['sale.order'].browse(self._context.get('active_ids', []))
        if len(self._context.get('active_ids', [])) < 2:
            raise UserError(_('Please select more than one Quotation'))
        
        if any( order.state not in ['draft', 'sent'] for order in sale_orders):
            raise UserError(_('Please select more Sales Orders which are in Quotation stage to perform the the Merge Operation'))
        
        if self.merge_type == 'new_cancel' or self.merge_type == 'new_delete':
            sale_order_id = self.env['sale.order'].create({
                'partner_id': self.customer_id.id,
                'merge_date': datetime.now(),
                'merge_user_id': self.env.user.id,
                'merge_sale_orders': ", ".join(sale_orders.mapped('name')),
                'is_merge_order': True,
            })
            order_line_ids = sale_orders.mapped('order_line')
            for line in order_line_ids:
                line_id = sale_order_id.order_line.filtered(lambda l: l.product_id.ì == line.product_id)
                
                if line_id:
                    line_id[0].write({'product_uom_qty': line_id.product_uom_qty + line.product_uom_qty})
                else:
                    line_data = {
                        'product_id': line.product_id.id,
                        'product_template_id': line.product_template_id.id,
                        'name': line.name,
                        'product_uom_qty': line.product_uom_qty,
                        'product_uom': line.product_uom.id,
                        'price_unit': line.price_unit,
                        'tax_id': [(6, 0, [tax.id for tax in line.tax])],
                        'price_subtotal': line.price_subtotal,
                        'custtomer_lead': line.custtomer_lead,
                        'order_id': sale_order_id.id or False,
                    }
                    self.env['sale.order.line'].create(line_data)
                    sale_orders.write({'state' : 'cancel'})
            if self.merge_type == 'new_delete':
                sale_orders.unlink()   
                     
        if self.merge_type == 'merge_cancel' or self.merge_type == 'merge_delete':
            sale_order_id = self.sale_order_id      
            processed_products = {}
            sale_order_id.write({
                'merge_date': datetime.now(),
                'merge_user_id': self.env.user.id,
                'merge_sale_orders': ",".join(sale_orders.mapped('name')),
                'is_merge_order': True,
            })
            for line in sale_order_id.order_line:
                product_id = line.product_id.id
                if product_id in processed_products:
                    processed_products[product_id].write(
                        {'product_uom_qty': processed_products[product_id].product_uom_qty + line.product_uom_qty}
                    )
                    line.unlink()
                else:
                    processed_products[product_id] = line
            
            for order in sale_orders:
                if order != sale_order_id:
                    order.write({'state': 'cancel'})
                    order_line_ids = order.mapped('order_line')        
                    for line in order_line_ids:
                        line_id = sale_order_id.order_line.filtered(lambda l: l.product_id.id == line.product_id.id)
                        
                        if line_id:
                            line_id[0].write(
                                {'product_uom_qty': line_id.product_uom_qty + line.product_uom_qty}
                                
                            )
                        else:
                            line_data = {
                                'product_id': line.product_id.id,
                                'product_template_id': line.product_template_id.id,
                                'name': line.name,
                                'product_uom_qty': line.product_uom_qty,
                                'product_uom': line.product_uom.id,
                                'price_unit': line.price_unit,
                                'tax_id': [(6, 0, [tax.id for tax in line.tax_id])],
                                'price_subtotal': line.price_subtotal,
                                'customer_lead': line.customer_lead,
                                'order_id': sale_order_id.id or False,
                            }
                            self.env['sale.order.line'].create(line_data)
                    if self.merge_type == 'merge_delete':
                        order.unlink()
                  
                    