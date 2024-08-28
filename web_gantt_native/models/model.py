# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
import logging
from lxml import etree

import datetime
from dateutil import tz
import pytz
import time
from string import Template
from datetime import datetime, timedelta
from odoo.exceptions import Warning
from pdb import set_trace as bp

from itertools import groupby
from operator import itemgetter

from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)  # Need for message in console.


class GanttPreprocessor(models.AbstractModel):
    _name = 'gantt.native.predecessor'
    
    @api.model
    def _get_link_type(self):
        value = [
            ('FS', _('Finish to Start (FS)')),
            ('SS', _('Start to Start (SS)')),
            ('FF', _('Finish to Finish (FF)')),
            ('SF', _('Start to Finish (SF)')),

        ]
        return value
        
    type = fields.Selection('_get_link_type',
                        string='Type',
                        required=True,
                        default='FS')
    @api.model
    def _get_lag_type(self):
        value = [
            ('minute', _('minute')),
            ('hour', _('hour')),
            ('day', _('day')),
            ('percent', _('percent')),
        ]
        return value

    lag_qty = fields.Integer(string='Lag', default=0)
    lag_type = fields.Selection('_get_lag_type',
                                string='Lag type',
                                required=True,
                                default='day')

class GanttTool(models.Model):
    _name = 'gantt.native.tool'
    
    @api.model
    def exist_model(self,model_name):
        return True
    
    
    @api.model
    def open_model(self,name_model, name_field):
        return name_model
                                

