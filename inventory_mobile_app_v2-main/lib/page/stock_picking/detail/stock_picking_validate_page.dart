import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_state.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/stock_move_line.dart';
import 'package:inven_barcode_app/widets/bottom_error_snackbar.dart';
import 'package:inven_barcode_app/widets/danger_button.dart';
import 'package:inven_barcode_app/widets/form/form_label.dart';
import 'package:inven_barcode_app/widets/form/text_input.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class StockPickingValidatePage extends StatefulWidget {
  final int id;

  const StockPickingValidatePage({
    super.key,
    required this.id,
  });

  @override
  State<StockPickingValidatePage> createState() =>
      _StockPickingValidatePageState();
}

class _StockPickingValidatePageState extends State<StockPickingValidatePage> {
  late StockPickingBloc stockPickingBloc;
  bool barcodeLoading = false;
  final MobileScannerController controller = MobileScannerController(
    detectionTimeoutMs: 1000,
  );
  final TextEditingController qtyInputController = TextEditingController();

  @override
  void initState() {
    super.initState();

    stockPickingBloc = context.read<StockPickingBloc>();

    if (stockPickingBloc.state.stockPicking == null ||
        stockPickingBloc.state.stockPicking?.id != widget.id) {
      stockPickingBloc.add(
        FetchStockPickingEvent(id: widget.id),
      );
    }
  }

  void _handleBarcodeDetect(
      BuildContext context, BarcodeCapture barcodeCapture) {
    final barcodes = barcodeCapture.barcodes;

    context.read<StockPickingBloc>().add(
          FetchMoveLinesFromBarcodes(barcodes: barcodes),
        );
  }

  void _editStockMoveLine(BuildContext context, StockMove stockMove) {
    final moveLines = stockMove.moveLines ?? [];

    final receivedQty = moveLines.fold(
        0.0, (value, moveLine) => value + (moveLine.quantity ?? 0));

    qtyInputController.text = receivedQty.toString();

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
                                UpdateStockMoveLineQtyEvent(
                                  moveId: stockMove.id!,
                                  quantity: double.parse(
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
        final moveLines = stockMoves[index].moveLines ?? [];

        final receivedQty = moveLines.fold(
            0.0, (value, moveLine) => value + (moveLine.quantity ?? 0));

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
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
                const SizedBox(
                  width: 4,
                ),
                Text(
                  '$receivedQty/${stockMoves[index].productUomQty}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          onTap: () {
            _editStockMoveLine(context, stockMoves[index]);
          },
        );
      },
    );
  }

  void _showRemainDialog(BuildContext context) {
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
                const Center(
                  child: Text(
                    'Số lượng sản phẩm đã nhận và mong đợi không giống nhau. Bạn có muốn tạo phiếu mới cho phần còn lại?',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
                const SizedBox(
                  height: 12,
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: DangerButton(
                        onPressed: () {
                          stockPickingBloc.add(
                            ValidateStockPickingEvent(createBackorder: false),
                          );
                          context.pop();
                        },
                        labelText: 'Xác nhận và không tạo mới',
                      ),
                    ),
                    const SizedBox(
                      width: 4,
                    ),
                    SizedBox(
                      width: double.infinity,
                      child: PrimaryButton(
                        onPressed: () {
                          stockPickingBloc.add(
                            ValidateStockPickingEvent(createBackorder: true),
                          );
                          context.pop();
                        },
                        labelText: 'Xác nhận và Tạo mới',
                      ),
                    ),
                    const SizedBox(
                      width: 4,
                    ),
                    SizedBox(
                      width: double.infinity,
                      child: PrimaryButton(
                        onPressed: () {
                          context.pop();
                        },
                        labelText: 'Huỷ',
                        isOutline: true,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<StockPickingBloc, StockPickingState>(
      builder: (BuildContext context, StockPickingState state) {
        if (state.loading || state.stockPicking == null) {
          return const PrimaryScaffold(
            shouldBack: true,
            child: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final stockPicking = state.stockPicking!;

        return PrimaryScaffold(
          shouldBack: true,
          title: StockPickingTypeEnum.incoming ==
                  stockPicking.stockPickingType?.code
              ? 'Xác Nhận Nhập Kho'
              : StockPickingTypeEnum.outgoing ==
                      stockPicking.stockPickingType?.code
                  ? 'Xác nhận giao hàng'
                  : 'Xác nhận Nội bộ',
          child: Column(
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
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                child: Row(
                children: [
                  Expanded(
                    child: PrimaryButton(
                      onPressed: () {
                        double expectQty = 0;
                        double receivedQty = 0;

                        for (StockMove stockMove
                            in stockPicking.stockMoves ?? []) {
                          expectQty += stockMove.productUomQty ?? 0;

                          for (StockMoveLine moveLine
                              in stockMove.moveLines ?? []) {
                            receivedQty += moveLine.quantity ?? 0;
                          }
                        }

                        if (expectQty > receivedQty) {
                          _showRemainDialog(context);
                          return;
                        }

                        stockPickingBloc.add(ValidateStockPickingEvent());
                      },
                      labelText: 'Lưu',
                    ),
                  ),
                ],
              ),
              ),
            ],
          ),
        );
      },
      listener: (BuildContext context, StockPickingState state) {
        if (!state.loadingStockMove && barcodeLoading) {
          setState(() {
            barcodeLoading = false;
          });
        }
        
        if (state.createSucceed) {
          final id = state.stockPicking!.id!.toString();
          stockPickingBloc.add(ResetCreateStockPickingEvent());
          context.replaceNamed('stock_picking.show', pathParameters: { 'id': id });
        }

        if (state.barcodeProductError != null &&
            state.barcodeProductError!.isNotEmpty) {
          showBottomErrorSnackBar(context, state.barcodeProductError!);
        }
      },
    );
  }
}
