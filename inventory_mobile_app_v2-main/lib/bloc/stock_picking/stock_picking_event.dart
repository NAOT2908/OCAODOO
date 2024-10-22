import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class StockPickingEvent {}

class FetchDefaultValuesEvent extends StockPickingEvent {
  final StockPickingTypeEnum type;

  FetchDefaultValuesEvent({required this.type});
}

class FetchSourceLocationByBarcode extends StockPickingEvent {
  final String barcode;
  final StockPickingTypeEnum type;

  FetchSourceLocationByBarcode({
    required this.barcode,
    required this.type,
  });
}

class FetchProductsFromBarcodes extends StockPickingEvent {
  final List<Barcode> barcodes;

  FetchProductsFromBarcodes({required this.barcodes});
}

class FetchMoveLinesFromBarcodes extends StockPickingEvent {
  final List<Barcode> barcodes;

  FetchMoveLinesFromBarcodes({required this.barcodes});
}

class UpdateStockPickingLocationEvent extends StockPickingEvent {
  final StockPicking data;
  final bool isUpdateSourceLocation;
  final StockPickingTypeEnum stockType;

  UpdateStockPickingLocationEvent({
    required this.data,
    this.isUpdateSourceLocation = false,
    required this.stockType,
  });
}

class UpdateStockMoveQtyEvent extends StockPickingEvent {
  final int productId;
  final double qty;

  UpdateStockMoveQtyEvent({required this.productId, required this.qty});
}

class SaveStockPickingEvent extends StockPickingEvent {
  final StockPicking stockPicking;

  SaveStockPickingEvent({required this.stockPicking});
}

class ResetCreateStockPickingEvent extends StockPickingEvent {}

class FetchStockPickingEvent extends StockPickingEvent {
  final int id;

  FetchStockPickingEvent({required this.id});
}

class ValidateStockPickingEvent extends StockPickingEvent {
  final bool createBackorder;

  ValidateStockPickingEvent({this.createBackorder = false});
}

class LoadStockPickingListEvent extends StockPickingEvent {
  final StockPickingTypeEnum type;
  final int page;

  LoadStockPickingListEvent({required this.type, this.page = 1});
}

class UpdateStockMoveLineQtyEvent extends StockPickingEvent {
  final double quantity;
  final int moveId;

  UpdateStockMoveLineQtyEvent({
    required this.quantity,
    required this.moveId,
  });
}