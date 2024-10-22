import 'package:inven_barcode_app/models/user.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/providers/user_provider.dart';

class UserRepository {
  final OdooClient odooClient;

  late UserProvider _userProvider;

  UserRepository({required this.odooClient}) {
    _userProvider = UserProvider(odooClient: odooClient);
  }

  Future<User> fetchUser({required int userId }) async {
    final result = await _userProvider.fetchUserDetail(userId: userId);

    return User.fromJson(result);
  }
}