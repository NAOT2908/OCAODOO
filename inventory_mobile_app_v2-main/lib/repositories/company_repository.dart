import 'package:inven_barcode_app/models/company.dart';
import 'package:inven_barcode_app/providers/company_provider.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class CompanyRepository {
  final OdooClient odooClient;
  late CompanyProvider _companyProvider;

  CompanyRepository({required this.odooClient}) {
    _companyProvider = CompanyProvider(odooClient: odooClient);
  }

  Future<List<Company>> getUserCompanyList() async {
    final res = await _companyProvider
        .loadUserCompanyList(odooClient.sessionId?.userId as int);

    return List<dynamic>.from(res).map((item) {
      return Company.fromJson(item);
    }).toList();
  }
}
