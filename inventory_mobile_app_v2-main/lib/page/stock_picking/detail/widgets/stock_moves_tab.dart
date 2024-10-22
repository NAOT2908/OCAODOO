import 'package:flutter/material.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_move.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/widgets/bottom_valdiate_button.dart';

class StockMovesTab extends StatelessWidget {
  final List<StockMove> stockMoves;
  final StockPicking stockPicking;

  const StockMovesTab({
    super.key,
    required this.stockMoves,
    required this.stockPicking,
  });

  Widget _buildStockMoveCard({required StockMove stockMove}) {
    final receivedQty = stockMove.moveLines?.fold(
            0.0, (value, lineData) => value + (lineData.quantity ?? 0)) ??
        0;

    return Card(
      color: Colors.white,
      child: Container(
        padding: const EdgeInsets.symmetric(
          vertical: 16.0,
          horizontal: 12.0,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Text(
                stockMove.name ?? '',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.black,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(
              width: 5,
            ),
            Column(
              children: [
                Text(
                  'Nhu cầu: ${stockMove.productUomQty} ${stockMove.productUom?.name ?? ''}',
                ),
                receivedQty > 0
                    ? Text(
                        'Đã nhận: ${receivedQty} ${stockMove.productUom?.name ?? ''}',
                      )
                    : Container(),
              ],
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverFillRemaining(
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
            child: stockMoves.isEmpty
                ? const Text('Sản phẩm trống')
                : Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        children: stockMoves.map((stockMove) {
                          return _buildStockMoveCard(
                            stockMove: stockMove,
                          );
                        }).toList(),
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
