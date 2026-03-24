import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/reminders_table.dart';

part 'reminder_dao.g.dart';

@DriftAccessor(tables: [RemindersTable])
class ReminderDao extends DatabaseAccessor<AppDatabase>
    with _$ReminderDaoMixin {
  ReminderDao(super.db);

  // ── Streams ───────────────────────────────────────────────────────────

  /// Watch all active, non-deleted reminders ordered by due date.
  Stream<List<RemindersTableData>> watchActiveReminders() {
    return (select(remindersTable)
          ..where((r) =>
              r.isActive.equals(true) & r.isDeleted.equals(false))
          ..orderBy([(r) => OrderingTerm.asc(r.dueDate)]))
        .watch();
  }

  // ── Reads ─────────────────────────────────────────────────────────────

  /// Fetch a single reminder by [id].
  Future<RemindersTableData?> getReminderById(String id) {
    return (select(remindersTable)..where((r) => r.id.equals(id)))
        .getSingleOrNull();
  }

  /// Return active reminders whose due date is within the next [days] days.
  Future<List<RemindersTableData>> getUpcomingReminders(int days) {
    final now = DateTime.now();
    final cutoff = now.add(Duration(days: days));

    return (select(remindersTable)
          ..where((r) =>
              r.isActive.equals(true) &
              r.isDeleted.equals(false) &
              r.dueDate.isBiggerOrEqualValue(now) &
              r.dueDate.isSmallerOrEqualValue(cutoff))
          ..orderBy([(r) => OrderingTerm.asc(r.dueDate)]))
        .get();
  }

  // ── Mutations ─────────────────────────────────────────────────────────

  /// Insert a new reminder.
  Future<void> insertReminder(RemindersTableCompanion entry) {
    return into(remindersTable).insert(entry);
  }

  /// Update an existing reminder.
  Future<void> updateReminder(RemindersTableCompanion entry) {
    return (update(remindersTable)
          ..where((r) => r.id.equals(entry.id.value)))
        .write(entry);
  }

  /// Soft-delete a reminder and flag for sync.
  Future<void> softDeleteReminder(String id) {
    return (update(remindersTable)..where((r) => r.id.equals(id))).write(
      RemindersTableCompanion(
        isDeleted: const Value(true),
        syncStatus: Value(SyncStatus.pending.index),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }
}
