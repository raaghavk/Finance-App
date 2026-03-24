import 'package:drift/drift.dart';

/// Outbound sync queue – records pending upload to the cloud backend.
class SyncQueueTable extends Table {
  @override
  String get tableName => 'sync_queue';

  /// Auto-incrementing local id.
  IntColumn get id => integer().autoIncrement()();

  /// Name of the source table (e.g. "transactions", "accounts").
  TextColumn get tableName_ => text().named('table_name')();

  /// Primary-key value of the affected record.
  TextColumn get recordId => text()();

  /// CRUD operation: create, update, delete.
  TextColumn get operation => text()();

  /// JSON-encoded payload to send to the server.
  TextColumn get payload => text()();

  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  /// Whether this entry has been successfully synced.
  BoolColumn get isSynced =>
      boolean().withDefault(const Constant(false))();
}
