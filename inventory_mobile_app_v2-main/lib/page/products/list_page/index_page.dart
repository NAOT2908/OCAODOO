import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:inven_barcode_app/bloc/product/product_bloc.dart';
import 'package:inven_barcode_app/bloc/product/product_event.dart';
import 'package:inven_barcode_app/bloc/product/product_state.dart';
import 'package:inven_barcode_app/page/products/list_page/widgets/list_item.dart';
import 'package:inven_barcode_app/widets/primary_scaffold.dart';

class ProductListPage extends StatefulWidget {
  const ProductListPage({super.key});

  @override
  State<StatefulWidget> createState() => _ProductListPageState();
}

class _ProductListPageState extends State<ProductListPage> {
  late ProductBloc productBloc;

  @override
  void initState() {
    super.initState();

    productBloc = context.read<ProductBloc>();

    productBloc.add(LoadProductListEvent(page: 1));
  }

  @override
  Widget build(BuildContext context) {
    return PrimaryScaffold(
      title: 'Sản phẩm',
      child: BlocBuilder<ProductBloc, ProductState>(
        builder: (BuildContext context, ProductState state) {
          if (state.loadingList && state.productList == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          final productList = state.productList ?? [];

          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: NotificationListener<ScrollNotification>(
              onNotification: (ScrollNotification scrollInfo) {
                if (!state.loadingList && state.hasListMore &&
                    scrollInfo.metrics.pixels ==
                        scrollInfo.metrics.maxScrollExtent) {
                  productBloc.add(LoadProductListEvent(page: state.currentPage + 1));
                }
                return false;
              },
              child: ListView.builder(
                itemCount: productList.length,
                itemBuilder: (BuildContext context, int index) {
                  if (index == productList.length && state.hasListMore) {
                    // Display loading indicator at the end of the list
                    return const Center(child: CircularProgressIndicator());
                  }

                  return ProductListItem(
                    product: productList[index],
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
