import 'package:collection/collection.dart';
import 'package:intl/intl.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_location.dart';
import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/stock_picking_type.dart';

class StockPicking {
  int? id;
  String? name;
  StockPickingType? stockPickingType;
  StockLocation? location;
  StockLocation? destLocation;
  StockPickingStatusEnum? state;
  String? barcode;
  String? barcodeImage;
  DateTime? scheduledDate;

  List<StockMove>? stockMoves;

  StockPicking({
    this.id,
    this.name,
    this.stockPickingType,
    this.location,
    this.destLocation,
    this.state,
    this.stockMoves,
    this.barcode,
    this.barcodeImage,
    this.scheduledDate,
  });

  String scheduledDateString() {
    if (scheduledDate == null) {
      return '';
    }

    return DateFormat('yyyy-MM-dd hh:mm:ss').format(scheduledDate!);
  }

  factory StockPicking.fromJson(Map<String, dynamic> data) {
    final state = data['state'] != null
        ? StockPickingStatusEnum.values
            .firstWhereOrNull((item) => item.name == data['state'])
        : null;

    final scheduledDate = data['scheduled_date'] != null
        ? DateFormat('yyyy-MM-dd hh:mm:ss').parse(data['scheduled_date'])
        : null;

    return StockPicking(
      id: data['id'] != null ? data['id'] as int : null,
      name: data['name'] != null ? data['name'] as String : null,
      stockPickingType: data['picking_type'],
      location: data['location'],
      destLocation: data['dest_location'],
      stockMoves: data['stock_moves'],
      state: state,
      barcode: data['barcode'] != null && data['barcode'] != false
          ? data['barcode']
          : null,
      barcodeImage:
          data['barcode_image'] != null && data['barcode_image'] != false
              ? data['barcode_image']
              : null,
      scheduledDate: scheduledDate,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'picking_type': stockPickingType,
      'location': location,
      'dest_location': destLocation,
      'stock_moves': stockMoves,
      'state': state?.name,
      'barcode': barcode,
      'barcode_image': barcodeImage,
      'scheduled_date': scheduledDate != null
          ? DateFormat('yyyy-MM-dd hh:mm:ss').format(scheduledDate!)
          : null,
    };
  }
}