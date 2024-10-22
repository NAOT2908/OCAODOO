import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/unit_of_measure.dart';

class StockMoveLine {
  int? id;
  String? name;

  int? productId;
  double? productUomQty;
  UnitOfMeasure? productUom;
  double? quantity;

  StockMove? stockMove;

  StockMoveLine({
    this.id,
    this.name,
    this.productId,
    this.productUomQty,
    this.productUom,
    this.quantity,
    this.stockMove
  });

  factory StockMoveLine.fromJson(Map<String, dynamic> data) {
    return StockMoveLine(
      id: data['id'] != null ? data['id'] as int : null,
      name: data['name'] != null ? data['name'] as String : null,
      productId: data['product_id'],
      productUomQty: data['product_uom_qty'],
      quantity: data['quantity'],
      productUom: data['product_uom'],
      stockMove: data['stock_move'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'product_id': productId,
      'product_uom_qty': productUomQty,
      'quantity': quantity,
      'product_uom': productUom,
      'stock_move': stockMove,
    };
  }
}
