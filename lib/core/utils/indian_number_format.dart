/// Indian number formatting utility.
///
/// Implements the Indian grouping system where the last three digits
/// are grouped together, followed by groups of two.
///
/// Example: `1234567.89` → `₹12,34,567.89`
library;

abstract final class IndianNumberFormat {
  /// Formats [amount] using the Indian grouping system.
  ///
  /// * [symbol] – currency symbol prepended to the result (default `'₹'`).
  /// * [decimals] – number of decimal places (default `2`).
  ///
  /// ```dart
  /// IndianNumberFormat.format(1234567.89); // '₹12,34,567.89'
  /// IndianNumberFormat.format(1000);       // '₹1,000.00'
  /// IndianNumberFormat.format(99);         // '₹99.00'
  /// ```
  static String format(
    double amount, {
    String symbol = '₹',
    int decimals = 2,
  }) {
    final isNegative = amount < 0;
    final absolute = amount.abs();

    // Split into integer and decimal parts.
    final fixed = absolute.toStringAsFixed(decimals);
    final parts = fixed.split('.');
    final integerPart = parts[0];
    final decimalPart = parts.length > 1 ? '.${parts[1]}' : '';

    final formatted = _groupIndian(integerPart);

    final prefix = isNegative ? '-' : '';
    final space = symbol.isNotEmpty ? '' : '';
    return '$prefix$symbol$space$formatted$decimalPart';
  }

  /// Applies Indian-style comma grouping to an integer string.
  ///
  /// The rightmost three digits form the first group; every subsequent
  /// group contains two digits.
  static String _groupIndian(String digits) {
    if (digits.length <= 3) return digits;

    // Last three digits.
    final lastThree = digits.substring(digits.length - 3);
    var remaining = digits.substring(0, digits.length - 3);

    final buffer = StringBuffer();
    while (remaining.length > 2) {
      buffer.write('${remaining.substring(remaining.length - 2)},');
      remaining = remaining.substring(0, remaining.length - 2);
    }
    if (remaining.isNotEmpty) {
      buffer.write('$remaining,');
    }

    // Reverse the groups we built (they were added right-to-left).
    final groups = buffer.toString().split(',').where((g) => g.isNotEmpty).toList();
    final reversed = groups.reversed.join(',');

    return '$reversed,$lastThree';
  }
}
