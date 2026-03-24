/// Supported currencies and currency-related constants.
library;

import 'package:flutter/foundation.dart';

/// Represents a supported currency.
@immutable
class SupportedCurrency {
  const SupportedCurrency({
    required this.code,
    required this.name,
    required this.symbol,
    required this.flag,
    this.decimalDigits = 2,
  });

  /// ISO 4217 currency code (e.g. `'INR'`).
  final String code;

  /// Human-readable currency name.
  final String name;

  /// Currency symbol (e.g. `'₹'`).
  final String symbol;

  /// Unicode flag emoji for the country of origin.
  final String flag;

  /// Number of decimal digits used by this currency.
  final int decimalDigits;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SupportedCurrency &&
          runtimeType == other.runtimeType &&
          code == other.code;

  @override
  int get hashCode => code.hashCode;

  @override
  String toString() => 'SupportedCurrency($code)';
}

/// Currency-related constants and helpers.
abstract final class CurrencyConstants {
  // ── Defaults ──────────────────────────────────────────────────────────

  /// The default currency used throughout the app.
  static const String defaultCurrencyCode = 'INR';

  /// Symbol for Indian Rupee.
  static const String inrSymbol = '₹';

  // ── Supported Currencies ──────────────────────────────────────────────

  static const List<SupportedCurrency> supportedCurrencies = [
    SupportedCurrency(
      code: 'INR',
      name: 'Indian Rupee',
      symbol: '₹',
      flag: '🇮🇳',
    ),
    SupportedCurrency(
      code: 'USD',
      name: 'US Dollar',
      symbol: '\$',
      flag: '🇺🇸',
    ),
    SupportedCurrency(
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      flag: '🇪🇺',
    ),
    SupportedCurrency(
      code: 'GBP',
      name: 'British Pound',
      symbol: '£',
      flag: '🇬🇧',
    ),
    SupportedCurrency(
      code: 'AED',
      name: 'UAE Dirham',
      symbol: 'د.إ',
      flag: '🇦🇪',
    ),
    SupportedCurrency(
      code: 'SGD',
      name: 'Singapore Dollar',
      symbol: 'S\$',
      flag: '🇸🇬',
    ),
    SupportedCurrency(
      code: 'AUD',
      name: 'Australian Dollar',
      symbol: 'A\$',
      flag: '🇦🇺',
    ),
    SupportedCurrency(
      code: 'CAD',
      name: 'Canadian Dollar',
      symbol: 'C\$',
      flag: '🇨🇦',
    ),
    SupportedCurrency(
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      flag: '🇯🇵',
      decimalDigits: 0,
    ),
    SupportedCurrency(
      code: 'SAR',
      name: 'Saudi Riyal',
      symbol: '﷼',
      flag: '🇸🇦',
    ),
    SupportedCurrency(
      code: 'QAR',
      name: 'Qatari Riyal',
      symbol: '﷼',
      flag: '🇶🇦',
    ),
    SupportedCurrency(
      code: 'KWD',
      name: 'Kuwaiti Dinar',
      symbol: 'د.ك',
      flag: '🇰🇼',
      decimalDigits: 3,
    ),
    SupportedCurrency(
      code: 'BHD',
      name: 'Bahraini Dinar',
      symbol: '.د.ب',
      flag: '🇧🇭',
      decimalDigits: 3,
    ),
    SupportedCurrency(
      code: 'OMR',
      name: 'Omani Rial',
      symbol: '﷼',
      flag: '🇴🇲',
      decimalDigits: 3,
    ),
    SupportedCurrency(
      code: 'MYR',
      name: 'Malaysian Ringgit',
      symbol: 'RM',
      flag: '🇲🇾',
    ),
    SupportedCurrency(
      code: 'NPR',
      name: 'Nepalese Rupee',
      symbol: 'रू',
      flag: '🇳🇵',
    ),
    SupportedCurrency(
      code: 'LKR',
      name: 'Sri Lankan Rupee',
      symbol: 'Rs',
      flag: '🇱🇰',
    ),
  ];

  /// Retrieve a [SupportedCurrency] by its ISO code. Returns `null` if
  /// the code is not in the supported list.
  static SupportedCurrency? findByCode(String code) {
    final upper = code.toUpperCase();
    for (final currency in supportedCurrencies) {
      if (currency.code == upper) return currency;
    }
    return null;
  }

  /// The default [SupportedCurrency] (INR).
  static SupportedCurrency get defaultCurrency =>
      supportedCurrencies.first; // INR is always first.
}
