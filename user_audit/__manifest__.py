# -*- coding: utf-8 -*-

{
    'name': "User Activity Audit",
    "version": "17.0.1.0.0",
    "category": "Extra Tools",
    "summary": "Tracking user's create, write, read activities",
    "description": "This module helps you to track user's all type of "
                   "activities like create, write, read etc on various models "
                   "and records in all users",
    'author': 'NĐT',
    'website': "",
    'depends': ['web'],
    'data': [
        'security/user_audit_groups.xml',
        'security/ir.model.access.csv',
        'security/user_audit_security.xml',
        'data/user_audit_data.xml',
        'views/user_audit_log_views.xml',
        'views/user_audit_views.xml',
        'wizard/clear_user_log_views.xml',
        'views/user_audit_menus.xml'
    ],
    'assets':
        {
            'web.assets_backend': [
                'user_audit/static/src/js/list_controller.js',
                'user_audit/static/src/js/form_controller.js'
            ]},
    'images': ['static/description/banner.jpg'],
    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': True,
    'sequence': 3,
}
