import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_state.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/product.dart';
import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/stock_move_line.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/repositories/product_repository.dart';
import 'package:inven_barcode_app/repositories/stock_picking_repository.dart';
import 'package:inven_barcode_app/repositories/stock_picking_type_repository.dart';

class StockPickingBloc extends Bloc<StockPickingEvent, StockPickingState> {
  final StockPickingTypeRepository stockPickingTypeRepository;
  final StockPickingRepository stockPickingRepository;
  final ProductRepository productRepository;

  StockPickingBloc({
    required this.stockPickingTypeRepository,
    required this.stockPickingRepository,
    required this.productRepository,
  }) : super(const StockPickingState()) {
    on<FetchDefaultValuesEvent>(_handleFetchDefaultValuesEvent);
    on<FetchSourceLocationByBarcode>(_handleFetchSourceLocationByBarcode);
    on<FetchProductsFromBarcodes>(_handleFetchProductsFromBarcodes);
    on<UpdateStockMoveQtyEvent>(_handleUpdateStockMoveQtyEvent);
    on<SaveStockPickingEvent>(_handleSaveStockPickingEvent);
    on<ResetCreateStockPickingEvent>(_handleResetCreateStockPickingEvent);
    on<UpdateStockPickingLocationEvent>(_handleUpdateStockPickingLocationEvent);
    on<FetchStockPickingEvent>(_handleFetchStockPickingEvent);
    on<FetchMoveLinesFromBarcodes>(_handleFetchMoveLinesFromBarcodes);
    on<ValidateStockPickingEvent>(_handleValidateStockPickingEvent);
    on<LoadStockPickingListEvent>(_handleLoadStockPickingListEvent);
    on<UpdateStockMoveLineQtyEvent>(_handleUpdateStockMoveLineQtyEvent);
  }

  Future<void> _handleFetchDefaultValuesEvent(
      FetchDefaultValuesEvent event, Emitter<StockPickingState> emit) async {
    emit(state.copyWith(
      loading: true,
    ));

    final result =
        await stockPickingRepository.fetchDefaultValues(type: event.type);

    emit(state.copyWith(
      loading: false,
      stockPicking: result,
    ));
  }

  Future<void> _handleFetchSourceLocationByBarcode(
    FetchSourceLocationByBarcode event,
    Emitter<StockPickingState> emit,
  ) async {
    emit(state.copyWith(
      barcodeProductError: '',
    ));

    await stockPickingRepository.fetchDefaultFromSourceBarcode(
      type: event.type,
      barcode: event.barcode,
    );
  }

  Future<void> _handleFetchProductsFromBarcodes(
      FetchProductsFromBarcodes event, Emitter<StockPickingState> emit) async {
    emit(state.copyWith(loadingStockMove: true));

    List<String> barcodes =
        event.barcodes.map((barcode) => barcode.rawValue!).toList();
    // Remove barcode duplicate in one scan times.
    barcodes = barcodes.toSet().toList();

    final products =
        await productRepository.getProductsFromBarcodes(barcodes: barcodes);

    if (products.isEmpty) {
      emit(state.copyWith(
        barcodeProductError:
            'Không có sản phẩm với barcodes: ${barcodes.join(',')}',
        loadingStockMove: false,
      ));

      return;
    }

    StockPicking stockPicking = state.stockPicking!;
    var stockMoves = stockPicking.stockMoves ?? [];

    if (stockMoves.isEmpty) {
      stockMoves = products.map((product) {
        return StockMove.fromJson({
          'name': product.name,
          'product_id': product.id,
          'product_uom_qty': 1.0,
          'product_uom': product.productUom,
        });
      }).toList();
    } else {
      for (Product product in products) {
        int stockMoveIndex =
            stockMoves.indexWhere((item) => item.productId == product.id);

        double newQuantity = stockMoveIndex == -1
            ? 1
            : (stockMoves[stockMoveIndex].productUomQty ?? 0) + 1;

        if (stockMoveIndex != -1) {
          stockMoves.removeAt(stockMoveIndex);
        }

        stockMoves.insert(
          0,
          StockMove.fromJson({
            'name': product.name,
            'product_id': product.id,
            'product_uom_qty': newQuantity,
            'product_uom': product.productUom,
          }),
        );
      }
    }

    stockPicking.stockMoves = stockMoves;

    emit(state.copyWith(
      loadingStockMove: false,
      stockPicking: stockPicking,
    ));
  }

