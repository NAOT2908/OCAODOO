# -*- coding: utf-8 -*-
from odoo import api, fields, models, modules


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    style = fields.Selection([('default', 'Default'), ('left', 'Left'), ('right', 'Right'), ('middle', 'Middle')], help='Select Background Align')
    background = fields.Selection([('image', 'Image'), ('color', 'Color'),('gradient', 'Gradient')], default='color', help='Select Background Type')
    background_image = fields.Many2one('login.image', string="Image", help='Select Background Image For Login Page')
    color = fields.Char(string="Color", help="Choose your Background color")
    bgcolor_1 = fields.Char(string="Color", help="Background color")
    bgcolor_2 = fields.Char(string="Color", help="Background color gradient")
    bgcolor_3 = fields.Char(string="Color", help="Background color gradient")

    @api.onchange('background')
    def onchange_background(self):
        if self.background == 'image':
            self.color = False
        elif self.background == 'color':
            self.background_image = False
        else:
            self.background_image = self.color = False

    @api.onchange('style')
    def onchange_style(self):
        if self.style == 'default' or self.style is False:
            self.background = self.background_image = self.color = False

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        image_id = int(self.env['ir.config_parameter'].sudo().get_param('login_background.background_image'))
        res.update(
            background_image=image_id,
            color=self.env['ir.config_parameter'].sudo().get_param('login_background.color'),
            bgcolor_1=self.env['ir.config_parameter'].sudo().get_param('login_background.bgcolor_1'),
            bgcolor_2=self.env['ir.config_parameter'].sudo().get_param('login_background.bgcolor_2'),
            bgcolor_3=self.env['ir.config_parameter'].sudo().get_param('login_background.bgcolor_3'),
            background=self.env['ir.config_parameter'].sudo().get_param('login_background.background'),
            style=self.env['ir.config_parameter'].sudo().get_param('login_background.style'),
        )
        return res

    def set_values(self):
        super(ResConfigSettings, self).set_values()
        param = self.env['ir.config_parameter'].sudo()

        set_image = self.background_image.id or False
        set_color = self.color or False
        bgcolor_1 = self.bgcolor_1 or False
        bgcolor_2 = self.bgcolor_2 or False
        bgcolor_3 = self.bgcolor_3 or False
        set_background = self.background or False
        set_style = self.style or False

        param.set_param('login_background.background_image', set_image)
        param.set_param('login_background.color', set_color)
        param.set_param('login_background.bgcolor_1', bgcolor_1)
        param.set_param('login_background.bgcolor_2', bgcolor_2)
        param.set_param('login_background.bgcolor_3', bgcolor_3)
        param.set_param('login_background.background', set_background)
        param.set_param('login_background.style', set_style)
