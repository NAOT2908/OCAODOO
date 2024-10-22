import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:inven_barcode_app/bloc/auth/auth_bloc.dart';
import 'package:inven_barcode_app/bloc/auth/auth_event.dart';
import 'package:inven_barcode_app/bloc/auth/auth_state.dart';
import 'package:inven_barcode_app/bloc/company/company_bloc.dart';
import 'package:inven_barcode_app/bloc/product/product_bloc.dart';
import 'package:inven_barcode_app/bloc/profile/profile_bloc.dart';
import 'package:inven_barcode_app/bloc/profile/profile_event.dart';
import 'package:inven_barcode_app/bloc/scanner/scanner_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/repositories/auth_repository.dart';
import 'package:inven_barcode_app/repositories/company_repository.dart';
import 'package:inven_barcode_app/repositories/product_repository.dart';
import 'package:inven_barcode_app/repositories/scanner_repository.dart';
import 'package:inven_barcode_app/repositories/stock_picking_repository.dart';
import 'package:inven_barcode_app/repositories/stock_picking_type_repository.dart';
import 'package:inven_barcode_app/repositories/user_repository.dart';
import 'package:inven_barcode_app/router/routes.dart';

void main() async {
  await dotenv.load(fileName: ".env");

  // final prefs = await SharedPreferences.getInstance();
  // await prefs.clear();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return RepositoryProvider<AuthRepository>(
      create: (context) => const AuthRepository(),
      child: BlocProvider(
        create: (context) => AuthBloc(
          authRepository: context.read<AuthRepository>(),
        )..add(StartInitOdooClientEvent()),
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (BuildContext context, AuthState state) {
            OdooClient? odooClient = state.odooClient;

            // Render Index Page without related Bloc
            if (odooClient == null) {
              return Container(
                color: Colors.white,
                child: const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF039E50),
                  ),
                ),
              );
            }

            // Render Full App
            return MultiRepositoryProvider(
              providers: [
                RepositoryProvider<CompanyRepository>(
                  create: (context) =>
                      CompanyRepository(odooClient: odooClient),
                ),
                RepositoryProvider<StockPickingTypeRepository>(
                  create: (context) =>
                      StockPickingTypeRepository(odooClient: odooClient),
                ),
                RepositoryProvider<StockPickingRepository>(
                  create: (context) =>
                      StockPickingRepository(odooClient: odooClient),
                ),
                RepositoryProvider<ProductRepository>(
                  create: (context) =>
                      ProductRepository(odooClient: odooClient),
                ),
                RepositoryProvider<ScannerRepository>(
                  create: (context) =>
                      ScannerRepository(odooClient: odooClient),
                ),
                RepositoryProvider<UserRepository>(
                  create: (context) => UserRepository(odooClient: odooClient),
                ),
              ],
              child: MultiBlocProvider(
                providers: [
                  BlocProvider<CompanyBloc>(
                    create: (context) => CompanyBloc(
                      companyRepository: context.read<CompanyRepository>(),
                    ),
                  ),
                  BlocProvider<StockPickingBloc>(
                    create: (context) => StockPickingBloc(
                      stockPickingRepository:
                          context.read<StockPickingRepository>(),
                      stockPickingTypeRepository:
                          context.read<StockPickingTypeRepository>(),
                      productRepository: context.read<ProductRepository>(),
                    ),
                  ),
                  BlocProvider<ScannerBloc>(
                    create: (context) => ScannerBloc(
                      stockPickingRepository:
                          context.read<StockPickingRepository>(),
                      scannerRepository: context.read<ScannerRepository>(),
                    ),
                  ),
                  BlocProvider<ProductBloc>(
                    create: (context) => ProductBloc(
                      productRepository: context.read<ProductRepository>(),
                    ),
                  ),
                  BlocProvider<ProfileBloc>(
                    create: (context) => ProfileBloc(
                      userRepository: context.read<UserRepository>(),
                    ),
                  ),
                ],
                child: const MyMaterialApp(),
              ),
            );
          },
        ),
      ),
    );
  }
}

class MyMaterialApp extends StatefulWidget {
  const MyMaterialApp({
    super.key,
  });

  @override
  State<MyMaterialApp> createState() => _MyMaterialAppState();
}

class _MyMaterialAppState extends State<MyMaterialApp> {
  @override
  void initState() {
    super.initState();

    final userId = context.read<AuthBloc>().state.odooClient!.sessionId?.userId;
    context.read<ProfileBloc>().add(FetchProfileEvent(userId: userId));
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: Routes.router,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF039E50),
          secondary: const Color(0xFF989898),
          tertiary: const Color(0xFF626262),
        ),
        useMaterial3: true,
      ),
    );
  }
}
