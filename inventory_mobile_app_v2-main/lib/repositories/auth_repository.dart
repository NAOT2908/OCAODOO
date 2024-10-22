import 'package:inven_barcode_app/commons/config.dart';
import 'package:inven_barcode_app/models/odoo_session.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class AuthRepository {
  const AuthRepository();

  Future<OdooSession> authenticate({
    required OdooClient odooClient,
    required String username,
    required String password,
  }) async {
    return await odooClient.authenticate(username, password);
  }

  Future<bool> checkModules({required OdooClient odooClient}) async {
    final modules = await odooClient.callKw({
      'model': 'ir.module.module',
      'method': 'search_read',
      'args': [
        [
          [
            'state',
            'in',
            ['installed']
          ]
        ]
      ],
      'kwargs': {
        'fields': ['name'],
      }
    });

    if (List<Map<String, dynamic>>.from(modules)
        .map((item) => item['name'])
        .contains(Config.requiredModule)) {
      return true;
    }

    return false;
  }
}
