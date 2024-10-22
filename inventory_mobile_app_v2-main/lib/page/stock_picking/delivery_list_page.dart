import 'package:flutter/material.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/page/stock_picking/list_page/index_page.dart';

class DeliveryListPage extends StatefulWidget {
  const DeliveryListPage({super.key});

  @override
  State<DeliveryListPage> createState() => _DeliveryListPageState();

}

class _DeliveryListPageState extends State<DeliveryListPage> {
  @override
  Widget build(BuildContext context) {
    return const StockPickingListPage(type: StockPickingTypeEnum.outgoing);
  }
  
}