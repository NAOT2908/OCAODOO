# -*- coding: utf-8 -*-
{
    'name': "Payment: Vietnamese Bank Base Module",

    'summary': """
        This module is the base module for generator VietQR module.(VietQR is the Vietnam's QR standard for payment)""",

    'description': """
        This module is the base module for generator VietQR module. 
        This module will provided:
        -   All the Vietnamese bank info and bankcode which announced by State Bank of Viet Nam.
        -   Add "default bank account" field to res.company model.
        -   Add VietQR for invoice view form.
    """,

    'author': "UniCube",
    "license": "LGPL-3",
    'category': 'UniCube/Localization',
    'version': '17.0.0.3',
    'website': "https://unicube.vn",
    'support': 'community@unicube.me',
    "application": True,
    "installable": True,

    "images": ["static/description/image.png"],

    # any module necessary for this one to work correctly
    'depends': ['base', 'l10n_vn', 'account_qr_code_emv', "base_vat"],

    # always loaded
    'data': [
        'security/res.group.xml',
        'security/ir.model.access.csv',
        'data/res.bank.csv',
        'data/res_config_settings.xml',
        'reports/paper_format.xml',
        'reports/invoice_receipt.xml',
        'views/account_move.xml',
        'views/ipn_log.xml',
        'views/res_bank_account.xml',
        'views/res_company_info.xml',
        'data/res_partner_bank.xml',
        'data/res_company.xml',
        'menus/bank_menu.xml',
    ],
    'assets': {
        'web.report_assets_common': [
            "unicubevn_bank/static/src/scss/report.scss",
            "unicubevn_bank/static/src/js/print.js"
        ],
        # 'web.assets_backend': [
        #     "unicubevn_bank/static/src/json_field/**/*",
        #
        # ],
    }

}
