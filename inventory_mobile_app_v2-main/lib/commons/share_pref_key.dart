enum SharePrefKey {
  // Odoo Login - Authenticate
  authSession,
  authWebsite,
  authDB,
}

extension SharePrefKeyExt on SharePrefKey {
  String get value {
    switch (this) {
      case SharePrefKey.authSession:
        return 'AUTH_SESSION';
      case SharePrefKey.authWebsite:
        return 'AUTH_WEBSITE';
      case SharePrefKey.authDB:
        return 'AUTH_DB';
      default:
        throw Exception('Share key not exists');
    }
  }
}
