import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class UserProvider {
  final OdooClient odooClient;

  UserProvider({required this.odooClient});

  Future<Map<String, dynamic>> fetchUserDetail({required int userId}) async {
    final result =  await odooClient.callRPC(
      '/web/dataset/call_kw/res.users/read',
      'call',
      {
        "model": "res.users",
        "method": "read",
        "args": [
          [userId],
          ["id", 'name', "image_1024"]
        ],
        "kwargs": {}
      },
    );

    return result[0];
  }
}
