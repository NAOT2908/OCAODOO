import 'package:inven_barcode_app/models/company.dart';

/// Odoo Session Object

/// Represents session with Odoo server.
class OdooSession {
  /// Current Session id
  final String id;

  /// User's database id
  final int userId;

  /// User's partner database id
  final int partnerId;

  /// User's company database id
  final int companyId;

  /// User's login
  final String userLogin;

  /// User's name
  final String userName;

  /// User's language
  final String userLang;

  /// User's Time zone
  final String userTz;

  /// Is internal user or not
  final bool isSystem;

  /// Is internal user or not
  final bool isAdmin;

  /// Database name
  final String dbName;

  /// Server Major version
  final String serverVersion;

  final List<Company> allowedCompanies;

  final Map<String, dynamic>? userContext;

  /// [OdooSession] is immutable.
  const OdooSession({
    required this.id,
    required this.userId,
    required this.partnerId,
    required this.companyId,
    required this.userLogin,
    required this.userName,
    required this.userLang,
    required this.userTz,
    required this.isSystem,
    required this.isAdmin,
    required this.dbName,
    required this.serverVersion,
    required this.allowedCompanies,
    this.userContext,
  });

  /// Creates [OdooSession] instance from odoo session info object.
  static OdooSession fromSessionInfo(Map<String, dynamic> info) {
    final ctx = info['user_context'] as Map<String, dynamic>;
    List<dynamic> versionInfo;
    versionInfo = [9];
    if (info.containsKey('server_version_info')) {
      versionInfo = info['server_version_info'];
    }

    final List<Company> companies = info['user_companies'] != null
        ? (info['user_companies']['allowed_companies'].entries.map((comInfo) {
            final result = Company.fromJson(comInfo.value);
            return result;
          }).toList())
            .cast<Company>()
        : List<Company>.empty();

    return OdooSession(
      id: info['id'] as String? ?? '',
      userId: info['uid'] as int,
      partnerId: info['partner_id'] as int,
      companyId: info['user_companies'] != null
          ? info['user_companies']['current_company'] as int
          : 0,
      allowedCompanies: companies,
      userLogin: info['username'] as String,
      userName: info['name'] as String,
      userLang: ctx['lang'] as String,
      userTz: ctx['tz'] is String ? ctx['tz'] as String : 'UTC',
      isSystem: info['is_system'] as bool,
      isAdmin: info['is_admin'] as bool,
      dbName: info['db'] as String,
      serverVersion: versionInfo[0].toString(),
      userContext: info['user_context'],
    );
  }

  /// Stores [OdooSession] to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'partnerId': partnerId,
      'companyId': companyId,
      'userLogin': userLogin,
      'userName': userName,
      'userLang': userLang,
      'userTz': userTz,
      'isSystem': isSystem,
      'isAdmin': isAdmin,
      'dbName': dbName,
      'serverVersion': serverVersion,
      'allowedCompanies': allowedCompanies,
      'userContext': userContext,
    };
  }

  /// Restore [OdooSession] from JSON
  static OdooSession fromJson(Map<String, dynamic> json) {
    return OdooSession(
      id: json['id'] as String,
      userId: json['userId'] as int,
      partnerId: json['partnerId'] as int,
      companyId: json['companyId'] as int,
      userLogin: json['userLogin'] as String,
      userName: json['userName'] as String,
      userLang: json['userLang'] as String,
      userTz: json['userTz'] as String,
      isSystem: json['isSystem'] as bool,
      isAdmin: json['isAdmin'] as bool,
      dbName: json['dbName'] as String,
      serverVersion: json['serverVersion'].toString(),
      allowedCompanies: (json['allowedCompanies'] as List).map((item) {
        return Company.fromJson(item);
      }).toList(),
      userContext: json['userContext'],
    );
  }

  /// Returns new OdooSession instance with updated session id
  OdooSession updateSessionId(String newSessionId) {
    return OdooSession(
      id: newSessionId,
      userId: newSessionId == '' ? 0 : userId,
      partnerId: newSessionId == '' ? 0 : partnerId,
      companyId: newSessionId == '' ? 0 : companyId,
      userLogin: newSessionId == '' ? '' : userLogin,
      userName: newSessionId == '' ? '' : userName,
      userLang: newSessionId == '' ? '' : userLang,
      userTz: newSessionId == '' ? '' : userTz,
      isSystem: newSessionId == '' ? false : isSystem,
      isAdmin: newSessionId == '' ? false : isAdmin,
      dbName: newSessionId == '' ? '' : dbName,
      serverVersion: newSessionId == '' ? '' : serverVersion,
      allowedCompanies: newSessionId == '' ? [] : allowedCompanies,
      userContext: newSessionId == '' ? null : userContext,
    );
  }

  /// [serverVersionInt] returns Odoo server major version as int.
  /// It is useful for for cases like
  /// ```dart
  /// final image_field = session.serverVersionInt >= 13 ? 'image_128' : 'image_small';
  /// ```
  int get serverVersionInt {
    // Take last two chars for name like 'saas~14'
    final serverVersionSanitized = serverVersion.length == 1
        ? serverVersion
        : serverVersion.substring(serverVersion.length - 2);
    return int.tryParse(serverVersionSanitized) ?? -1;
  }
}
