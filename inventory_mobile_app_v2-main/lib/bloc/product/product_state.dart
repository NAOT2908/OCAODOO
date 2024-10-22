import 'package:equatable/equatable.dart';
import 'package:inven_barcode_app/models/product.dart';

class ProductState extends Equatable {
  final bool loadingDetail;
  final Product? product;

  final bool loadingList;
  final int currentPage;
  final bool hasListMore;
  final List<Product>? productList;

  const ProductState({
    this.loadingDetail = false,
    this.product,
    this.loadingList = false,
    this.currentPage = 1,
    this.hasListMore = true,
    this.productList,
  });

  @override
  List<Object?> get props => [
        loadingDetail,
        product,
        loadingList,
        currentPage,
        hasListMore,
        productList,
      ];

  ProductState copyWith({
    bool? loadingDetail,
    Product? product,
    bool? loadingList,
    int? currentPage,
    bool? hasListMore,
    List<Product>? productList,
  }) {
    return ProductState(
      loadingDetail: loadingDetail ?? this.loadingDetail,
      product: product ?? this.product,
      loadingList: loadingList ?? this.loadingList,
      currentPage: currentPage ?? this.currentPage,
      hasListMore: hasListMore ?? this.hasListMore,
      productList: productList ?? this.productList,
    );
  }

  ProductState reset() {
    return const ProductState();
  }
}
