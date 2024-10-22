import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_location.dart';
import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/stock_move_line.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/models/stock_picking_type.dart';
import 'package:inven_barcode_app/models/unit_of_measure.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/providers/stock_picking_provider.dart';

class StockPickingRepository {
  final OdooClient odooClient;

  late StockPickingProvider _stockPickingProvider;

  StockPickingRepository({required this.odooClient}) {
    _stockPickingProvider = StockPickingProvider(odooClient: odooClient);
  }

  Future<Map<String, dynamic>> fetchPaginationList(
      {required StockPickingTypeEnum type, int page = 1}) async {
    final result =
        await _stockPickingProvider.fetchPaginationList(type: type, page: page);

    if (result['success']) {
      final data = result['data'];

      print("=== REPO ====");
      print(data);
      print(page);
      print("=== REPO ====");

      final stockList =
          List<Map<String, dynamic>>.from(data['picking_records']).map((item) {
        final pickingType = StockPickingType.fromJson(item['picking_type']);

        final location = StockLocation.fromJson(item['location']);

        final destLocation = StockLocation.fromJson(item['dest_location']);

        return StockPicking.fromJson({
          ...item,
          'location': location,
          'dest_location': destLocation,
          'picking_type': pickingType,
        });
      }).toList();

      return {
        'has_more': data['has_more'],
        'data': stockList,
      };
    }

    return {
      'has_more': false,
      'data': [],
    };
  }

  Future<StockPicking> fetchDefaultValues(
      {required StockPickingTypeEnum type}) async {
    final result = await _stockPickingProvider.fetchDefaultValues(type: type);

    if (result['success']) {
      final data = result['data'];

      final pickingType = StockPickingType.fromJson({
        'id': data['picking_type_id'] as int,
        'name': data['picking_type_name'] as String,
      });

      final location = StockLocation.fromJson({
        'id': data['location_id'] as int,
        'name': data['location_name'] as String,
      });

      final destLocation = StockLocation.fromJson({
        'id': data['location_dest_id'] as int,
        'name': data['location_dest_name'] as String,
      });

      return StockPicking.fromJson({
        'picking_type': pickingType,
        'location': location,
        'dest_location': destLocation,
      });
    }

    throw Exception(result['error']);
  }

  Future<StockPicking> fetchDefaultFromSourceBarcode(
      {required StockPickingTypeEnum type, required String barcode}) async {
    final result = await _stockPickingProvider.fetchDefaultFromSourceBarcode(
      type: type,
      barcode: barcode,
    );

    if (result['success']) {
      final data = result['data'];

      final pickingType = data['picking_type_id'] != false
          ? StockPickingType.fromJson({
              'id': data['picking_type_id'] as int,
              'name': data['picking_type_name'] as String,
            })
          : null;

      final location = data['location_id'] != false
          ? StockLocation.fromJson({
              'id': data['location_id'] as int,
              'name': data['location_name'] as String,
            })
          : null;

      final destLocation = data['location_dest_id'] != false
          ? StockLocation.fromJson({
              'id': data['location_dest_id'] as int,
              'name': data['location_dest_name'] as String,
            })
          : null;

      return StockPicking.fromJson({
        'picking_type': pickingType,
        'location': location,
        'dest_location': destLocation,
      });
    }

    throw Exception(result['error']);
  }

  Future<StockPicking> fetchDefaultFromDestBarcode(
      {required StockPickingTypeEnum type, required String barcode}) async {
    final result = await _stockPickingProvider.fetchDefaultFromDestBarcode(
      type: type,
      barcode: barcode,
    );

    if (result['success']) {
      final data = result['data'];

      final pickingType = data['picking_type_id'] != false
          ? StockPickingType.fromJson({
              'id': data['picking_type_id'] as int,
              'name': data['picking_type_name'] as String,
            })
          : null;

      final location = data['location_id'] != false
          ? StockLocation.fromJson({
              'id': data['location_id'] as int,
              'name': data['location_name'] as String,
            })
          : null;

      final destLocation = data['location_dest_id'] != false
          ? StockLocation.fromJson({
              'id': data['location_dest_id'] as int,
              'name': data['location_dest_name'] as String,
            })
          : null;

      return StockPicking.fromJson({
        'picking_type': pickingType,
        'location': location,
        'dest_location': destLocation,
      });
    }

    throw Exception(result['error']);
  }

  Future<int> createStockPicking(Map<String, dynamic> data) async {
    final result = await _stockPickingProvider.createStockPicking(data: data);

    if (result['success']) {
      return result['picking_id'];
    }

    throw Exception(result['error']);
  }

  Future<StockPicking> fetchStockPicking({required int id}) async {
    final result = await _stockPickingProvider.fetchStockPicking(id: id);

    if (result['success']) {
      Map<String, dynamic> data = result['data'];

      data['location'] = StockLocation.fromJson(data['location']);

      data['dest_location'] = StockLocation.fromJson(data['dest_location']);

      data['picking_type'] = StockPickingType.fromJson(data['picking_type']);

      data['stock_moves'] =
          List<Map<String, dynamic>>.from(data['move_lines']).map((moveData) {
        moveData['product_uom'] =
            UnitOfMeasure.fromJson(moveData['product_uom']);
        moveData['product_id'] = moveData['product']['id'];
        moveData['name'] = moveData['product']['name'];

        if (data['state'] == StockPickingStatusEnum.done.name) {
          final moveLineData =
              List<Map<String, dynamic>>.from(moveData['move_line_ids'])
                  .map((lineData) {
            return StockMoveLine.fromJson(lineData);
          }).toList();

          moveData['move_lines'] = moveLineData;
        }

        return StockMove.fromJson(moveData);
      }).toList();

      return StockPicking.fromJson(data);
    }

    throw Exception(result['error']);
  }

  Future<bool> validateStockPicking({
    required int id,
    required List<Map<String, dynamic>> data,
    bool createBackorder = false,
  }) async {
    final result = await _stockPickingProvider.validateStockPicking(
      id: id,
      data: data,
      createBackorder: createBackorder,
    );

    return result['success'];
  }
}
