import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class StockPickingTypeProvider {
  final OdooClient odooClient;

  final String basePath = '/api/stock-picking-type';

  const StockPickingTypeProvider({required this.odooClient});
}