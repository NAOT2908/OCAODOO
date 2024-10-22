import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_state.dart';
import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/widets/bottom_error_snackbar.dart';
import 'package:inven_barcode_app/widets/form/form_label.dart';
import 'package:inven_barcode_app/widets/form/text_input.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class StockPickingNewStep2 extends StatefulWidget {
  final VoidCallback onSubmit;
  final VoidCallback onBack;
  final StockPicking? stockPicking;

  const StockPickingNewStep2({
    super.key,
    required this.onBack,
    required this.onSubmit,
    required this.stockPicking,
  });

  @override
  State<StockPickingNewStep2> createState() => _StockPickingNewStep2State();
}

class _StockPickingNewStep2State extends State<StockPickingNewStep2> {
  bool barcodeLoading = false;
  final MobileScannerController controller = MobileScannerController(
    detectionTimeoutMs: 1000,
  );
  final TextEditingController qtyInputController = TextEditingController();

  void _handleBarcodeDetect(
      BuildContext context, BarcodeCapture barcodeCapture) {
    final barcodes = barcodeCapture.barcodes;

    context.read<StockPickingBloc>().add(
          FetchProductsFromBarcodes(barcodes: barcodes),
        );
  }

  void _editStockMove(BuildContext context, StockMove stockMove) {
    qtyInputController.text = stockMove.productUomQty.toString();

    showDialog(
        context: context,
        builder: (BuildContext context) {
          return Dialog(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Chỉnh sửa Sản phẩm',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                    ),
                  ),
                  const SizedBox(
                    height: 16,
                  ),
                  const FormLabel(labelText: 'Tên sản phẩm'),
                  const SizedBox(
                    height: 4,
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      stockMove.name ?? '',
                      style: const TextStyle(
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  const FormLabel(labelText: 'Số lượng'),
                  const SizedBox(
                    height: 4,
                  ),
                  TextInput(
                    controller: qtyInputController,
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(
                    height: 20,
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      PrimaryButton(
                        onPressed: () {
                          context.pop();
                        },
                        labelText: 'Huỷ',
                        isOutline: true,
                      ),
                      const SizedBox(
                        width: 8,
                      ),
                      PrimaryButton(
                        onPressed: () {
                          context.read<StockPickingBloc>().add(
                                UpdateStockMoveQtyEvent(
                                  productId: stockMove.productId!,
                                  qty: double.parse(
                                    qtyInputController.text,
                                  ),
                                ),
                              );
                          context.pop();
                        },
                        labelText: 'Lưu',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        });
  }

  Widget _buildProductListView(
      BuildContext context, List<StockMove> stockMoves) {
    return ListView.builder(
      itemCount: stockMoves.length,
      itemBuilder: (context, index) {
        return GestureDetector(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 20),
            color: Colors.white,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Text(
                    stockMoves[index].name ?? '',
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
                const SizedBox(
                  width: 4,
                ),
                Text(
                  'Số lượng: ${stockMoves[index].productUomQty} ${stockMoves[index].productUom?.name ?? ''}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          onTap: () {
            _editStockMove(context, stockMoves[index]);
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<StockPickingBloc, StockPickingState>(
      builder: (BuildContext context, StockPickingState state) {
        return Column(
          children: [
            // Scanner Area
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: MobileScanner(
                      controller: controller,
                      fit: BoxFit.cover,
                      // Ensures the scanner takes up the space fully
                      onDetect: barcodeLoading || state.loadingStockMove
                          ? null
                          : (BarcodeCapture barcodeCap) {
                              setState(() {
                                barcodeLoading = true;
                              });
                              _handleBarcodeDetect(context, barcodeCap);
                            },
                    ),
                  ),
                  barcodeLoading || state.loadingStockMove
                      ? Container(
                          height: double.infinity,
                          width: double.infinity,
                          color: Colors.grey.withOpacity(0.6),
                          child: const Center(
                            child: CircularProgressIndicator(),
                          ),
                        )
                      : Container(
                          height: 0,
                        ),
                ],
              ),
            ),

            // Product List
            Container(
              height: 200, // Adjust height for the bottom section
              color: Colors.grey[200], // Background color for the bottom area
              child: state.stockPicking!.stockMoves == null ||
                      state.stockPicking!.stockMoves!.isEmpty
                  ? const Center(
                      child: Text(
                        'Sản phẩm trống',
                        style: TextStyle(fontSize: 18),
                      ),
                    )
                  : _buildProductListView(
                      context,
                      state.stockPicking!.stockMoves!,
                    ),
            ),
            const SizedBox(
              height: 4,
            ),
            Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    onPressed: () {
                      widget.onBack();
                    },
                    labelText: 'Quay lại',
                    isOutline: true,
                  ),
                ),
                Expanded(
                  child: PrimaryButton(
                    onPressed: () {
                      widget.onSubmit();
                    },
                    labelText: 'Lưu',
                  ),
                ),
              ],
            ),
          ],
        );
      },
      listener: (BuildContext context, StockPickingState state) {
        if (!state.loadingStockMove && barcodeLoading) {
          setState(() {
            barcodeLoading = false;
          });
        }

        if (state.createSucceed) {
          final id = state.stockPicking!.id!;

          context.read<StockPickingBloc>().add(ResetCreateStockPickingEvent());
          context.replaceNamed('stock_picking.show',
              pathParameters: {'id': id.toString()});
        }

        if (state.barcodeProductError != null &&
            state.barcodeProductError!.isNotEmpty) {
          showBottomErrorSnackBar(context, state.barcodeProductError!);
        }
      },
    );
  }

  @override
  Future<void> dispose() async {
    super.dispose();
    await controller.dispose();
    qtyInputController.dispose();
  }
}
