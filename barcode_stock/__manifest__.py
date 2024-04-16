# -*- coding: utf-8 -*-

{
    'name': "Barcode Stock",
    'summary': "Stock Customizations",
    'description': "Stock Customizations",
    'author': "Toan",
    'website': "",

    # Categories can be used to filter modules in modules listing
    'license': 'Other proprietary',
    'version': '1.0',

    # Any module necessary for this one to work correctly
    'depends': [
        'base','stock','stock_account','base_automation',
        'mail',
    ],

    # always loaded
    'data': [
        # 'security/securities.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        # 'report/report.xml',
        # 'report/report_templates.xml',
        'data/data.xml',
        'views/res_config_settings.xml',
        # 'views/stock_inventory_views.xml',
    ],

    'assets': {
        'web.assets_backend': [
              'barcode_stock/static/src/**/*.js',
              'barcode_stock/static/src/**/*.scss',
              'barcode_stock/static/src/**/*.xml',
         ],
        'web.assets_qweb': [
         ],
     },

    'qweb': [
    ],

    # only loaded in demonstration mode
    'demo': [
    ],
    "images":['smartbiz_stock/static/description/barcode.png'],

    # Application settings
    'installable': True,
    'application': True,
    'sequence': 10,
}
