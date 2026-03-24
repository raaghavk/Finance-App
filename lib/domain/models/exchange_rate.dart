import 'package:freezed_annotation/freezed_annotation.dart';

part 'exchange_rate.freezed.dart';
part 'exchange_rate.g.dart';

/// A cached currency exchange rate.
@freezed
class ExchangeRate with _$ExchangeRate {
  const factory ExchangeRate({
    /// Source ISO 4217 currency code.
    required String fromCurrency,

    /// Target ISO 4217 currency code.
    required String toCurrency,

    /// Conversion rate (1 unit of [fromCurrency] = [rate] units of [toCurrency]).
    required double rate,

    /// When this rate was fetched from the API.
    required DateTime fetchedAt,
  }) = _ExchangeRate;

  factory ExchangeRate.fromJson(Map<String, dynamic> json) =>
      _$ExchangeRateFromJson(json);
}
