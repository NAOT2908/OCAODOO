import 'package:flutter/material.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/page/stock_picking/new/widgets/step1_dest_location.dart';
import 'package:inven_barcode_app/page/stock_picking/new/widgets/step1_source_location.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';

class StockPickingNewStep1 extends StatefulWidget {
  final VoidCallback onSubmit;
  final StockPicking? stockPicking;
  final StockPickingTypeEnum type;

  const StockPickingNewStep1({
    super.key,
    required this.onSubmit,
    required this.stockPicking,
    required this.type,
  });

  @override
  State<StockPickingNewStep1> createState() => _StockPickingNewStep1State();
}

class _StockPickingNewStep1State extends State<StockPickingNewStep1> {
  @override
  Widget build(BuildContext context) {
    return widget.stockPicking != null
        ? Column(
            children: [
              Step1SourceLocation(
                type: widget.type,
                stockPicking: widget.stockPicking!,
              ),
              const SizedBox(
                height: 20,
              ),
              Step1DestLocation(
                type: widget.type,
                stockPicking: widget.stockPicking!,
              ),
              const SizedBox(
                height: 20,
              ),
              SizedBox(
                width: double.infinity,
                child: PrimaryButton(
                  onPressed: () {
                    widget.onSubmit();
                  },
                  labelText: 'Tiếp tục',
                ),
              ),
            ],
          )
        : Container();
  }
}
