import 'package:flutter/material.dart';
import 'package:inven_barcode_app/models/product.dart';
import 'package:inven_barcode_app/widets/general_info_row.dart';

class StockTab extends StatelessWidget {
  final Product product;

  const StockTab({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    final unitName =
        product.productUom != null ? ' ${product.productUom!.name}' : '';

    return CustomScrollView(
      slivers: [
        SliverFillRemaining(
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 16,
            ),
            child: Column(
              children: [
                GeneralInfoRow(
                  label: 'Hiện có',
                  content: '${product.availableQty!}$unitName',
                ),
                const SizedBox(
                  height: 4,
                ),
                GeneralInfoRow(
                  label: 'Dự báo',
                  content: '${product.forecastQty!}$unitName',
                ),
                Container(
                  padding: EdgeInsets.only(left: 12),
                  child: Column(
                    children: [
                      GeneralInfoRow(
                        label: 'Đang nhập kho',
                        content: '${product.incomeQty!}$unitName',
                      ),
                      const SizedBox(
                        height: 4,
                      ),
                      GeneralInfoRow(
                        label: 'Đang xuất kho',
                        content: '${product.outcomeQty!}$unitName',
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
