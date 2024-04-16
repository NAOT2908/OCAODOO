{
    "name": "Google Map Simulator",
    "author": "IdeaCode Academy",

    "images": ['static/description/banner.png'],
    "depends": ["base", "web"],
    "data": [
        "views/google_map_simulation.xml",
        "views/res_config_settings.xml",
        "views/menus.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "google_map_simulation/static/src/**/*",
        ],
    },
    "license": "LGPL-3",

}
