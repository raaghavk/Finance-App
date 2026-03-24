import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Custom amount input widget with large ₹ prefix and Indian number formatting.
///
/// Formats the amount in the Indian number system (e.g. 1,23,456.00) as the
/// user types. Supports an optional currency selector for multi-currency use.
class AmountInput extends StatefulWidget {
  const AmountInput({
    super.key,
    required this.amount,
    required this.onAmountChanged,
    this.currencySymbol = '\u20B9',
    this.autofocus = true,
  });

  final double amount;
  final ValueChanged<double> onAmountChanged;
  final String currencySymbol;
  final bool autofocus;

  @override
  State<AmountInput> createState() => _AmountInputState();
}

class _AmountInputState extends State<AmountInput> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: widget.amount > 0 ? _rawAmount(widget.amount) : '',
    );
  }

  @override
  void didUpdateWidget(covariant AmountInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Only update if the external value differs and we are not actively editing.
    if (oldWidget.amount != widget.amount && !_controller.selection.isValid) {
      _controller.text =
          widget.amount > 0 ? _rawAmount(widget.amount) : '';
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Returns the raw digits-only string for a double.
  String _rawAmount(double amount) {
    if (amount == amount.truncateToDouble()) {
      return amount.truncate().toString();
    }
    return amount.toStringAsFixed(2);
  }

  /// Format a number string using the Indian number system.
  static String formatIndian(String raw) {
    // Remove everything except digits and one decimal point.
    final cleaned = raw.replaceAll(RegExp(r'[^\d.]'), '');
    if (cleaned.isEmpty) return '';

    final parts = cleaned.split('.');
    final wholePart = parts[0];
    final decimalPart = parts.length > 1 ? '.${parts[1]}' : '';

    if (wholePart.length <= 3) return '$wholePart$decimalPart';

    final last3 = wholePart.substring(wholePart.length - 3);
    var remaining = wholePart.substring(0, wholePart.length - 3);
    final groups = <String>[];

    while (remaining.length > 2) {
      groups.add(remaining.substring(remaining.length - 2));
      remaining = remaining.substring(0, remaining.length - 2);
    }
    if (remaining.isNotEmpty) groups.add(remaining);
    final reversed = groups.reversed.join(',');
    return '$reversed,$last3$decimalPart';
  }

  void _onChanged(String text) {
    final cleaned = text.replaceAll(RegExp(r'[^\d.]'), '');
    final value = double.tryParse(cleaned) ?? 0;
    widget.onAmountChanged(value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.3),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            widget.currencySymbol,
            style: theme.textTheme.displaySmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: _controller,
              autofocus: widget.autofocus,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[\d.]')),
                _IndianNumberFormatter(),
              ],
              style: theme.textTheme.displaySmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              decoration: const InputDecoration(
                hintText: '0',
                border: InputBorder.none,
                filled: false,
                contentPadding: EdgeInsets.zero,
                isDense: true,
              ),
              onChanged: _onChanged,
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Indian number system formatter
// ---------------------------------------------------------------------------

class _IndianNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // Allow empty.
    if (newValue.text.isEmpty) return newValue;

    // Only allow a single decimal point.
    final cleaned = newValue.text.replaceAll(RegExp(r'[^\d.]'), '');
    final dotCount = '.'.allMatches(cleaned).length;
    if (dotCount > 1) return oldValue;

    // Limit decimal digits to 2.
    final parts = cleaned.split('.');
    String decimalPart = '';
    if (parts.length > 1) {
      decimalPart = '.${parts[1].length > 2 ? parts[1].substring(0, 2) : parts[1]}';
    }
    final wholePart = parts[0];

    // Apply Indian grouping to the whole part.
    String formatted;
    if (wholePart.length <= 3) {
      formatted = '$wholePart$decimalPart';
    } else {
      final last3 = wholePart.substring(wholePart.length - 3);
      var remaining = wholePart.substring(0, wholePart.length - 3);
      final groups = <String>[];

      while (remaining.length > 2) {
        groups.add(remaining.substring(remaining.length - 2));
        remaining = remaining.substring(0, remaining.length - 2);
      }
      if (remaining.isNotEmpty) groups.add(remaining);
      final reversed = groups.reversed.join(',');
      formatted = '$reversed,$last3$decimalPart';
    }

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