  Future<void> _handleFetchMoveLinesFromBarcodes(
      FetchMoveLinesFromBarcodes event, Emitter<StockPickingState> emit) async {
    emit(state.copyWith(
      loadingStockMove: true,
      barcodeProductError: '',
    ));

    List<String> barcodes =
        event.barcodes.map((barcode) => barcode.rawValue!).toList();
    // Remove barcode duplicate in one scan times.
    barcodes = barcodes.toSet().toList();

    final products =
        await productRepository.getProductsFromBarcodes(barcodes: barcodes);

    if (products.isEmpty) {
      emit(state.copyWith(
        barcodeProductError:
            'Không có sản phẩm với barcodes: ${barcodes.join(',')}',
        loadingStockMove: false,
      ));

      return;
    }

    StockPicking stockPicking = state.stockPicking!;
    var stockMoves = stockPicking.stockMoves ?? [];

    if (stockMoves.isEmpty) {
      // Need handle when not have product
      emit(state.copyWith(
        loadingStockMove: false,
      ));
    } else {
      for (Product product in products) {
        int stockMoveIndex =
            stockMoves.indexWhere((item) => item.productId == product.id);

        if (stockMoveIndex == -1) {
          // Need handle when not have product
          emit(state.copyWith(
            loadingStockMove: false,
          ));
        }

        final moveLine = stockMoves[stockMoveIndex].moveLines?.firstOrNull;

        if (moveLine == null) {
          stockMoves[stockMoveIndex].moveLines = [StockMoveLine(quantity: 1)];
        } else {
          moveLine.quantity = (moveLine.quantity ?? 0) + 1.0;
          stockMoves[stockMoveIndex].moveLines = [moveLine];
        }
      }

      stockPicking.stockMoves = stockMoves;

      emit(state.copyWith(
        loadingStockMove: false,
        stockPicking: StockPicking.fromJson(stockPicking.toJson()),
      ));
    }
  }

  void _handleUpdateStockMoveQtyEvent(
      UpdateStockMoveQtyEvent event, Emitter<StockPickingState> emit) {
    emit(state.copyWith(barcodeProductError: ''));

    StockPicking stockPicking = state.stockPicking!;
    final stockMoves = List<StockMove>.from(stockPicking.stockMoves!);

    final newStockMoves = stockMoves.map((item) {
      if (item.productId == event.productId) {
        item.productUomQty = event.qty;
      }

      return item;
    }).toList();

    stockPicking.stockMoves = List<StockMove>.from(newStockMoves);

    emit(
      state.copyWith(
        stockPicking: StockPicking.fromJson(stockPicking.toJson()),
      ),
    );
  }

  Future<void> _handleSaveStockPickingEvent(
      SaveStockPickingEvent event, Emitter<StockPickingState> emit) async {
    final stockMoves = event.stockPicking.stockMoves ?? [];

    List<Map<String, dynamic>> moveLines = stockMoves.map((item) {
      return {
        'name': item.name,
        'product_id': item.productId,
        'product_uom_qty': item.productUomQty,
        'product_uom': item.productUom!.id,
      };
    }).toList();

    Map<String, dynamic> data = {
      "picking_type_id": event.stockPicking.stockPickingType!.id,
      "location_id": event.stockPicking.location!.id,
      "location_dest_id": event.stockPicking.destLocation!.id,
      "move_lines": moveLines,
    };

    final stockPickingId = await stockPickingRepository.createStockPicking({
      'picking_data': data,
    });

    emit(state.copyWith(
      createSucceed: true,
      stockPicking: StockPicking.fromJson({
        ...state.stockPicking!.toJson(),
        'id': stockPickingId,
      }),
    ));
  }

