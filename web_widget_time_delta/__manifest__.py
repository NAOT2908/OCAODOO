# -*- coding: utf-8 -*-
{
    "name": """Web Widget Time Delta""",
    "summary": """Added Time Delta Human friedly for From and List""",
    "category": "Project",
    "images": ['static/description/icon.png'],
    "version": "17.0.24.06.04",
    "description": """
    
            update: round True
            update: fix for bootstrap hide 
            
            XML string:
            For Form View - added = widget="time_delta"
            For List View - added = widget="time_delta"
            
            <field name="duration" widget="time_delta" options="{'mask_humanize_string': 'h,m',  'mask_picker_field' : ''}" />
            
            XML field:
            <field 
                    name="duration" widget="time_delta" 
                    options="{'mask_humanize_field': 'duration_scale', 'mask_picker_field' : 'duration_picker'}" 
                    class="oe_inline"
            />
            
            PYTHON
            duration = fields.Integer(string='Plan Duration') store in seconds.
            
            duration_scale = fields.Char(string='Duration Scale', related="project_id.duration_scale", readonly=True, )
            duration_picker = fields.Selection(string='Duration Picker', related="project_id.duration_picker", readonly=True, )

            
            Selection 
            @api.model
            def _get_duration_picker(self):
                value = [
                    ('day', _('Day')),
                    ('second', _('Second')),
                    ('day_second', _('Day Second'))
                ]
            return value


    """,

    "author": "Viktor Vorobjov",
    "license": "LGPL-3",
    "website": "https://www.youtube.com/watch?v=xbAoC_s5Et0&list=PLmxcMU6Ko0NkqpGLcC44_GXo3_41pyLNx",
    "support": "vostraga@gmail.com",
    "price": 0.00,
    "currency": "EUR",

    "depends": [
        "web"
    ],
    "external_dependencies": {"python": [], "bin": []},
    "data": [
    ],
    "qweb": [
    ],
    "demo": [],

    'assets': {

        'web.assets_backend': [
            '/web_widget_time_delta/static/src/js/timedelta_field.js',
            '/web_widget_time_delta/static/src/js/timedelta_field.xml',
            '/web_widget_time_delta/static/src/css/timedelta_field.css',

            '/web_widget_time_delta/static/src/lib/duration-picker/jquery-duration-picker.css',
            '/web_widget_time_delta/static/src/lib/duration-humanize/humanize-duration.js',
            '/web_widget_time_delta/static/src/lib/duration-picker/jquery-duration-picker.js',

        ],

        "web.assets_qweb": [
            "/web_widget_time_delta/static/src/xml/qweb_template.xml",
        ],
    },

    "post_load": None,
    "pre_init_hook": None,
    "post_init_hook": None,
    "installable": True,
    "auto_install": False,
    "application": False,
}
