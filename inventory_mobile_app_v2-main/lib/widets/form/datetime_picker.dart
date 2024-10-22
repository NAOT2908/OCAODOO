import 'package:flutter/material.dart';

class DatetimePicker extends StatelessWidget {
  final String? hintText;
  final TextEditingController? controller;
  final FormFieldValidator<String?>? validator;
  final FormFieldSetter<String>? onSaved;
  final ValueChanged<DateTime> onChanged;

  const DatetimePicker({
    super.key,
    this.hintText,
    this.controller,
    this.validator,
    this.onSaved,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
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
      readOnly: true,
      onTap: () async {
        final resultDate = await showDatePicker(
          context: context,
          firstDate: DateTime(1900),
          lastDate: DateTime(9999),
        );

        if (resultDate == null) return;

        final result = await showTimePicker(
          context: context,
          initialTime: TimeOfDay.fromDateTime(resultDate),
        );

        if (result == null) return;

        onChanged(DateTime(
          resultDate.year,
          resultDate.month,
          resultDate.day,
          result.hour,
          result.minute,
        ));
      },
    );
  }
}
