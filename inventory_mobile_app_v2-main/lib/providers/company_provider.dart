import 'odoo_client_provider.dart';

class CompanyProvider {
  final OdooClient odooClient;

  const CompanyProvider({required this.odooClient});

  Future<dynamic> loadUserCompanyList(int userId) async {
    List<dynamic> users = await odooClient.callKw({
      'model': 'res.users',
      'method': 'search_read',
      'args': [],
      'kwargs': {
        'domain': [
          ['id', '=', userId]
        ],
        'fields': ['id', 'company_ids'],
      },
    });

    List<int> companyIds = users[0]['company_ids'].cast<int>();

    return await odooClient.callKw({
      'model': 'res.company',
      'method': 'search_read',
      'args': [],
      'kwargs': {
        'domain': [
          ['id', 'in', companyIds]
        ]
      }
    });
  }
}
