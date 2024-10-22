import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/scanner/scanner_event.dart';
import 'package:inven_barcode_app/bloc/scanner/scanner_state.dart';
import 'package:inven_barcode_app/commons/scanner_constants.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/repositories/scanner_repository.dart';
import 'package:inven_barcode_app/repositories/stock_picking_repository.dart';

class ScannerBloc extends Bloc<ScannerEvent, ScannerState> {
  final StockPickingRepository stockPickingRepository;
  final ScannerRepository scannerRepository;

  ScannerBloc({
    required this.stockPickingRepository,
    required this.scannerRepository,
  }) : super(const ScannerState()) {
    on<ScannerDetectEmptyEvent>(_handleScannerDetectEmptyEvent);
    on<StartScannerEvent>(_handleStartScannerEvent);
    on<ResetScannerEvent>(_handleResetScannerEvent);
  }

  Future<void> _handleScannerDetectEmptyEvent(
      ScannerDetectEmptyEvent event, Emitter<ScannerState> emit) async {
    emit(state.copyWith(isEmpty: true));

    await Future.delayed(const Duration(
      microseconds: 3000,
    ));

    emit(state.copyWith(isEmpty: false));
  }

  Future<void> _handleStartScannerEvent(
      StartScannerEvent event, Emitter<ScannerState> emit) async {
    emit(state.reset());
    emit(state.copyWith(searchingBarcode: true));

    dynamic result;
    bool isError = false;
    try {
      if (event.type == ScannerHandlerType.receiptSourceLocation) {
        result = await stockPickingRepository.fetchDefaultFromSourceBarcode(
          type: StockPickingTypeEnum.incoming,
          barcode: event.barcode.rawValue!,
        );
      } else if (event.type == ScannerHandlerType.receiptDestLocation) {
        result = await stockPickingRepository.fetchDefaultFromDestBarcode(
          type: StockPickingTypeEnum.incoming,
          barcode: event.barcode.rawValue!,
        );
      } else if (event.type == ScannerHandlerType.deliverySourceLocation) {
        result = await stockPickingRepository.fetchDefaultFromSourceBarcode(
          type: StockPickingTypeEnum.outgoing,
          barcode: event.barcode.rawValue!,
        );
      } else if (event.type == ScannerHandlerType.deliveryDestLocation) {
        result = await stockPickingRepository.fetchDefaultFromDestBarcode(
          type: StockPickingTypeEnum.outgoing,
          barcode: event.barcode.rawValue!,
        );
      } else if (event.type == ScannerHandlerType.internalSourceLocation) {
        result = await stockPickingRepository.fetchDefaultFromSourceBarcode(
          type: StockPickingTypeEnum.internal,
          barcode: event.barcode.rawValue!,
        );
      } else if (event.type == ScannerHandlerType.internalDestLocation) {
        result = await stockPickingRepository.fetchDefaultFromDestBarcode(
          type: StockPickingTypeEnum.internal,
          barcode: event.barcode.rawValue!,
        );
      } else {
        result = await scannerRepository.findByBarcode(
          barcode: event.barcode,
        );
      }
    } catch (e) {
      isError = true;
    }

    emit(state.copyWith(
      searchingBarcode: false,
      result: result,
      resultError: isError,
    ));
  }

  void _handleResetScannerEvent(
      ResetScannerEvent event, Emitter<ScannerState> emit) {
    emit(state.reset());
  }
}
