import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class ProductProvider {
  final OdooClient odooClient;

  final String basePath = '/api/products';

  ProductProvider({required this.odooClient});

  Future<List<Map<String, dynamic>>> getProductsFromBarcodes(List<String> barcodes) async {
    final result = await odooClient.callAPI('$basePath/get-by-barcodes', {
      'barcodes': barcodes,
    });

    if (result['success']) {
      return List<Map<String, dynamic>>.from(result['data']);
    }

    return [];
  }

  Future<Map<String, dynamic>> fetchProduct({required int id}) async {
    return await odooClient.callAPI('$basePath/show', {'id': id});
  }

  Future<Map<String, dynamic>> fetchProducts({required int page}) async {
    return await odooClient.callAPI(basePath, {'page': page});
  }
}