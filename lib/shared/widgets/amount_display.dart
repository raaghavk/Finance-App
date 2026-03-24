/// Currency display widget for PaisaTrack.
///
/// Renders monetary amounts with Indian number formatting (lakhs/crores),
/// automatic income/expense colouring, optional sign prefix, and animated
/// value transitions. Three size variants: large, medium, and small.
library;

import 'package:flutter/material.dart';
import 'package:paisa_track/core/theme/app_animations.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/theme/app_typography.dart';

enum AmountSize { large, medium, small }

enum AmountSign { auto, positive, negative, none }

class AmountDisplay extends StatelessWidget {
  const AmountDisplay({
    super.key,
    required this.amount,
    this.size = AmountSize.medium,
    this.sign = AmountSign.auto,
    this.showCurrencySymbol = true,
    this.currencySymbol = '\u20B9',
    this.animate = false,
    this.color,
    this.neutralColor,
    this.decimalDigits = 2,
    this.showDecimalsIfZero = false,
    this.textAlign = TextAlign.start,
    this.overflow = TextOverflow.ellipsis,
    this.maxLines = 1,
  });

  /// The numeric value to display.
  final double amount;

  /// Size variant: large (34sp), medium (16sp), or small (14sp).
  final AmountSize size;

  /// Sign behaviour:
  /// - [AmountSign.auto]: shows +/- based on value (positive gets +,
  ///   negative gets -, zero gets nothing).
  /// - [AmountSign.positive]: always show + prefix.
  /// - [AmountSign.negative]: always show - prefix.
  /// - [AmountSign.none]: no sign prefix.
  final AmountSign sign;

  /// Whether to prepend the currency symbol. Defaults to true.
  final bool showCurrencySymbol;

  /// Currency symbol. Defaults to ₹.
  final String currencySymbol;

  /// Whether to animate value changes with a count-up/down tween.
  final bool animate;

  /// Override the auto-colour. When set, this takes precedence.
  final Color? color;

  /// Colour for zero / neutral amounts. Defaults to the theme's onSurface.
  final Color? neutralColor;

  /// Number of decimal places. Defaults to 2.
  final int decimalDigits;

  /// Whether to show decimals when the fractional part is zero.
  final bool showDecimalsIfZero;

  /// Text alignment.
  final TextAlign textAlign;

  /// Overflow handling.
  final TextOverflow overflow;

  /// Max lines.
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    if (animate) {
      return _AnimatedAmountDisplay(
        amount: amount,
        builder: (value) => _buildText(context, value),
      );
    }
    return _buildText(context, amount);
  }

  Widget _buildText(BuildContext context, double value) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveColor = color ?? _resolveColor(value, isDark, context);

    final textStyle = switch (size) {
      AmountSize.large => AppTypography.amountLarge(color: effectiveColor),
      AmountSize.medium => AppTypography.amountMedium(color: effectiveColor),
      AmountSize.small => AppTypography.amountSmall(color: effectiveColor),
    };

    final formatted = _formatAmount(value);

    return Text(
      formatted,
      style: textStyle,
      textAlign: textAlign,
      overflow: overflow,
      maxLines: maxLines,
    );
  }

  Color _resolveColor(double value, bool isDark, BuildContext context) {
    if (value > 0) {
      return isDark ? AppColors.income : AppColors.incomeDark;
    } else if (value < 0) {
      return isDark ? AppColors.expense : AppColors.expenseDark;
    }
    return neutralColor ??
        (isDark ? AppColors.darkOnSurface : AppColors.lightOnSurface);
  }

  String _formatAmount(double value) {
    final prefix = _resolveSign(value);
    final symbol = showCurrencySymbol ? currencySymbol : '';
    final absValue = value.abs();
    final formattedNumber = _formatIndianNumber(absValue);
    return '$prefix$symbol$formattedNumber';
  }

  String _resolveSign(double value) {
    return switch (sign) {
      AmountSign.auto => value > 0
          ? '+'
          : value < 0
              ? '-'
              : '',
      AmountSign.positive => '+',
      AmountSign.negative => '-',
      AmountSign.none => '',
    };
  }

  /// Formats a number using the Indian numbering system:
  /// 1,00,000 (one lakh), 1,00,00,000 (one crore), etc.
  String _formatIndianNumber(double value) {
    final hasFraction = value != value.truncateToDouble();
    final showDecimals = hasFraction || showDecimalsIfZero;

    String intPart;
    String decPart;

    if (showDecimals) {
      final parts = value.toStringAsFixed(decimalDigits).split('.');
      intPart = parts[0];
      decPart = '.${parts[1]}';
    } else {
      intPart = value.truncate().toString();
      decPart = '';
    }

    // Apply Indian comma grouping to the integer part.
    // Pattern: last 3 digits, then groups of 2 from right to left.
    // e.g. 1234567 -> 12,34,567
    if (intPart.length > 3) {
      final chunks = <String>[];
      chunks.add(intPart.substring(intPart.length - 3));

      var rest = intPart.substring(0, intPart.length - 3);
      while (rest.length > 2) {
        chunks.insert(0, rest.substring(rest.length - 2));
        rest = rest.substring(0, rest.length - 2);
      }
      if (rest.isNotEmpty) {
        chunks.insert(0, rest);
      }

      intPart = chunks.join(',');
    }

    return '$intPart$decPart';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ANIMATED VALUE TRANSITION
// ══════════════════════════════════════════════════════════════════════════════

class _AnimatedAmountDisplay extends StatefulWidget {
  const _AnimatedAmountDisplay({
    required this.amount,
    required this.builder,
  });

  final double amount;
  final Widget Function(double value) builder;

  @override
  State<_AnimatedAmountDisplay> createState() =>
      _AnimatedAmountDisplayState();
}

class _AnimatedAmountDisplayState extends State<_AnimatedAmountDisplay>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  double _previousAmount = 0;

  @override
  void initState() {
    super.initState();
    _previousAmount = widget.amount;
    _controller = AnimationController(
      duration: AppAnimations.slow,
      vsync: this,
    );
    _animation = Tween<double>(
      begin: widget.amount,
      end: widget.amount,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: AppAnimations.defaultCurve,
    ));
  }

  @override
  void didUpdateWidget(covariant _AnimatedAmountDisplay oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.amount != widget.amount) {
      _previousAmount = oldWidget.amount;
      _animation = Tween<double>(
        begin: _previousAmount,
        end: widget.amount,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: AppAnimations.defaultCurve,
      ));
      _controller
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) => widget.builder(_animation.value),
    );
  }
}
