import 'package:flutter/material.dart';

class FormLabel extends StatelessWidget {
  final String labelText;

  const FormLabel({super.key, required this.labelText});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        labelText,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
          color: Theme.of(context).colorScheme.tertiary,
        ),
      ),
    );
  }
}
