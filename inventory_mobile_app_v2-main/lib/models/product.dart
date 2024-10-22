import 'package:intl/intl.dart';
import 'package:inven_barcode_app/commons/product_constants.dart';
import 'package:inven_barcode_app/models/currency.dart';
import 'package:inven_barcode_app/models/unit_of_measure.dart';

class Product {
  int? id;
  String? name;
  String? description;
  UnitOfMeasure? productUom;
  double? availableQty;
  double? incomeQty;
  double? outcomeQty;
  double? forecastQty;
  String? productImage;
  String? barcode;
  String? barcodeImage;
  double? listPrice;
  double? costPrice;
  Currency? currency;

  Product({
    this.id,
    this.name,
    this.description,
    this.productUom,
    this.availableQty,
    this.incomeQty,
    this.outcomeQty,
    this.forecastQty,
    this.productImage,
    this.barcodeImage,
    this.barcode,
    this.listPrice,
    this.costPrice,
    this.currency,
  });

  factory Product.fromJson(Map<String, dynamic> data) {
    return Product(
      id: data['id'] != null ? data['id'] as int : null,
      name: data['name'] != null ? data['name'] as String : null,
      description: data['description'] != null && data['description'] != false
          ? data['description']
          : null,
      productUom: data['product_uom'],
      availableQty: data['available_qty'],
      incomeQty: data['income_qty'],
      outcomeQty: data['outcome_qty'],
      forecastQty: data['forecast_qty'],
      productImage:
          data['product_image'] != null && data['product_image'] != false
              ? data['product_image']
              : null,
      barcode: data['barcode'] != null && data['barcode'] != false
          ? data['barcode']
          : null,
      barcodeImage:
          data['barcode_image'] != null && data['barcode_image'] != false
              ? data['barcode_image']
              : null,
      listPrice: data['price'] != null && data['price']['list_price'] != null
          ? data['price']['list_price']
          : null,
      costPrice: data['price'] != null && data['price']['cost_price'] != null
          ? data['price']['cost_price']
          : null,
      currency: data['currency'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'product_uom': productUom,
      'available_qty': availableQty,
      'income_qty': incomeQty,
      'outcome_qty': outcomeQty,
      'forecast_qty': forecastQty,
      'product_image': productImage,
      'barcode': barcode,
      'barcode_image': barcodeImage,
      'list_price': listPrice,
      'cost_price': costPrice,
      'currency': currency,
    };
  }

  String displayPrice(paramPrice) {
    if (paramPrice == null) {
      return '';
    }

    final formatedPrice = NumberFormat().format(paramPrice);

    if (currency == null ||
        currency!.symbol == null ||
        currency!.position == null) {
      return formatedPrice;
    }

    if (currency!.position == CurrencyPositionEnum.before) {
      return '${currency!.symbol}$formatedPrice';
    }

    return '$formatedPrice${currency!.symbol}';
  }
}
