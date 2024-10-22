import 'package:inven_barcode_app/models/stock_move_line.dart';
import 'package:inven_barcode_app/models/unit_of_measure.dart';

class StockMove {
  int? id;
  String? name;

  int? productId;
  double? productUomQty;
  UnitOfMeasure? productUom;

  List<StockMoveLine>? moveLines;

  StockMove({
    this.id,
    this.name,
    this.productId,
    this.productUomQty,
    this.productUom,
    this.moveLines,
  });

  factory StockMove.fromJson(Map<String, dynamic> data) {
    return StockMove(
      id: data['id'] != null ? data['id'] as int : null,
      name: data['name'] != null ? data['name'] as String : null,
      productId: data['product_id'],
      productUomQty: data['product_uom_qty'],
      productUom: data['product_uom'],
      moveLines: data['move_lines'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'product_id': productId,
      'product_uom_qty': productUomQty,
      'product_uom': productUom,
      'move_lines': moveLines,
    };
  }
}
