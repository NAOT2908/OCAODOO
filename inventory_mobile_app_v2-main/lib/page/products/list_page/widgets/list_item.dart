import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/models/product.dart';

class ProductListItem extends StatelessWidget {
  final Product product;

  const ProductListItem({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.pushNamed(
          'products.show',
          pathParameters: {'id': product.id.toString()},
        );
      },
      child: Card(
        color: Colors.white,
        child: Row(
          children: [
            SizedBox(
              width: 90,
              height: 90,
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
                child: product.productImage != null
                    ? Image.memory(
                        base64Decode(product.productImage!),
                        fit: BoxFit.cover,
                      )
                    : Container(
                        color: Colors.grey,
                      ),
              ),
            ),
            Expanded(
              child: Container(
                height: 90,
                padding: const EdgeInsets.symmetric(
                  vertical: 8.0,
                  horizontal: 12.0,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name ?? '',
                      style: const TextStyle(
                        color: Colors.black,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                            'SL: ${product.availableQty ?? 0} ${product.productUom?.name ?? ''}'),
                        Text(
                          product.displayPrice(product.listPrice),
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
