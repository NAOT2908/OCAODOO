import 'package:inven_barcode_app/models/currency.dart';
import 'package:inven_barcode_app/models/product.dart';
import 'package:inven_barcode_app/models/unit_of_measure.dart';
import 'package:inven_barcode_app/providers/odoo_client_provider.dart';
import 'package:inven_barcode_app/providers/product_provider.dart';

class ProductRepository {
  final OdooClient odooClient;

  late ProductProvider _productProvider;

  ProductRepository({required this.odooClient}) {
    _productProvider = ProductProvider(odooClient: odooClient);
  }

  Future<List<Product>> getProductsFromBarcodes({
    required List<String> barcodes,
  }) async {
    final result = await _productProvider.getProductsFromBarcodes(barcodes);

    return result.map((item) {
      UnitOfMeasure productUom = UnitOfMeasure.fromJson({
        'id': item['product_uom_id'],
        'name': item['product_uom_name'],
      });

      item['product_uom'] = productUom;

      return Product.fromJson(item);
    }).toList();
  }

  Future<Product> fetchProduct({required int id}) async {
    final result = await _productProvider.fetchProduct(id: id);

    if (result['success']) {
      final data = result['data'];

      data['available_qty'] = data['quantity']['available'];
      data['income_qty'] = data['quantity']['incoming'];
      data['outcome_qty'] = data['quantity']['outgoing'];
      data['forecast_qty'] = data['quantity']['forecast'];

      data['product_uom'] = UnitOfMeasure(
        id: data['uom']['id'],
        name: data['uom']['name'],
      );

      data['list_price'] = data['price']['list_price'];
      data['cost_price'] = data['price']['cost_price'];

      data['currency'] = Currency.fromJson(data['currency']);

      return Product.fromJson(data);
    }

    throw Exception('Product Error');
  }

  Future<Map<String, dynamic>> fetchProducts({required int page}) async {
    final result = await _productProvider.fetchProducts(page: page);

    if (result['success']) {
      final data = result['data'];

      final products =
          List<Map<String, dynamic>>.from(data['product_records']).map((item) {
        item['available_qty'] = item['quantity']['available'];
        item['income_qty'] = item['quantity']['incoming'];
        item['outcome_qty'] = item['quantity']['outgoing'];
        item['forecast_qty'] = item['quantity']['forecast'];

        item['product_uom'] = UnitOfMeasure(
          id: item['uom']['id'],
          name: item['uom']['name'],
        );

        item['list_price'] = item['price']['list_price'];
        item['cost_price'] = item['price']['cost_price'];

        item['currency'] = Currency.fromJson(item['currency']);

        return Product.fromJson(item);
      }).toList();

      return {
        'has_more': data['has_more'],
        'data': products,
      };
    }

    return {
      'has_more': false,
      'data': [],
    };
  }
}
