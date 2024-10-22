import 'package:flutter/material.dart';

enum StockPickingTypeEnum {
  incoming,
  outgoing,
  internal,
}

extension StockPickingTypeEnumExt on StockPickingTypeEnum {
  String get value {
    switch (this) {
      case StockPickingTypeEnum.incoming:
        return 'incoming';
      case StockPickingTypeEnum.outgoing:
        return 'outgoing';
      case StockPickingTypeEnum.internal:
        return 'internal';
      default:
        throw Exception('Stock Picking Type not supported');
    }
  }
}

enum StockPickingStatusEnum {
  assigned,
  draft,
  waiting,
  done,
}

extension StockPickingStatusEnumExt on StockPickingStatusEnum {
  String get label {
    switch (this) {
      case StockPickingStatusEnum.assigned:
        return 'Sẵn Sàng';
      case StockPickingStatusEnum.draft:
        return 'Nháp';
      case StockPickingStatusEnum.waiting:
        return 'Đang Chờ';
      case StockPickingStatusEnum.done:
        return 'Hoàn tất';
      default:
        throw UnsupportedError('Stock Picking State type is not supported');
    }
  }

  Color get backgroundColor {
    switch (this) {
      case StockPickingStatusEnum.assigned:
        return const Color(0xFF17A2B8);
      case StockPickingStatusEnum.waiting:
        return const Color(0xFFFFAC00);
      case StockPickingStatusEnum.done:
        return const Color(0xFF246C41);
      default:
        return const Color(0xFFD9D9D9);
    }
  }

  Color get textColor {
    switch (this) {
      case StockPickingStatusEnum.assigned:
      case StockPickingStatusEnum.done:
        return Colors.white;
      default:
        return const Color(0xFF626262);
    }
  }
}