import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/widgets/bottom_valdiate_button.dart';
import 'package:inven_barcode_app/widets/general_info_row.dart';

class GeneralTab extends StatelessWidget {
  final StockPicking stockPicking;

  const GeneralTab({
    super.key,
    required this.stockPicking,
  });

  @override
  Widget build(BuildContext context) {
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  children: [
                    GeneralInfoRow(
                        label: 'Loại hoạt động',
                        content: stockPicking.stockPickingType?.name ?? ''),
                    const SizedBox(
                      height: 4,
                    ),
                    GeneralInfoRow(
                        label: 'Vị trí nguồn',
                        content: stockPicking.location?.name ?? ''),
                    const SizedBox(
                      height: 4,
                    ),
                    GeneralInfoRow(
                        label: 'Vị trí đích',
                        content: stockPicking.destLocation?.name ?? ''),
                    const SizedBox(
                      height: 4,
                    ),
                    stockPicking.scheduledDate != null
                        ? GeneralInfoRow(
                            label: 'Ngày theo kế hoạch',
                            content: stockPicking.scheduledDateString(),
                          )
                        : Container(),
                    const SizedBox(
                      height: 4,
                    ),
                    stockPicking.barcode != null
                        ? GeneralInfoRow(
                            label: 'Mã vạch', content: stockPicking.barcode!)
                        : Container(),
                    stockPicking.barcodeImage != null
                        ? Column(
                            children: [
                              const SizedBox(
                                height: 4,
                              ),
                              Image.memory(
                                base64Decode(stockPicking.barcodeImage!),
                                fit: BoxFit.cover,
                              ),
                            ],
                          )
                        : Container(),
                  ],
                ),
                stockPicking.state != StockPickingStatusEnum.done
                    ? SizedBox(
                        width: double.infinity,
                        child: BottomValidateButton(
                          id: stockPicking.id ?? 0,
                        ),
                      )
                    : Container(),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
