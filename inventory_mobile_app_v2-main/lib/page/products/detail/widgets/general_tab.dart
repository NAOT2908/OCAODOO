import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:inven_barcode_app/models/product.dart';
import 'package:inven_barcode_app/widets/general_info_row.dart';

class GeneralTab extends StatelessWidget {
  final Product product;

  const GeneralTab({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverFillRemaining(
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 16,
            ),
            child: Column(
              children: [
                GeneralInfoRow(label: 'Tên sản phẩm', content: product.name!),
                product.description != null
                    ? Column(
                        children: [
                          const SizedBox(
                            height: 4,
                          ),
                          GeneralInfoRow(
                              label: 'Mô tả', content: product.description!),
                        ],
                      )
                    : Container(),
                product.listPrice != null
                    ? Column(
                        children: [
                          const SizedBox(
                            height: 4,
                          ),
                          GeneralInfoRow(
                            label: 'Giá bán',
                            content: product.displayPrice(product.listPrice),
                          ),
                        ],
                      )
                    : Container(),
                product.costPrice != null
                    ? Column(
                        children: [
                          const SizedBox(
                            height: 4,
                          ),
                          GeneralInfoRow(
                            label: 'Chi phí',
                            content: product.displayPrice(product.costPrice),
                          ),
                        ],
                      )
                    : Container(),
                const SizedBox(
                  height: 4,
                ),
                product.barcode != null
                    ? GeneralInfoRow(
                        label: 'Mã vạch', content: product.barcode!)
                    : Container(),
                product.barcodeImage != null
                    ? Column(
                        children: [
                          const SizedBox(
                            height: 4,
                          ),
                          Image.memory(
                            base64Decode(product.barcodeImage!),
                            fit: BoxFit.cover,
                          ),
                        ],
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
