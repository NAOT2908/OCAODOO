import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/commons/scanner_constants.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/widets/bottom_error_snackbar.dart';
import 'package:inven_barcode_app/widets/form/form_label.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';

class Step1SourceLocation extends StatelessWidget {
  final StockPickingTypeEnum type;
  final StockPicking stockPicking;

  const Step1SourceLocation({
    super.key,
    required this.type,
    required this.stockPicking,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const FormLabel(labelText: 'Vị Trí Nguồn'),
        const SizedBox(
          height: 4,
        ),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 8,
          ),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey),
            borderRadius: BorderRadius.circular(12),
            color: Colors.white,
          ),
          child: Text(
            stockPicking.location?.name ?? '',
            style: const TextStyle(
              fontSize: 16,
            ),
          ),
        ),
        const SizedBox(
          height: 4,
        ),
        SizedBox(
          width: double.infinity,
          child: PrimaryButton(
            isOutline: true,
            onPressed: () async {
              final result = await context.pushNamed(
                'scanner.index',
                queryParameters: {
                  'type': type == StockPickingTypeEnum.incoming
                      ? ScannerHandlerType.receiptSourceLocation.value
                      : type == StockPickingTypeEnum.outgoing
                          ? ScannerHandlerType.deliverySourceLocation.value
                          : ScannerHandlerType.internalSourceLocation.value,
                },
              );

              if (result != null) {
                final data = (result as Map<String, dynamic>)['data'];

                if (data == null ||
                    (data.stockPickingType == null &&
                        [
                          StockPickingTypeEnum.incoming,
                          StockPickingTypeEnum.outgoing
                        ].contains(type))) {
                  showBottomErrorSnackBar(
                    context,
                    'Mã vạch vị trí nguồn không tìm thấy hoặc không hợp lệ!',
                  );
                  return;
                }

                context.read<StockPickingBloc>().add(
                      UpdateStockPickingLocationEvent(
                        data: data,
                        isUpdateSourceLocation: true,
                        stockType: type,
                      ),
                    );
              }
            },
            labelText: 'Quét Mã',
            icon: const Icon(Icons.barcode_reader),
          ),
        ),
      ],
    );
  }
}
