import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/auth/auth_bloc.dart';
import 'package:inven_barcode_app/commons/scanner_constants.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/page/index_page.dart';
import 'package:inven_barcode_app/page/login_page.dart';
import 'package:inven_barcode_app/page/products/detail/product_detail_page.dart';
import 'package:inven_barcode_app/page/products/list_page/index_page.dart';
import 'package:inven_barcode_app/page/required_module_page.dart';
import 'package:inven_barcode_app/page/scanner_page.dart';
import 'package:inven_barcode_app/page/starter_page.dart';
import 'package:inven_barcode_app/page/stock_picking/delivery_list_page.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/stock_picking_detail_page.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/stock_picking_validate_page.dart';
import 'package:inven_barcode_app/page/stock_picking/internal_list_page.dart';
import 'package:inven_barcode_app/page/stock_picking/new/stock_picking_new_page.dart';
import 'package:inven_barcode_app/page/stock_picking/receipt_list_page.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';

class Routes {
  static final GoRouter router = GoRouter(
    routes: [
      GoRoute(
        path: "/login",
        builder: (context, state) => const LoginPage(),
        name: 'login',
      ),
      GoRoute(
        path: "/starter",
        builder: (context, state) => const StarterPage(),
        name: 'starter',
      ),
      GoRoute(
        path: "/requirement-modules",
        builder: (context, state) => const RequiredModulePage(),
        name: 'modules',
      ),
      GoRoute(
        path: "/",
        builder: (context, state) => const IndexPage(),
        name: 'index',
      ),
      GoRoute(
        path: "/products",
        builder: (context, state) => const ProductListPage(),
        name: 'products.index',
      ),
      GoRoute(
        path: "/products/:id",
        builder: (context, state) {
          final id = state.pathParameters['id'];

          return ProductDetailPage(
            id: int.parse(id!),
          );
        },
        name: 'products.show',
      ),
      GoRoute(
        path: "/receipts",
        builder: (context, state) => const ReceiptListPage(),
        name: 'receipts.index',
      ),
      GoRoute(
        path: "/delivery",
        builder: (context, state) => const DeliveryListPage(),
        name: 'delivery.index',
      ),
      GoRoute(
        path: "/internal",
        builder: (context, state) => const InternalListPage(),
        name: 'internal.index',
      ),
      GoRoute(
        path: "/stock-picking/create",
        builder: (context, state) {
          final typeQuery = state.uri.queryParameters['type'];

          final type = typeQuery != null
              ? StockPickingTypeEnum.values.firstWhere(
                  (type) => type.value == typeQuery,
                  orElse: () => StockPickingTypeEnum.incoming)
              : StockPickingTypeEnum.incoming;

          return StockPickingNewPage(
            type: type,
          );
        },
        name: 'stock_picking.create',
      ),
      GoRoute(
        path: "/stock-picking/:id",
        builder: (context, state) {
          final id = state.pathParameters['id'];

          return StockPickingDetailPage(
            id: int.parse(id!),
          );
        },
        name: 'stock_picking.show',
      ),
      GoRoute(
        path: "/stock-picking/:id/validate",
        builder: (context, state) {
          final id = state.pathParameters['id'];

          return StockPickingValidatePage(
            id: int.parse(id!),
          );
        },
        name: 'stock_picking.validate',
      ),
      GoRoute(
        path: '/scanner',
        builder: (context, state) {
          final typeQuery = state.uri.queryParameters['type'];
          return ScannerPage(
            type: typeQuery != null
                ? ScannerHandlerType.values
                    .firstWhereOrNull((type) => type.value == typeQuery)
                : null,
          );
        },
        name: 'scanner.index',
      ),
    ],
    redirect: (BuildContext context, GoRouterState state) async {
      final authState = context.read<AuthBloc>().state;
      OdooClient? odooClient = authState.odooClient;

      bool isAuthed = true;
      bool isOdooNotInit = odooClient == null ||
          odooClient.baseURL == null ||
          odooClient.dbName == null;

      try {
        if (isOdooNotInit) {
          isAuthed = false;
        } else {
          await odooClient.checkSession();
        }
      } catch (e) {
        isAuthed = false;
      }

      if (!isAuthed) {
        if (isOdooNotInit) {
          return '/starter';
        }

        return '/login';
      } else {
        return authState.checkModule ? null : '/requirement-modules';
      }
    },
  );
}
