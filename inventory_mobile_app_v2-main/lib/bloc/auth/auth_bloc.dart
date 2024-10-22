import 'dart:async';
import 'dart:convert';

import 'package:collection/collection.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/auth/auth_event.dart';
import 'package:inven_barcode_app/bloc/auth/auth_state.dart';
import 'package:inven_barcode_app/commons/share_pref_key.dart';
import 'package:inven_barcode_app/models/odoo_session.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/repositories/auth_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;
  StreamSubscription<OdooSession>? _odooSubscription;

  AuthBloc({required this.authRepository}) : super(const AuthState()) {
    on<StartInitOdooClientEvent>(_handleInitOdooClientEvent);
    on<StartLoginEvent>(_handleLoginEvent);
    on<StartLogoutEvent>(_handleLogoutEvent);
    on<SaveWebsiteEvent>(_handleSaveWebsiteEvent);
    on<SaveDBEvent>(_handleSaveDBEvent);
    on<CheckRequiredModuleEvent>(_handleCheckRequiredModuleEvent);
    on<ResetWebsiteOrDbEvent>(_handleResetWebsiteOrDbEvent);
  }

  void _onSessionChanged(OdooSession odooSession) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString(
        SharePrefKey.authSession.value, jsonEncode(odooSession.toJson()));
  }

  Future<void> _handleInitOdooClientEvent(
      StartInitOdooClientEvent event, Emitter<AuthState> emit) async {
    OdooSession? session;

    SharedPreferences prefs = await SharedPreferences.getInstance();
    final sessionStr = prefs.getString(SharePrefKey.authSession.value);
    final website = prefs.getString(SharePrefKey.authWebsite.value);
    String? selectedDb = prefs.getString(SharePrefKey.authDB.value);
    List<String> dbList = [];

    int step = 1;

    if (sessionStr != null) {
      final sessionJson = jsonDecode(sessionStr);

      session = OdooSession.fromJson(sessionJson);
      step = 3;
    }

    final odooClient = OdooClient(session);

    if (website != null) {
      odooClient.setBaseURL(website);

      try {
        final resultDBList =
            await odooClient.callRPC('/web/database/list', 'call', {});

        dbList = List<String>.from(resultDBList);

        if (selectedDb != null &&
            dbList.firstWhereOrNull((item) => item == selectedDb) != null) {
          odooClient.setDBName(selectedDb);

          step = step != 3 ? 2 : 3;
        } else {
          selectedDb = dbList[0];
          step = 2;
        }
      } catch (e) {
        step = 1;
      }
    } else {
      step = 1;
    }

    // Check have requirement modules
    bool checkModule = false;
    if (step == 3) {
      try {
        await odooClient.checkSession();

        checkModule = await authRepository.checkModules(odooClient: odooClient);
      } catch (e) {}
    }

    _odooSubscription = odooClient.sessionStream.listen(_onSessionChanged);

    emit(state.copyWith(
      odooClient: odooClient,
      isInitedOdoo: true,
      starterStep: step,
      selectedDb: selectedDb,
      dbList: dbList ?? [],
      website: website,
      checkModule: checkModule,
    ));
  }

  Future<void> _handleLoginEvent(
      StartLoginEvent event, Emitter<AuthState> emit) async {
    try {
      emit(state.copyWith(
        loginError: false,
        logOutSuccess: false,
        loginSuccess: false,
      ));

      await authRepository.authenticate(
        odooClient: state.odooClient!,
        username: event.username,
        password: event.password,
      );

      final checkModule = await authRepository.checkModules(
        odooClient: state.odooClient!,
      );

      emit(state.copyWith(
        loginSuccess: true,
        logOutSuccess: false,
        loginError: false,
        checkModule: checkModule,
      ));
    } catch (e) {
      emit(state.copyWith(
        loginError: true,
        logOutSuccess: false,
        loginSuccess: false,
      ));
    }
  }

  Future<void> _handleLogoutEvent(
      StartLogoutEvent event, Emitter<AuthState> emit) async {
    try {
      await state.odooClient?.destroySession();

      SharedPreferences prefs = await SharedPreferences.getInstance();
      prefs.remove(SharePrefKey.authSession.value);

      emit(state.copyWith(
        loginError: false,
        loginSuccess: false,
        logOutSuccess: true,
      ));
    } catch (e) {
      print("Logout Error");
    }
  }

  void _handleSaveWebsiteEvent(
      SaveWebsiteEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(starterError: '', starterLoading: true));

    final odooClient = state.odooClient;

    odooClient?.setBaseURL(event.website);
    SharedPreferences prefs = await SharedPreferences.getInstance();

    prefs.setString(SharePrefKey.authWebsite.value, event.website);

    try {
      final dbList =
          await state.odooClient?.callRPC('/web/database/list', 'call', {});

      emit(state.copyWith(
        odooClient: odooClient,
        dbList: List<String>.from(dbList),
        selectedDb: dbList[0],
        starterStep: 2,
        starterLoading: false,
      ));
    } catch (e) {
      emit(state.copyWith(
        odooClient: odooClient,
        starterError:
            'Không thể kết nối đến website của bạn!. Hãy kiểm tra kết nối hoặc config từ webite cho phép app truy cập.',
        starterLoading: false,
      ));
    }
  }

  _handleSaveDBEvent(SaveDBEvent event, Emitter<AuthState> emit) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();

    final odooClient = state.odooClient;
    odooClient?.setDBName(event.db);

    prefs.setString(SharePrefKey.authDB.value, event.db);
    emit(state.copyWith(
      selectedDb: event.db,
      odooClient: odooClient,
      starterStep: event.nextStep ? state.starterStep + 1 : state.starterStep,
    ));
  }

  Future<void> _handleCheckRequiredModuleEvent(
      CheckRequiredModuleEvent event, Emitter<AuthState> emit) async {
    if (state.odooClient == null) {
      return;
    }

    emit(state.copyWith(
      checkModuleLoading: true,
    ));

    final checkModule = await authRepository.checkModules(
      odooClient: state.odooClient!,
    );

    emit(state.copyWith(
      checkModule: checkModule,
      checkModuleLoading: false,
    ));
  }

  Future<void> _handleResetWebsiteOrDbEvent(
      ResetWebsiteOrDbEvent event, Emitter<AuthState> emit) async {
    final odooClient = state.odooClient;

    if (odooClient == null) {
      return;
    }

    odooClient.dbName = null;

    if (event.onlyDb) {
      emit(state.copyWith(
        starterStep: 2,
        odooClient: odooClient,
      ));
    } else {
      odooClient.baseURL = null;
      emit(state.copyWith(
        starterStep: 1,
        dbList: [],
        odooClient: odooClient,
      ));
    }
  }

  @override
  Future<void> close() {
    state.odooClient?.close();
    _odooSubscription?.cancel();

    return super.close();
  }
}
