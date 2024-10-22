import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/product/product_event.dart';
import 'package:inven_barcode_app/bloc/product/product_state.dart';
import 'package:inven_barcode_app/repositories/product_repository.dart';

class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final ProductRepository productRepository;

  ProductBloc({required this.productRepository}) : super(const ProductState()) {
    on<LoadProductDetailEvent>(_handleLoadProductDetailEvent);
    on<LoadProductListEvent>(_handleLoadProductListEvent);
  }

  Future<void> _handleLoadProductDetailEvent(
      LoadProductDetailEvent event, Emitter<ProductState> emit) async {
    emit(state.copyWith(loadingDetail: true));

    final product = await productRepository.fetchProduct(id: event.id);

    emit(state.copyWith(
      loadingDetail: false,
      product: product,
    ));
  }

  Future<void> _handleLoadProductListEvent(
      LoadProductListEvent event, Emitter<ProductState> emit) async {
    emit(state.copyWith(loadingList: true));

    final result = await productRepository.fetchProducts(page: event.page);

    emit(
      state.copyWith(
        loadingList: false,
        currentPage: event.page,
        hasListMore: result['has_more'],
        productList: event.page == 1
            ? result['data']
            : (state.productList ?? []) + result['data'],
      ),
    );
  }
}
