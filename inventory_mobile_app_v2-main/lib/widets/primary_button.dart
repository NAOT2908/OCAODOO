import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  final Function()? onPressed;
  final String labelText;
  final bool isOutline;
  final Icon? icon;

  const PrimaryButton({
    super.key,
    required this.onPressed,
    required this.labelText,
    this.isOutline = false,
    this.icon,
  });

  Widget renderLabelText(BuildContext context) {
    return Text(
      labelText,
      style: TextStyle(
        color: isOutline ? Theme.of(context).colorScheme.primary : Colors.white,
        fontSize: 16,
      ),
    );
  }

  ButtonStyle renderButtonStyle(BuildContext context) {
    return ElevatedButton.styleFrom(
      backgroundColor:
          isOutline ? Colors.white : Theme.of(context).colorScheme.primary,
    );
  }

  Widget renderIconButton(
    BuildContext context,
  ) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      style: renderButtonStyle(context),
      icon: icon,
      label: renderLabelText(context),
    );
  }

  Widget renderTextButton(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: renderButtonStyle(context),
      child: renderLabelText(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    return icon != null ? renderIconButton(context) : renderTextButton(context);
  }
}
