import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';

/// User-defined spending budgets.
class BudgetsTable extends Table {
  @override
  String get tableName => 'budgets';

  /// Unique identifier (UUID v4).
  TextColumn get id => text()();

  /// Human-readable budget name.
  TextColumn get name => text()();

  /// Maximum spending allowed within the period.
  RealColumn get limitAmount => real()();

  /// Budget cadence: monthly, weekly, yearly, custom.
  TextColumn get period => text()();

  /// When the budget period begins.
  DateTimeColumn get startDate => dateTime()();

  /// Optional end date for custom-period budgets.
  DateTimeColumn get endDate => dateTime().nullable()();

  /// Budget tracking mode: manual or ai_assisted.
  TextColumn get mode => text()();

  /// Whether the budget is currently tracked.
  BoolColumn get isActive =>
      boolean().withDefault(const Constant(true))();

  /// Cloud sync status.
  IntColumn get syncStatus =>
      intEnum<SyncStatus>().withDefault(const Constant(0))();

  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  DateTimeColumn get updatedAt =>
      dateTime().withDefault(currentDateAndTime)();

  /// Soft-delete flag.
  BoolColumn get isDeleted =>
      boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
