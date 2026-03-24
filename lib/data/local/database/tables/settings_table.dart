import 'package:drift/drift.dart';

/// Key-value store for user preferences and app configuration.
class SettingsTable extends Table {
  @override
  String get tableName => 'settings';

  /// Setting identifier (e.g. "theme", "locale", "default_currency").
  TextColumn get key => text()();

  /// Serialised setting value.
  TextColumn get value => text()();

  @override
  Set<Column> get primaryKey => {key};
}
