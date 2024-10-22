import 'package:flutter/material.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/page/stock_picking/list_page/index_page.dart';

class InternalListPage extends StatelessWidget {
  const InternalListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const StockPickingListPage(type: StockPickingTypeEnum.internal);
  }
  
}