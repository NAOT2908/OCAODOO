class AuthEvent {}

class StartInitOdooClientEvent extends AuthEvent {}

class StartLoginEvent extends AuthEvent {
  final String username;
  final String password;

  StartLoginEvent({required this.username, required this.password});
}

class StartLogoutEvent extends AuthEvent {}

class SaveWebsiteEvent extends AuthEvent {
  final String website;

  SaveWebsiteEvent({required this.website});
}

class SaveDBEvent extends AuthEvent {
  final String db;
  final bool nextStep;

  SaveDBEvent({
    required this.db,
    this.nextStep = false,
  });
}

class CheckRequiredModuleEvent extends AuthEvent {}

class ResetWebsiteOrDbEvent extends AuthEvent {
  final bool onlyDb;

  ResetWebsiteOrDbEvent({this.onlyDb = true});
}