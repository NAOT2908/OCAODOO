enum ScannerHandlerType {
  receiptSourceLocation,
  receiptDestLocation,
  deliverySourceLocation,
  deliveryDestLocation,
  internalSourceLocation,
  internalDestLocation,
}

extension ScannerHandlerTypeExt on ScannerHandlerType {
  String get value {
    switch (this) {
      case ScannerHandlerType.receiptSourceLocation:
        return 'receipt_source_location';
      case ScannerHandlerType.receiptDestLocation:
        return 'receipt_dest_location';
      case ScannerHandlerType.deliverySourceLocation:
        return 'delivery_source_location';
      case ScannerHandlerType.deliveryDestLocation:
        return 'delivery_dest_location';
      case ScannerHandlerType.internalSourceLocation:
        return 'internal_source_location';
      case ScannerHandlerType.internalDestLocation:
        return 'internal_dest_location';
      default:
        throw Exception('Scanner handler type not support');
    }
  }
}