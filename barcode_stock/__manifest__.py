# -*- coding: utf-8 -*-

{
    'name': "SmartBiz Barcode",
    'summary': "SmartBiz Stock Customizations",
    'description': "SmartBiz Stock Customizations",
    'author': "SmartBiz",
    'website': "https://www.sbiz.vn",

    # Categories can be used to filter modules in modules listing
    'category': 'SmartBiz Apps',
    'license': 'Other proprietary',
    'version': '1.0',

    # Any module necessary for this one to work correctly
    'depends': [
        'base','stock','stock_account','base_automation',
        'mail',
    ],

    # always loaded
    'data': [
        'security/securities.xml',
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
              'smartbiz_stock/static/src/**/*.js',
              'smartbiz_stock/static/src/**/*.scss',
              'smartbiz_stock/static/src/**/*.xml',
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
