import 'package:collection/collection.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';

class StockPickingType {
  int? id;
  String? name;
  StockPickingTypeEnum? code;

  StockPickingType({
    this.id,
    this.name,
    this.code,
  });

  factory StockPickingType.fromJson(Map<String, dynamic> data) {
    final code = data['code'] != null
        ? StockPickingTypeEnum.values
            .firstWhereOrNull((item) => item.value == data['code'])
        : null;

    return StockPickingType(
      id: data['id'] != null ? data['id'] as int : null,
      name: data['name'] != null ? data['name'] as String : null,
      code: code,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code?.value,
    };
  }
}