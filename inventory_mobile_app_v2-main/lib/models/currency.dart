import 'package:inven_barcode_app/commons/product_constants.dart';

class Currency {
  int? id;
  String? name;
  String? symbol;
  CurrencyPositionEnum? position;

  Currency({
    this.id,
    this.name,
    this.symbol,
    this.position,
  });

  factory Currency.fromJson(Map<String, dynamic> data) {
    final position = data['position'] != null
        ? CurrencyPositionEnum.values.byName(data['position'])
        : CurrencyPositionEnum.before;

    return Currency(
      id: data['id'],
      name: data['name'],
      symbol: data['symbol'],
      position: position,
    );
  }

  Map<String, dynamic> fromJson() {
    return {
      'id': id,
      'name': name,
      'symbol': symbol,
      'position': position,
    };
  }
}
