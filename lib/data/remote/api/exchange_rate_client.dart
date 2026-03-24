import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/exchange_rates_table.dart';

/// Dio-based client for fetching and caching currency exchange rates.
class ExchangeRateClient {
  ExchangeRateClient({
    required Dio dio,
    required AppDatabase database,
  })  : _dio = dio,
        _db = database {
    _dio.options.connectTimeout = const Duration(seconds: 15);
    _dio.options.receiveTimeout = const Duration(seconds: 15);
  }

  final Dio _dio;
  final AppDatabase _db;

  /// How long cached rates remain valid before a new fetch is triggered.
  static const _cacheDuration = Duration(hours: 24);

  /// The free exchange-rate API base URL.
  static const _baseUrl = 'https://api.exchangerate-api.com/v4/latest';

  /// Fetch exchange rates for [baseCurrency].
  ///
  /// Returns a map of currency code -> rate (e.g. `{"USD": 0.012, "EUR": ...}`).
  /// Results are cached locally; a remote fetch only occurs when the cache is
  /// older than 24 hours.
  Future<Map<String, double>> fetchRates(String baseCurrency) async {
    // Try the local cache first.
    final cached = await _getCachedRates(baseCurrency);
    if (cached != null) return cached;

    // Fetch from remote API.
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '$_baseUrl/$baseCurrency',
      );

      final data = response.data;
      if (data == null || data['rates'] == null) {
        throw ExchangeRateException(
          'Invalid response from exchange rate API',
        );
      }

      final rawRates = data['rates'] as Map<String, dynamic>;
      final rates = <String, double>{};

      for (final entry in rawRates.entries) {
        final value = entry.value;
        if (value is num) {
          rates[entry.key] = value.toDouble();
        }
      }

      // Persist to local cache.
      await _cacheRates(baseCurrency, rates);

      return rates;
    } on DioException catch (e) {
      throw ExchangeRateException(
        'Failed to fetch exchange rates: ${e.message}',
        cause: e,
      );
    }
  }

  // ── Cache helpers ────────────────────────────────────────────────────

  /// Returns cached rates if they are less than [_cacheDuration] old.
  Future<Map<String, double>?> _getCachedRates(String baseCurrency) async {
    final cutoff = DateTime.now().subtract(_cacheDuration);

    final rows = await (_db.select(_db.exchangeRatesTable)
          ..where((e) =>
              e.fromCurrency.equals(baseCurrency) &
              e.fetchedAt.isBiggerOrEqualValue(cutoff)))
        .get();

    if (rows.isEmpty) return null;

    return {for (final row in rows) row.toCurrency: row.rate};
  }

  /// Persist fetched rates into the exchange_rates table.
  Future<void> _cacheRates(
    String baseCurrency,
    Map<String, double> rates,
  ) async {
    final now = DateTime.now();
    await _db.batch((batch) {
      for (final entry in rates.entries) {
        batch.insert(
          _db.exchangeRatesTable,
          ExchangeRatesTableCompanion(
            fromCurrency: Value(baseCurrency),
            toCurrency: Value(entry.key),
            rate: Value(entry.value),
            fetchedAt: Value(now),
          ),
          mode: InsertMode.insertOrReplace,
        );
      }
    });
  }
}

/// Exception thrown by [ExchangeRateClient].
class ExchangeRateException implements Exception {
  ExchangeRateException(this.message, {this.cause});

  final String message;
  final Object? cause;

  @override
  String toString() => 'ExchangeRateException: $message';
}
