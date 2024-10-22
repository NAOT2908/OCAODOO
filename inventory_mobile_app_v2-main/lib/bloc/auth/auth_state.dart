import 'package:equatable/equatable.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class AuthState extends Equatable {
  final OdooClient? odooClient;

  final bool isInitedOdoo;
  final bool loginSuccess;
  final bool loginError;
  final bool logOutSuccess;
  final bool starterLoading;
  final int starterStep;
  final String? starterError;
  final String? website;
  final List<String>? dbList;
  final String? selectedDb;
  final bool checkModule;
  final bool checkModuleLoading;

  const AuthState({
    this.odooClient,
    this.isInitedOdoo = false,
    this.loginSuccess = false,
    this.loginError = false,
    this.logOutSuccess = false,
    this.starterStep = 1,
    this.starterLoading = false,
    this.starterError,
    this.website,
    this.dbList,
    this.selectedDb,
    this.checkModule = false,
    this.checkModuleLoading = false,
  });

  @override
  List<Object?> get props => [
        odooClient,
        isInitedOdoo,
        loginSuccess,
        loginError,
        logOutSuccess,
        starterStep,
        starterLoading,
        starterError,
        website,
        dbList,
        selectedDb,
        checkModule,
      ];

  AuthState copyWith({
    OdooClient? odooClient,
    bool? isInitedOdoo,
    bool? loginSuccess,
    bool? loginError,
    bool? logOutSuccess,
    int? starterStep,
    bool? starterLoading,
    String? starterError,
    String? website,
    List<String>? dbList,
    String? selectedDb,
    bool? checkModule,
    bool? checkModuleLoading,
  }) {
    return AuthState(
      odooClient: odooClient ?? this.odooClient,
      isInitedOdoo: isInitedOdoo ?? this.isInitedOdoo,
      loginSuccess: loginSuccess ?? this.loginSuccess,
      loginError: loginError ?? this.loginError,
      logOutSuccess: logOutSuccess ?? this.logOutSuccess,
      starterStep: starterStep ?? this.starterStep,
      starterLoading: starterLoading ?? this.starterLoading,
      starterError: starterError ?? this.starterError,
      website: website ?? this.website,
      dbList: dbList ?? this.dbList,
      selectedDb: selectedDb ?? this.selectedDb,
      checkModule: checkModule ?? this.checkModule,
      checkModuleLoading: checkModuleLoading ?? this.checkModuleLoading,
    );
  }
}
