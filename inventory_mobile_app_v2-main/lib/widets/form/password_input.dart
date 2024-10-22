import 'package:flutter/material.dart';

class PasswordInput extends StatefulWidget {
  final TextEditingController? controller;
  final FormFieldValidator<String?>? validator;
  final FormFieldSetter<String>? onSaved;

  const PasswordInput({
    super.key,
    this.controller,
    this.validator,
    this.onSaved,
  });

  @override
  State<PasswordInput> createState() => _PasswordInputState();
}

class _PasswordInputState extends State<PasswordInput> {
  late bool _passwordVisible;

  @override
  void initState() {
    super.initState();

    _passwordVisible = false;
  }

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      obscureText: !_passwordVisible,
      controller: widget.controller,
      validator: widget.validator,
      onSaved: widget.onSaved,
      style: const TextStyle(
        fontSize: 14,
      ),
      decoration: InputDecoration(
        hintText: 'Enter your password',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 4,
        ),
        suffixIcon: IconButton(
          icon: Icon(
            // Based on passwordVisible state choose the icon
            _passwordVisible ? Icons.visibility : Icons.visibility_off,
            color: Theme.of(context).primaryColor,
          ),
          onPressed: () {
            // Update the state i.e. toogle the state of passwordVisible variable
            setState(() {
              _passwordVisible = !_passwordVisible;
            });
          },
        ),
      ),
    );
  }
}
