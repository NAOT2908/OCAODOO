import 'package:inven_barcode_app/commons/scanner_constants.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

sealed class ScannerEvent {}

class StartScannerEvent extends ScannerEvent {
  final ScannerHandlerType? type;
  final Barcode barcode;

  StartScannerEvent({
    this.type,
    required this.barcode,
  });
}

class ScannerDetectEmptyEvent extends ScannerEvent {}

class ResetScannerEvent extends ScannerEvent {}
