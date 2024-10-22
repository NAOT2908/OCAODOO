import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class StockPickingProvider {
  final OdooClient odooClient;

  final String basePath = '/api/stock-picking';

  StockPickingProvider({required this.odooClient});

  Future<Map<String, dynamic>> fetchPaginationList(
      {required StockPickingTypeEnum type, required int page}) async {
    return await odooClient.callAPI(basePath, {
      'picking_type': type.value,
      'page': page,
    });
  }

  Future<Map<String, dynamic>> fetchDefaultValues(
      {required StockPickingTypeEnum type}) async {
    return await odooClient.callAPI('$basePath/create', {
      'picking_type': type.name,
    });
  }

  Future<Map<String, dynamic>> fetchDefaultFromSourceBarcode({
    required StockPickingTypeEnum type,
    required String barcode,
  }) async {
    final result =
        await odooClient.callAPI('$basePath/default-from-source-barcode', {
      'barcode': barcode,
      'type': type.value,
    });

    return result;
  }

  Future<Map<String, dynamic>> fetchDefaultFromDestBarcode({
    required StockPickingTypeEnum type,
    required String barcode,
  }) async {
    final result =
        await odooClient.callAPI('$basePath/default-from-dest-barcode', {
      'barcode': barcode,
      'type': type.value,
    });

    return result;
  }

  Future<Map<String, dynamic>> createStockPicking(
      {required Map<String, dynamic> data}) async {
    return await odooClient.callAPI('$basePath/store', data);
  }

  Future<Map<String, dynamic>> fetchStockPicking({required int id}) async {
    return await odooClient.callAPI('$basePath/show', {'id': id});
  }

  Future<Map<String, dynamic>> validateStockPicking({
    required int id,
    required List<Map<String, dynamic>> data,
    bool createBackorder = false,
  }) async {
    return await odooClient.callAPI('$basePath/validate', {
      'picking_id': id,
      'move_lines_data': data,
      'create_backorder': createBackorder,
    });
  }
}
