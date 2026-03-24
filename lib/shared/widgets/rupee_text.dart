/// Displays a monetary amount formatted with the Indian Rupee symbol.
library;

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class RupeeText extends StatelessWidget {
  const RupeeText(
    this.amount, {
    this.style,
    this.compact = false,
    super.key,
  });

  /// The monetary value to display.
  final double amount;

  /// Optional text style override.
  final TextStyle? style;

  /// When `true`, large values are abbreviated (e.g. 1.2L, 50K).
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Text(
      _format(amount),
      style: style,
    );
  }

  /// Formats [value] as an Indian-style currency string with the Rupee sign.
  String _format(double value) {
    if (compact) {
      return _formatCompact(value);
    }
    return _IndianNumberFormat.format(value);
  }

  /// Compact representation for large values using Indian units.
  static String _formatCompact(double value) {
    final abs = value.abs();
    final sign = value < 0 ? '-' : '';

    if (abs >= 10000000) {
      // Crores
      final cr = abs / 10000000;
      return '$sign\u20B9${_trimTrailing(cr.toStringAsFixed(1))} Cr';
    } else if (abs >= 100000) {
      // Lakhs
      final lakh = abs / 100000;
      return '$sign\u20B9${_trimTrailing(lakh.toStringAsFixed(1))} L';
    } else if (abs >= 1000) {
      // Thousands
      final k = abs / 1000;
      return '$sign\u20B9${_trimTrailing(k.toStringAsFixed(1))} K';
    }
    return _IndianNumberFormat.format(value);
  }

  /// Removes a trailing ".0" from a formatted number string.
  static String _trimTrailing(String s) =>
      s.endsWith('.0') ? s.substring(0, s.length - 2) : s;
}

/// Formats a number using the Indian numbering system (lakh / crore grouping)
/// with the Rupee sign prefix.
class _IndianNumberFormat {
  _IndianNumberFormat._();

  static final NumberFormat _formatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '\u20B9',
    decimalDigits: 2,
  );

  /// Returns a fully formatted Indian currency string, e.g. `\u20B91,23,456.78`.
  static String format(double value) => _formatter.format(value);
}
