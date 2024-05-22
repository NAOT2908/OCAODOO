# -*- coding: utf-8 -*-

{
    'name': "Advanced Excel Reports",
    "version": "17.0.1.0.0",
    "category": "Sale,Accounting,Warehouse",
    "summary": """For printing excel reports of multiple records""",
    "description": "Print the excel report of the sale,invoice,picking"
                   " of multiple records",
    'depends': ['sale_management', 'account', 'stock'],
    'data': [
        'data/ir_action_data.xml'
    ],
    'assets':
        {
            'web.assets_backend': [
                'advanced_excel_reports/static/src/js/excel_report.js'
            ],
        },
    
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}