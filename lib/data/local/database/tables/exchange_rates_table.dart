import 'package:drift/drift.dart';

/// Cached currency exchange rates fetched from a remote API.
class ExchangeRatesTable extends Table {
  @override
  String get tableName => 'exchange_rates';

  /// Source currency ISO 4217 code.
  TextColumn get fromCurrency => text()();

  /// Target currency ISO 4217 code.
  TextColumn get toCurrency => text()();

  /// Conversion rate: 1 [fromCurrency] = [rate] [toCurrency].
  RealColumn get rate => real()();

  /// When this rate was last retrieved from the API.
  DateTimeColumn get fetchedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {fromCurrency, toCurrency};
}
