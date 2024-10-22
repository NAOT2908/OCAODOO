import 'package:flutter/material.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';

class StockPickingStatusBadge extends StatelessWidget {
  final StockPickingStatusEnum state;

  const StockPickingStatusBadge({
    super.key,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 4),
      width: 80,
      decoration: BoxDecoration(
        color: state.backgroundColor,
        borderRadius: const BorderRadius.all(Radius.circular(50)),
      ),
      child: Center(
        child: Text(
          state.label,
          style: TextStyle(
            color: state.textColor,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}
