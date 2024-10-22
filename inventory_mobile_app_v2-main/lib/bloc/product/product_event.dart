class ProductEvent {}

class LoadProductDetailEvent extends ProductEvent {
  final int id;

  LoadProductDetailEvent({required this.id});
}

class LoadProductListEvent extends ProductEvent {
  final int page;

  LoadProductListEvent({required this.page});
}