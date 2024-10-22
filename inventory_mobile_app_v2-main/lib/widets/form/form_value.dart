import 'package:flutter/material.dart';

class FormValue extends StatelessWidget {
  final String labelText;

  const FormValue({super.key, required this.labelText});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        labelText,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 14,
          color: Theme.of(context).colorScheme.secondary,
        ),
      ),
    );
  }
}
