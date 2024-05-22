# -*- coding: utf-8 -*-
{
    'name': "Customize Login Page",

    'summary': "Customize Login Page",

    'description': """
    This module offers users the ability to personalize their login experience by uploading background images or selecting background color schemes. This feature enhances visual appeal, fosters brand consistency, and creates a user-friendly authentication environment. Users can preview 
    real-time changes and align the login page with their aesthetic preferences or organizational branding.
    """,
    'category': 'Tools',
    'version': '0.1',
    'license': 'LGPL-3',
    'price': 0,
    'currency': 'USD',

    # any module necessary for this one to work correctly
    'depends': ['base', 'base_setup', 'web', 'auth_signup'],
    'data': [
        'security/ir.model.access.csv',
        'views/res_config_settings_views.xml',
        'views/login_image.xml',
        'views/assets.xml',
        'views/left_login_template.xml',
        'views/right_login_template.xml',
        'views/middle_login_template.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    "images": ["static/description/banner.png"],
}

