import 'package:flutter/material.dart';

class TextInput extends StatelessWidget {
  final String? hintText;
  final TextEditingController? controller;
  final FormFieldValidator<String?>? validator;
  final FormFieldSetter<String>? onSaved;
  final TextInputType? keyboardType;

  const TextInput({
    super.key,
    this.hintText,
    this.controller,
    this.validator,
    this.onSaved,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      keyboardType: keyboardType,
      controller: controller,
      validator: validator,
      onSaved: onSaved,
      style: const TextStyle(
        fontSize: 14,
      ),
      decoration: InputDecoration(
        hintText: hintText,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 4,
        ),
      ),
    );
  }
}
