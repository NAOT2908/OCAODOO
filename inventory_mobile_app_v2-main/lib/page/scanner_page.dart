import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/scanner/scanner_bloc.dart';
import 'package:inven_barcode_app/bloc/scanner/scanner_event.dart';
import 'package:inven_barcode_app/bloc/scanner/scanner_state.dart';
import 'package:inven_barcode_app/commons/scanner_constants.dart';
import 'package:inven_barcode_app/widets/bottom_error_snackbar.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScannerPage extends StatefulWidget {
  final ScannerHandlerType? type;

  const ScannerPage({
    super.key,
    this.type,
  });

  @override
  State<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<ScannerPage> {
  final MobileScannerController controller = MobileScannerController(
    detectionTimeoutMs: 1000,
  );

  void _handleBarcode(BarcodeCapture barcodeCap) {
    if (mounted) {
      final Barcode? barcode = barcodeCap.barcodes.firstOrNull;

      if (barcode != null) {
        context.read<ScannerBloc>().add(
              StartScannerEvent(
                barcode: barcode,
                type: widget.type,
              ),
            );
      } else {
        context.read<ScannerBloc>().add(ScannerDetectEmptyEvent());
      }
    }
  }

  void _handleNavigateBarcode(
      BuildContext context, Map<String, dynamic>? result) {
    if (result == null) {
      showBottomErrorSnackBar(
          context, 'Không thể tìm thấy dữ liệu thích hợp với barcode!');

      return;
    }

    if (result['type'] == 'stock_picking') {
      context.goNamed(
        'stock_picking.show',
        pathParameters: {'id': result['id'].toString()},
      );
    } else if (result['type'] == 'product') {
      context.goNamed(
        'products.show',
        pathParameters: {'id': result['id'].toString()},
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!mounted) {
      return Container(
        color: Colors.white,
        child: Center(
          child: CircularProgressIndicator(
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Barcode Scanner')),
      backgroundColor: Colors.black,
      body: BlocConsumer<ScannerBloc, ScannerState>(
        builder: (BuildContext context, ScannerState state) {
          return Stack(
            children: [
              MobileScanner(
                controller: controller,
                onDetect: state.searchingBarcode ? null : _handleBarcode,
              ),
              (state.searchingBarcode)
                  ? Container(
                      width: MediaQuery.of(context).size.width,
                      height: MediaQuery.of(context).size.height,
                      color: Colors.black.withOpacity(0.6),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                    )
                  : Container(
                      height: 0,
                    ),
            ],
          );
        },
        listener: (BuildContext context, ScannerState state) {
          if (state.isEmpty) {
            showBottomErrorSnackBar(context, 'Scanner detect empty barcode!');
          }

          if ((state.result != null || state.resultError) &&
              !state.searchingBarcode) {
            switch (widget.type) {
              case ScannerHandlerType.receiptSourceLocation:
              case ScannerHandlerType.receiptDestLocation:
              case ScannerHandlerType.deliverySourceLocation:
              case ScannerHandlerType.deliveryDestLocation:
              case ScannerHandlerType.internalSourceLocation:
              case ScannerHandlerType.internalDestLocation:
                context.pop({'data': state.result});
                break;
              default:
                _handleNavigateBarcode(context, state.result);
                break;
            }
            context.read<ScannerBloc>().add(ResetScannerEvent());
          }
        },
      ),
    );
  }

  @override
  void dispose() async {
    super.dispose();
    await controller.dispose();
  }
}
