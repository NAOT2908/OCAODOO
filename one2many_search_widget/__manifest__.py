# -*- coding: utf-8 -*-

{
    'name': 'One2many Search Widget',
    'version': '17.0.1.0.0',
    'category': 'Extra Tools',
    'summary': 'Quick Search Feature For One2many Fields In Odoo',
    'description': """This module enables users to search for text within
    One2many fields. The rows that match the search criteria will be displayed,
    while others will be hidden.""",
    'author': '',
    'company': '',
    'website': "",
    'depends': ['web'],
    'assets': {
        'web.assets_backend': [
            'one2many_search_widget/static/src/css/header.css',
            'one2many_search_widget/static/src/fields/one2manysearch/one2manysearch.js',
            'one2many_search_widget/static/src/fields/one2manysearch/one2manysearch_template.xml',
        ],
    },
    'images': ['static/description/banner.png'],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    "application": False,
}
