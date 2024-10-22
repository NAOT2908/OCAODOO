import 'package:equatable/equatable.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';

class StockPickingState extends Equatable {
  final bool loading;
  final StockPicking? stockPicking;

  final bool loadingStockMove;
  final bool createSucceed;

  final List<StockPicking>? stockList;
  final int currentPage;
  final bool hasListMore;
  final String? barcodeProductError;

  const StockPickingState({
    this.loading = false,
    this.stockPicking,
    this.loadingStockMove = false,
    this.createSucceed = false,
    this.stockList,
    this.currentPage = 1,
    this.hasListMore = false,
    this.barcodeProductError,
  });

  @override
  List<Object?> get props => [
        loading,
        stockPicking,
        loadingStockMove,
        createSucceed,
        stockList,
        currentPage,
        hasListMore,
        barcodeProductError,
      ];

  StockPickingState copyWith({
    bool? loading,
    StockPicking? stockPicking,
    bool? loadingStockMove,
    bool? createSucceed,
    List<StockPicking>? stockList,
    int? currentPage,
    bool? hasListMore,
    String? barcodeProductError,
  }) {
    return StockPickingState(
      loading: loading ?? this.loading,
      stockPicking: stockPicking ?? this.stockPicking,
      loadingStockMove: loadingStockMove ?? this.loadingStockMove,
      createSucceed: createSucceed ?? this.createSucceed,
      stockList: stockList ?? this.stockList,
      currentPage: currentPage ?? this.currentPage,
      hasListMore: hasListMore ?? this.hasListMore,
      barcodeProductError: barcodeProductError ?? this.barcodeProductError,
    );
  }

  StockPickingState resetStockPickingDetail() {
    return StockPickingState(
      stockPicking: null,
      stockList: stockList,
      hasListMore: hasListMore,
      currentPage: currentPage,
    );
  }
}