  void _handleResetCreateStockPickingEvent(
      ResetCreateStockPickingEvent event, Emitter<StockPickingState> emit) {
    emit(state.resetStockPickingDetail());
  }

  void _handleUpdateStockPickingLocationEvent(
      UpdateStockPickingLocationEvent event, Emitter<StockPickingState> emit) {
    final stockPicking = state.stockPicking;
    final data = event.data;

    if (stockPicking == null) {
      return;
    }

    final shouldUpdateType = (event.isUpdateSourceLocation ||
            stockPicking.location!.id == (data.location?.id ?? 0)) &&
        data.stockPickingType != null;

    emit(
      state.copyWith(
        stockPicking: StockPicking.fromJson({
          ...stockPicking.toJson(),
          'picking_type': shouldUpdateType
              ? data.stockPickingType
              : stockPicking.stockPickingType,
          'location': event.isUpdateSourceLocation
              ? data.location
              : stockPicking.location,
          'dest_location': event.stockType != StockPickingTypeEnum.internal &&
                  data.destLocation != null
              ? data.destLocation
              : stockPicking.destLocation,
        }),
      ),
    );
  }

  Future<void> _handleFetchStockPickingEvent(
      FetchStockPickingEvent event, Emitter<StockPickingState> emit) async {
    emit(state.resetStockPickingDetail());
    emit(state.copyWith(loading: true));

    final result = await stockPickingRepository.fetchStockPicking(id: event.id);

    emit(state.copyWith(loading: false, stockPicking: result));
  }

  Future<void> _handleValidateStockPickingEvent(
      ValidateStockPickingEvent event, Emitter<StockPickingState> emit) async {
    emit(state.copyWith(loading: true));

    List<Map<String, dynamic>> moveLineData = state.stockPicking?.stockMoves
            ?.fold([], (value, stockMove) {
              return value +
                  (stockMove.moveLines
                          ?.map<Map<String, dynamic>>((StockMoveLine item) {
                        return {
                          'product_id': stockMove.productId,
                          'quantity': item.quantity,
                          'move_id': stockMove.id,
                          'product_uom_id': stockMove.productUom!.id,
                        };
                      }).toList() ??
                      []);
            })
            .toList()
            .cast<Map<String, dynamic>>() ??
        List<Map<String, dynamic>>.from([]);

    await stockPickingRepository.validateStockPicking(
      id: state.stockPicking!.id!,
      data: moveLineData,
      createBackorder: event.createBackorder,
    );

    emit(state.copyWith(
      createSucceed: true,
      loading: false,
    ));
  }

  Future<void> _handleLoadStockPickingListEvent(
      LoadStockPickingListEvent event, Emitter<StockPickingState> emit) async {
    emit(state.copyWith(loading: true));

    final result = await stockPickingRepository.fetchPaginationList(
        type: event.type, page: event.page);

    emit(
      state.copyWith(
        loading: false,
        currentPage: event.page,
        hasListMore: result['has_more'],
        stockList: event.page == 1
            ? result['data']
            : (state.stockList ?? []) + result['data'],
      ),
    );
  }

  _handleUpdateStockMoveLineQtyEvent(
      UpdateStockMoveLineQtyEvent event, Emitter<StockPickingState> emit) {
    emit(state.copyWith(barcodeProductError: ''));
    
    final stockMoves = state.stockPicking!.stockMoves ?? [];

    List<StockMove> newStockMoves = [];

    for (StockMove stockMove in stockMoves) {
      if (stockMove.id == event.moveId) {
        if (stockMove.moveLines != null && stockMove.moveLines!.isNotEmpty) {
          stockMove.moveLines![0].quantity = event.quantity;
        } else {
          stockMove.moveLines = [
            StockMoveLine(quantity: event.quantity),
          ];
        }
      }

      newStockMoves.add(stockMove);
    }

    final newStockPicking = StockPicking.fromJson({
      ...state.stockPicking!.toJson(),
      'stock_moves': newStockMoves,
    });

    emit(state.copyWith(stockPicking: newStockPicking));
  }
}