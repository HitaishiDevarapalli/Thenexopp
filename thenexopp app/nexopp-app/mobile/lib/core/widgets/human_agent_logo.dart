import 'package:flutter/material.dart';

class HumanAgentLogo extends StatelessWidget {
  final double size;
  final bool showText;
  final Color? textColor;

  const HumanAgentLogo({
    super.key,
    this.size = 140,
    this.showText = true,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/app_logo.png',
      width: size * 1.8,
      height: size,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) {
        return Icon(
          Icons.business_center_rounded,
          size: size,
          color: Theme.of(context).primaryColor,
        );
      },
    );
  }
}
