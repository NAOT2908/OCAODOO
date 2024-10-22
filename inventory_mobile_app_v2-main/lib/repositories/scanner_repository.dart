import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/providers/scanner_provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScannerRepository {
  final OdooClient odooClient;

  late ScannerProvider _scannerProvider;

  ScannerRepository({ required this.odooClient }) {
    _scannerProvider = ScannerProvider(odooClient: odooClient);
  }

  Future<Map<String, dynamic>> findByBarcode({ required Barcode barcode}) async {
    final result = await _scannerProvider.findByBarcode(barcode: barcode.rawValue!);

    if (result['success']) {
      return result['data'];
    }

    throw Exception(result['error']);
  }
}