# -*- coding: utf-8 -*-
{
    'name': 'Manufacturing Reports',
    'version': '17.0.1.0.1',
    'category': 'Manufacturing',
    'summary': 'PDF & XLS Reports For Manufacturing Module',
    'description': 'PDF & XLS reports for manufacturing module with '
                   'advanced filters.',
    'author': '',
    'website': "",
    'images': ['static/description/banner.png'],
    'company': '',
    'depends': ['mrp'],
    'data': [
        'security/ir.model.access.csv',
        'wizards/mrp_report_views.xml',
        'reports/mrp_report_templates.xml',
        'reports/mrp_report_reports.xml',
        'views/mrp_report_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'manufacturing_reports/static/src/js/action_manager.js',
        ]
    },
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
