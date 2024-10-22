import 'package:flutter/material.dart';
import 'package:inven_barcode_app/widets/form/form_label.dart';

class GeneralInfoRow extends StatelessWidget {
  final String label;
  final String content;

  const GeneralInfoRow({
    super.key,
    required this.label,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6,),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FormLabel(labelText: '$label:'),
          const SizedBox(
            width: 6,
          ),
          Expanded(
            child: Text(
              content,
              style: const TextStyle(
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
