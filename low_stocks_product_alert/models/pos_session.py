# -*- coding: utf-8 -*-

from odoo import models


class PosSession(models.Model):
    """
    This is an Odoo model for Point of Sale (POS) sessions.
    It inherits from the 'pos.session' model and extends its functionality.

     Methods: _loader_params_product_product(): Adds the 'alert_tag' field to
     the search parameters for the product loader.
    """
    _inherit = 'pos.session'

    def _loader_params_product_product(self):
        """ Adds the 'alert_tag' field to the search parameters for the
        product loader.

        Returns:
            dict: The updated search parameters for the product loader.
        """
        result = super()._loader_params_product_product()
        result['search_params']['fields'].extend(['alert_tag'])
        return result
