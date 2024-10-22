import 'package:inven_barcode_app/commons/stock_picking_constants.dart';

String generateCommonTitle(StockPickingTypeEnum type) {
  switch (type) {
    case StockPickingTypeEnum.incoming:
      return 'Nhập Kho';
    case StockPickingTypeEnum.outgoing:
      return 'Xuất Kho';
    case StockPickingTypeEnum.internal:
      return 'Chuyển Nội Bộ';
    default:
      throw Exception('Title cho $type không hổ trợ');
  }
}