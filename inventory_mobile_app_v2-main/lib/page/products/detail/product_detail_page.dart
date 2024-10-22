import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/product/product_bloc.dart';
import 'package:inven_barcode_app/bloc/product/product_event.dart';
import 'package:inven_barcode_app/bloc/product/product_state.dart';
import 'package:inven_barcode_app/page/products/detail/widgets/general_tab.dart';
import 'package:inven_barcode_app/page/products/detail/widgets/stock_tab.dart';
import 'package:inven_barcode_app/page/stock_picking/detail/delegate/sliver_persistent_header_delegate_impl.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';

class ProductDetailPage extends StatefulWidget {
  final int id;

  const ProductDetailPage({
    super.key,
    required this.id,
  });

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage>
    with SingleTickerProviderStateMixin {
  final _tabs = ['Thông tin chung', 'Tồn kho'];

  late TabController _tabController;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() => setState(() {}));

    context.read<ProductBloc>().add(LoadProductDetailEvent(id: widget.id));
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProductBloc, ProductState>(
      builder: (BuildContext context, ProductState state) {
        if (state.loadingDetail || state.product == null) {
          return const PrimaryScaffold(
            title: 'Sản phẩm',
            child: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final product = state.product!;

        return PrimaryScaffold(
          shouldBack: true,
          title: 'Sản phẩm',
          child: NestedScrollView(
            headerSliverBuilder:
                (BuildContext context, bool innerBoxIsScrolled) {
              return <Widget>[
                product.productImage != null
                    ? SliverAppBar(
                        automaticallyImplyLeading: false,
                        expandedHeight: 100,
                        collapsedHeight: 100,
                        centerTitle: true,
                        flexibleSpace: FlexibleSpaceBar(
                          titlePadding: const EdgeInsets.only(bottom: 23.0),
                          centerTitle: true,
                          background: Image.memory(
                            base64Decode(product.productImage!),
                            fit: BoxFit.contain,
                          ),
                        ),
                      )
                    : Container(),
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
                GeneralTab(product: state.product!),
                StockTab(product: state.product!),
              ],
            ),
          ),
        );
      },
    );
  }
}
