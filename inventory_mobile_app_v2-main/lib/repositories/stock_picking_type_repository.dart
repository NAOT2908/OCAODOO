import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/providers/stock_picking_type_provider.dart';

class StockPickingTypeRepository {
  final OdooClient odooClient;
  late StockPickingTypeProvider _stockPickingTypeProvider;

  StockPickingTypeRepository({required this.odooClient}) {
    _stockPickingTypeProvider = StockPickingTypeProvider(odooClient: odooClient);
  }
}