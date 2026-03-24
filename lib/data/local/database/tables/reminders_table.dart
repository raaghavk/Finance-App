import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';

/// Scheduled reminders for bills, payments, goals, etc.
class RemindersTable extends Table {
  @override
  String get tableName => 'reminders';

  /// Unique identifier (UUID v4).
  TextColumn get id => text()();

  /// Short title shown in notifications.
  TextColumn get title => text()();

  /// Optional longer description.
  TextColumn get description => text().nullable()();

  /// Kind of reminder (bill due, payment, goal, custom).
  IntColumn get type => intEnum<ReminderType>()();

  /// Expected amount (if known).
  RealColumn get amount => real().nullable()();

  /// Optional category association.
  TextColumn get categoryId =>
      text().nullable().references(CategoriesTable, #id)();

  /// When the reminder is due.
  DateTimeColumn get dueDate => dateTime().nullable()();

  /// Recurrence rule (e.g. "monthly", "weekly", RRULE string).
  TextColumn get recurrence => text().nullable()();

  /// Whether the reminder is active.
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
