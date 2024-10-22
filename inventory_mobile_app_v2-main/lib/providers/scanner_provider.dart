import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class ScannerProvider {
  final OdooClient odooClient;

  final String basePath = '/api/scanner';

  ScannerProvider({required this.odooClient});

  Future<Map<String, dynamic>> findByBarcode({ required String barcode}) async {
    return await odooClient.callAPI(basePath, { 'barcode': barcode });
  }
}