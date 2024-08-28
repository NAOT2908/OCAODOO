# -*- coding: utf-8 -*-
{
    "name": """Gantt Native Web view""",
    "summary": """Added support Gantt Chart Widget View""",
    "category": "Project",


    "depends": [
        'base',
        "web", 
        "web_widget_time_delta"
    ],
    "external_dependencies": {"python": [], "bin": []},
    "data": [
        
    ],
    'assets': {
        'web.assets_backend': [
            'web_gantt_native/static/src/**/*.js',
            'web_gantt_native/static/src/**/*.css',
        ],
        'web.assets_qweb': [
            'web_gantt_native/static/src/**/*.xml',
        ],
       
    },
    
    "demo": [],

    "post_load": None,
    "pre_init_hook": None,
    "post_init_hook": None,
    "installable": True,
    "auto_install": False,
    "application": True,
}
