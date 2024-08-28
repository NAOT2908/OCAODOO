# -*- coding: utf-8 -*-
{
    'name': 'Merge RFQ',
    'version': '17.0.1.0.0',
    'category': 'Purchases',
    'summary': """This module merege two or more RFQ by cancelling or deleting
        the others in RFQ and RFQ sent state.""",
    'description': """'Merge RFQ' is a module for Odoo 17 that allows users to 
    merge multiple Requests for Quotations (RFQs) into a single one by 
    cancelling or deleting the others in RFQ and RFQ sent state.""",
    'author': '',
    'maintainer': '',
    'company': '',
    'website': '',
    'depends': ['purchase', 'sale_management', "sale", "base"],
    'data': [
        'security/ir.model.access.csv',
        'wizard/merge_wizard.xml',
        'views/inherit_sale_order_view.xml',
        'wizard/merge_sale_wizard.xml',
    ],
    'images': ['static/description/banner.jpg'],
    'installable': True,
    'auto_install': False,
    'application':False,
}
