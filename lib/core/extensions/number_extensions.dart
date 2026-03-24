/// Convenience extensions on [num] for Indian currency formatting.
library;

import 'package:paisa_track/core/utils/indian_number_format.dart';

extension NumberExtensions on num {
  /// Formats the number as Indian Rupees with the ₹ symbol using the
  /// Indian grouping system (e.g. `₹1,23,456.00`).
  String toINR({int decimals = 2}) =>
      IndianNumberFormat.format(toDouble(), symbol: '₹', decimals: decimals);

  /// Converts large numbers to a compact Indian representation.
  ///
  /// * Values ≥ 1,00,00,000 are shown as Cr (e.g. `2.3Cr`).
  /// * Values ≥ 1,00,000 are shown as L (e.g. `1.5L`).
  /// * Smaller values are returned as-is with two decimal places.
  String toLakhCrore() {
    final abs = toDouble().abs();
    final sign = toDouble() < 0 ? '-' : '';

    if (abs >= 10000000) {
      // 1 Crore = 1,00,00,000
      final crores = abs / 10000000;
      return '$sign${_trimTrailing(crores.toStringAsFixed(1))}Cr';
    }
    if (abs >= 100000) {
      // 1 Lakh = 1,00,000
      final lakhs = abs / 100000;
      return '$sign${_trimTrailing(lakhs.toStringAsFixed(1))}L';
    }
    return toStringAsFixed(2);
  }

  /// Returns a compact representation: Cr / L for large values, otherwise
  /// comma-formatted with the Indian grouping system (no symbol).
  String toCompact() {
    final abs = toDouble().abs();
    if (abs >= 100000) return toLakhCrore();
    return IndianNumberFormat.format(toDouble(), symbol: '', decimals: 2);
  }

  /// Removes a trailing `.0` from a string like `"1.0"` → `"1"`.
  static String _trimTrailing(String value) {
    if (value.endsWith('.0')) return value.substring(0, value.length - 2);
    return value;
  }
}
