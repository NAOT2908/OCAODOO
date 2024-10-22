import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_state.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/commons/stock_picking_utils.dart';
import 'package:inven_barcode_app/page/stock_picking/list_page/widgets/list_item.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';

class StockPickingListPage extends StatefulWidget {
  final StockPickingTypeEnum type;

  const StockPickingListPage({super.key, required this.type});

  @override
  State<StatefulWidget> createState() => _StockPickingListPageState();
}

class _StockPickingListPageState extends State<StockPickingListPage> {
  late StockPickingBloc stockPickingBloc;

  @override
  void initState() {
    super.initState();

    stockPickingBloc = context.read<StockPickingBloc>();

    stockPickingBloc.add(LoadStockPickingListEvent(type: widget.type));
  }

  @override
  Widget build(BuildContext context) {
    return PrimaryScaffold(
      title: generateCommonTitle(widget.type),
      actions: [
        ActionButton(
            onPressed: () {
              context.pushNamed(
                'stock_picking.create',
                queryParameters: {'type': widget.type.value},
              );
            },
            icon: Icons.add),
      ],
      child: BlocBuilder<StockPickingBloc, StockPickingState>(
        builder: (BuildContext context, StockPickingState state) {
          if (state.loading && state.stockList == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          final stockList = state.stockList ?? [];

          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: NotificationListener<ScrollNotification>(
              onNotification: (ScrollNotification scrollInfo) {
                if (!state.loading &&
                    state.hasListMore &&
                    scrollInfo.metrics.pixels ==
                        scrollInfo.metrics.maxScrollExtent) {
                  stockPickingBloc.add(LoadStockPickingListEvent(
                      type: widget.type, page: state.currentPage + 1));
                }
                return false;
              },
              child: ListView.builder(
                itemCount: stockList.length,
                itemBuilder: (BuildContext context, int index) {
                  if (index == stockList.length && state.hasListMore) {
                    // Display loading indicator at the end of the list
                    return const Center(child: CircularProgressIndicator());
                  }

                  return StockPickingListItem(
                    type: widget.type,
                    stockPicking: stockList[index],
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
