import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';

class IndexPage extends StatelessWidget {
  const IndexPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PrimaryScaffold(
      child: SizedBox(
        width: double.infinity,
        height: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 300,
              child: PrimaryButton(
                onPressed: () {
                  context.pushNamed('stock_picking.create');
                },
                labelText: 'Tạo Phiếu Nhập Kho',
              ),
            ),
            const SizedBox(
              height: 10,
            ),
            SizedBox(
              width: 300,
              child: PrimaryButton(
                onPressed: () {
                  context.pushNamed('stock_picking.create', queryParameters: {
                    'type': StockPickingTypeEnum.outgoing.value,
                });
              },
              labelText: 'Tạo phiếu Xuất Kho',
            ),
            ),
            const SizedBox(
              height: 10,
            ),
            SizedBox(
              width: 300,
              child: PrimaryButton(
                onPressed: () {
                  context.pushNamed('stock_picking.create', queryParameters: {
                  'type': StockPickingTypeEnum.internal.value,
                });
              },
              labelText: 'Tạo Phiếu Chuyển Nội Bộ',
            ),
            ),
            const SizedBox(
              height: 10,
            ),
            SizedBox(
              width: 300,
              child: PrimaryButton(
                onPressed: () {
                context.pushNamed('scanner.index');
              },
              labelText: 'Quét Barcode',
            ),
            ),
          ],
        ),
      ),
    );
  }
}
