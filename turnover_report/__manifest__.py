# -*- coding: utf-8 -*-
{
    'name': 'Turnover Analysis Report',
    'version': '17.0.1.0.0',
    'summary': """A module for generate inventory turnover analysis report.""",
    'description': """This will helps you to generate inventory turnover 
    analysis report in pdf, xlsx, tree view and graph view.""",
    'category': "Warehouse",
    'author': '',
    'website': "",
    'depends': ['base', 'stock', 'sale', 'purchase'],
    'data': [
        'security/ir.model.access.csv',
        'views/fetch_data_views.xml',
        'views/turnover_graph_analysis_views.xml',
        'report/turnover_report_templates.xml',
        'views/turnover_report_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'turnover_report/static/src/js/action_manager.js',
        ],
    },
    'images': ['static/description/banner.jpg'],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
