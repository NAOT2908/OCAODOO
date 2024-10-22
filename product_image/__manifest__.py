# -*- coding: utf-8 -*-
{
    "name": "Order Line Images",
    "version": "17.0.1.0.0",
    "category": '',
    "summary": "",
    "description": """Order Line Images In Sale, Purchase, Stock, odoo 17, order line images""",
    'author': '',
    'company': '',
    'maintainer': '',
    "website": "",
    "depends": [
        'sale_management', 'stock', 'purchase'
    ],
    "data": [
        'views/sale_order_line_views.xml',
        'views/res_config_settings_views.xml',
        'report/sale_order_report.xml',
        'views/purchase_order_line_view.xml',
        'views/view_stock_picking.xml'
    ],
    'assets': {
        'web.assets_backend': {
            'product_image/static/src/**/*.js',
            'product_image/static/src/**/*.xml',
        }
    },
    'images': ['static/description/banner.jpg'],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
