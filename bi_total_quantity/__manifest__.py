# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.
{
    'name': "Products/Items Total Number of Quantities",
    'version': '17.0.0.0',
    'category': 'Sale',
    'summary': "Ordered Products Total Number of Quantity Delivered Total Quantity Items Invoiced Count Total Received Quantities Billed Items Quantity of Total Total Number of Demand Product Quantities Sales Total Qty for Stock Picking Total Items of Quantity in Purchase",
    'description': """
    	The Total Number of Items/Quantity odoo app is a powerful tool that helps businesses easily track the number of ordered quantity, number of delivered quantity, and number of invoiced quantity of items in their sale and purchase order, Also can see the number of demand quantity and number of done quantity for inventory.
    	
        Total Items Quantity for Sale Orders
        Total Items Quantity for Purchase Orders
        Total Items Quantity for Delivery Orders
    """,
    'author': "Browseinfo",
    'website': "https://www.browseinfo.com ",
    'depends': ['base','sale_management','purchase','account','stock'],
    'data': [
        'views/sale_order_views.xml',
        'views/purchase_order_views.xml',
        'views/stock_picking_views.xml',
    ],
    
    'installable': True,
    'application': True,
    'auto_install': False,
    "license": 'OPL-1',
    'live_test_url': 'https://youtu.be/xdVoR04TKn8',
    "images":['static/description/Total-number-of-items-Quantity.gif'],
}
