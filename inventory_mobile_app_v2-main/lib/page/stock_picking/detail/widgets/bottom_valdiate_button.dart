import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:inven_barcode_app/widets/primary_button.dart';

class BottomValidateButton extends StatelessWidget {
  final int id;

  const BottomValidateButton({
    super.key,
    required this.id,
  });

  @override
  Widget build(BuildContext context) {
    return PrimaryButton(
        onPressed: () {
          context.pushNamed(
            'stock_picking.validate',
            pathParameters: {'id': id.toString()},
          );
        },
        labelText: 'Xác nhận');
  }
}
