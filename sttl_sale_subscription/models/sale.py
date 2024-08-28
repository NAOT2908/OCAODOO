from odoo import fields,models,api
from datetime import date
from odoo.exceptions import UserError


class Sale(models.Model):
    _inherit = 'sale.order'

    recurrance_id = fields.Many2one(comodel_name='product.subscription.period', string='Recurrence')
    recurr_until = fields.Date(string='Until')
    next_invoice_date = fields.Date(string='Next Invoice Date')
    recurring_started = fields.Boolean(string='Recurring Started')
    subscription_status = fields.Selection(string='Subscription Status', selection=[('a', 'Pending'), ('b', 'Running'),('c','End')],default="a")
    

    @api.onchange("order_line")
    def onchange_line_ids(self):
        recuring = non_recurring = False
        for rec in self.order_line:
            if rec.product_id:
                if rec.product_id.is_recurring:
                    recuring = True
                else:
                    non_recurring = True
        if recuring and non_recurring:
            raise UserError("Currently we don't support recurring and non recurring products togather")                

    @api.model_create_multi
    def create(self,vals):
        result = super(Sale,self).create(vals)
        for rec in result:
            recuring = non_recurring = False
            for line in rec.order_line:
                if line.product_id:
                    if line.product_id.is_recurring:
                        recuring = True
                    else:
                        non_recurring = True
            if recuring and non_recurring:
                raise UserError("Currently we don't support recurring and non recurring products togather")
        return result
    
    def write(self,vals):
        result = super(Sale,self).write(vals)
        for rec in self:
            recuring = non_recurring = False
            for line in rec.order_line:
                if line.product_id:
                    if line.product_id.is_recurring:
                        recuring = True
                    else:
                        non_recurring = True
            if recuring and non_recurring:
                raise UserError("Currently we don't support recurring and non recurring products together")  
        return result

    @api.onchange('recurrance_id')
    def _onchange_recurrance_id(self):
        if self.recurrance_id:
            for rec in self.order_line:
                if rec.product_id.is_recurring:
                    price = self.env['product.subscription.pricing'].search([('period_id','=',rec.order_id.recurrance_id.id),('product_id','=',rec.product_id.id)],limit=1).price
                    rec.price_unit = price       

    def action_create_recurring_invoices(self):
        to_invoice_found = False
        for line in self.order_line:
            if line.product_id.is_recurring and line.invoice_status == "to invoice":
                to_invoice_found = True
        if to_invoice_found:
            return {
                'name': "Create Invoice",
                'type': 'ir.actions.act_window',
                'res_model': 'sale.advance.payment.inv',
                'view_type': '',
                'view_mode': 'form',
                'target': 'new',
                'domain': [],
                'context': {
                    'active_model': 'sale.order',
                    'active_id': self.id,
                },
            }
        else:
            raise UserError("All the recurring products are invoiced. Please use normal Create Invoice button")

    def generate_recurring_invoices(self):

        orders = self.env['sale.order'].search([('next_invoice_date','=',datetime.datetime.today().date()),('state','=','sale'),('subscription_status','=','b')])
        for order in orders:
            do_copied = False
            do_cpy = False
            for line in order.order_line:
                if not do_copied and line.product_id.is_recurring and line.invoice_status != "to invoice" :
                    if line.product_id.type != 'service':
                        do_cpy = line.move_ids[0].picking_id.copy() #Copying 1 picking in order to avoid multiple pickings with same delivery 
                        do_cpy.state = 'assigned' # Change state to ready
                        do_copied = True
                        #Assign done qtties in order to validate automatically  
                        for move in do_cpy.move_ids_without_package:
                            move.quantity_done = move.product_uom_qty
                    else:
                        if line.product_id.invoice_policy == 'order':
                            if not line.prev_added_qty:
                                line.prev_added_qty = line.product_uom_qty
                            line.product_uom_qty = line.product_uom_qty +  line.prev_added_qty
                        else:
                            line.qty_delivered += line.product_uom_qty
                if line.product_id.invoice_policy == 'order':
                    qty = False
                    if do_cpy:
                        for do_cpy_line in do_cpy.move_ids_without_package:
                            if do_cpy_line.product_id == line.product_id:
                                qty = do_cpy_line.product_uom_qty

                        line.product_uom_qty += qty
                        self.action_invoice(order)

            # if do_cpy:
            #     do_cpy.button_validate()
            #     order.invoice_status = 'to invoice'  

            self.action_invoice(order)         
            # self.env.cr.commit()
            

            # End subscription is today is last recurring date
            if order.recurr_until and order.next_invoice_date:        
                if order.recurr_until <= order.next_invoice_date:
                    order.subscription_status = 'c'

    def action_invoice(self,order):
        #Create Invoice if order is ready to be invoiced            
        if order.invoice_status == 'to invoice':
            # invoice = self.env['sale.advance.payment.inv'] \
            # .with_context({
            #     'active_model': 'sale.order',
            #     'active_id': order.id,
            # }).create({})._create_invoices(order)
            invoice = order._create_invoices()
            invoice.action_post()

    def end_subscription(self):
        return {
            'name': "Choose a Reason",
            'type': 'ir.actions.act_window',
            'res_model': 'close.reason.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'rec_id': self.id
            },
        }

    def renew_subscription(self):
        self.subscription_status = 'b'

    def send_notification(self):
        default_duration = 10
        sale_orders = self.search([('next_invoice_date', '!=', False), ('subscription_status', '=', 'b')])
        notification_duration = self.env['ir.config_parameter'].get_param('sttl_sale_subscription.notification_duration')
        if notification_duration == False:
            notification_duration = default_duration
        for order in sale_orders:
            date_diff = (order.next_invoice_date - date.today()).days
            if int(notification_duration) == date_diff:
                template_id = self.env.ref('sttl_sale_subscription.sale_subscription_notification_template').id
                template = self.env["mail.template"].browse(template_id)
                template.send_mail(order.id, force_send=True)



class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    prev_added_qty = fields.Float(string='Previous Added Qty')
    subscription_status = fields.Selection(string='Subscription Status', selection=[('a', 'Pending'), ('b', 'Running'),('c','End')],related="order_id.subscription_status",store=True)


    def _compute_price_unit(self):
        super(SaleOrderLine, self)._compute_price_unit()
        for rec in self:
            if rec.product_template_id:
                if rec.product_template_id.is_recurring:
                    if rec.order_id.recurrance_id:
                        price = self.env['product.subscription.pricing'].search([('period_id','=',rec.order_id.recurrance_id.id),('product_id','=',rec.product_id.id)],limit=1).price
                        rec.price_unit = price
                        self.env['product.subscription.pricing'].search([('period_id','=',rec.order_id.recurrance_id.id)])
                        self.env['product.subscription.pricing'].search([('product_id','=',rec.product_id.id)])