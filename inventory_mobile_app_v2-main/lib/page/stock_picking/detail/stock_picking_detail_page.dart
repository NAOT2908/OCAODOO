import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_bloc.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_event.dart';
import 'package:inven_barcode_app/bloc/stock_picking/stock_picking_state.dart';
import 'package:inven_barcode_app/commons/stock_picking_constants.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/delegate/sliver_persistent_header_delegate_impl.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/widgets/general_tab.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/widgets/stock_moves_tab.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';
import 'package:inven_barcode_app/widets/stock_picking/stock_picking_status_badge.dart';

class StockPickingDetailPage extends StatefulWidget {
  final int id;

  const StockPickingDetailPage({
    super.key,
    required this.id,
  });

  @override
  State<StockPickingDetailPage> createState() => _StockPickingDetailPageState();
}

class _StockPickingDetailPageState extends State<StockPickingDetailPage>
    with SingleTickerProviderStateMixin {
  final _tabs = ['Thông tin chung', 'Sản phẩm'];

  late TabController _tabController;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() => setState(() {}));

    context.read<StockPickingBloc>().add(FetchStockPickingEvent(id: widget.id));
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StockPickingBloc, StockPickingState>(
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
        final stockPickingType = stockPicking.stockPickingType;

        return PrimaryScaffold(
          shouldBack: true,
          title: stockPickingType!.code == StockPickingTypeEnum.incoming
              ? 'Phiếu Nhập Kho'
              : stockPickingType.code == StockPickingTypeEnum.outgoing
                  ? 'Phiếu Xuất Kho'
                  : 'Phiếu Chuyển Nội Bộ',
          child: NestedScrollView(
            headerSliverBuilder:
                (BuildContext context, bool innerBoxIsScrolled) {
              return <Widget>[
                SliverAppBar(
                  automaticallyImplyLeading: false,
                  expandedHeight: 100,
                  collapsedHeight: 100,
                  centerTitle: true,
                  flexibleSpace: FlexibleSpaceBar(
                    titlePadding: const EdgeInsets.only(bottom: 23.0),
                    centerTitle: true,
                    title: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          stockPicking.name ?? '',
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 35,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        StockPickingStatusBadge(
                          state: stockPicking.state ??
                              StockPickingStatusEnum.draft,
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPersistentHeader(
                  delegate: SliverPersistentHeaderDelegateImpl(
                    color: Colors.white,
                    tabBar: TabBar(
                      labelColor: Colors.black,
                      indicatorColor: Colors.black,
                      controller: _tabController,
                      tabs:
                          _tabs.map<Tab>((title) => Tab(text: title)).toList(),
                    ),
                  ),
                  pinned: true,
                  floating: false,
                ),
              ];
            },
            body: TabBarView(
              controller: _tabController,
              children: [
                GeneralTab(stockPicking: stockPicking),
                StockMovesTab(
                  stockPicking: stockPicking,
                  stockMoves: stockPicking.stockMoves ?? [],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
