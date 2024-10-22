import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_state.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/models/stock_picking.dart';
import 'package:inven_barcode_app/page/stock_picking/new/step1_general.dart';
import 'package:inven_barcode_app/page/stock_picking/new/step2_products.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';

class StockPickingNewPage extends StatefulWidget {
  final StockPickingTypeEnum type;

  const StockPickingNewPage({
    super.key,
    required this.type,
  });

  @override
  State<StockPickingNewPage> createState() => _StockPickingNewPageState();
}

class _StockPickingNewPageState extends State<StockPickingNewPage> {
  int step = 1;

  @override
  void initState() {
    super.initState();

    context.read<StockPickingBloc>().add(
          FetchDefaultValuesEvent(type: widget.type),
        );
  }

  void handleNextStep() {
    if (step < 2) {
      setState(() {
        step++;
      });
      return;
    }

    final stockPickingBloc = context.read<StockPickingBloc>();

    stockPickingBloc.add(
      SaveStockPickingEvent(stockPicking: stockPickingBloc.state.stockPicking!),
    );
  }

  void handleBackStep() {
    setState(() {
      step--;
    });
  }

  Widget renderPage(StockPicking stockPicking) {
    switch (step) {
      case 2:
        return StockPickingNewStep2(
          onSubmit: handleNextStep,
          onBack: handleBackStep,
          stockPicking: stockPicking,
        );
      default:
        return StockPickingNewStep1(
          onSubmit: handleNextStep,
          stockPicking: stockPicking,
          type: widget.type,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return PrimaryScaffold(
      shouldBack: true,
      title: widget.type == StockPickingTypeEnum.incoming
          ? 'Tạo Phiếu Nhập Kho'
          : widget.type == StockPickingTypeEnum.outgoing
              ? 'Tạo Phiếu Xuất Kho'
              : 'Tạo Phiếu Nội Bộ',
      child: BlocBuilder<StockPickingBloc, StockPickingState>(
        builder: (BuildContext context, StockPickingState state) {
          if (state.loading || state.stockPicking == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          return Container(
            padding: const EdgeInsets.symmetric(
              vertical: 20,
              horizontal: 12,
            ),
            child: renderPage(state.stockPicking!),
          );
        },
      ),
    );
  }
}
