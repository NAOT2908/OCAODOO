# -*- coding: utf-8 -*-

{
    'name': "Web Apps",
    'summary': "Web Apps",
    'description': "Web Apps",
    'author': "",
    'website': "",

    # Categories can be used to filter modules in modules listing
    'category': '',
    'license': 'Other proprietary',
    'version': '1.0',

    # Any module necessary for this one to work correctly
    'depends': [
        'base',
        'mail',
    ],
    'excludes': ['web_enterprise'],
    # always loaded
    'data': [
        'security/securities.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        'report/report.xml',
        'report/report_templates.xml',
        # 'data/data.xml',
    ],

    'assets': {
        'web._assets_primary_variables': [
            # ('after', 'web/static/src/scss/primary_variables.scss', 'smartbiz/static/src/**/*.variables.scss'),
            ('before', 'web/static/src/scss/primary_variables.scss', 'web_client/static/src/scss/primary_variables.scss'),
        ],
        'web._assets_secondary_variables': [
            ('before', 'web/static/src/scss/secondary_variables.scss', 'web_client/static/src/scss/secondary_variables.scss'),
        ],
        'web._assets_backend_helpers': [
            ('before', 'web/static/src/scss/bootstrap_overridden.scss', 'web_client/static/src/scss/bootstrap_overridden.scss'),
        ],
        'web.assets_frontend': [
            'web_client/static/src/webclient/home_menu/home_menu.scss', # used by login page
            'web_client/static/src/webclient/navbar/navbar.scss',
        ],
        'web.assets_backend': [
            #'web_client/static/src/**/*.js',
            #'web_client/static/src/**/*.scss',
            
            'web_client/static/src/webclient/navbar/navbar.scss',
            'web_client/static/src/webclient/navbar/navbar.variables.scss',
            'web_client/static/src/webclient/home_menu/home_menu.scss',

            'web_client/static/src/core/**/*',
            'web_client/static/src/webclient/**/*.js',
            'web_client/static/src/webclient/**/*.xml',
           
         ],
        
        'web.assets_web': [
            ('replace', 'web/static/src/main.js', 'web_client/static/src/main.js'),
        ],
        
     },

    'qweb': [
    ],

    # only loaded in demonstration mode
    'demo': [
    ],

    # Application settings
    'installable': True,
    'application': False,
}
