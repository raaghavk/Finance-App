import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/recurrence.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/data/local/daos/reminder_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/reminders_table.dart';
import 'package:paisa_track/domain/models/reminder.dart' as domain;
import 'package:paisa_track/domain/repositories/reminder_repository.dart';

/// Drift-backed implementation of [ReminderRepository].
class ReminderRepositoryImpl implements ReminderRepository {
  ReminderRepositoryImpl(this._dao);

  final ReminderDao _dao;

  // ── Mapping helpers ──────────────────────────────────────────────────

  domain.Reminder _toDomain(RemindersTableData row) {
    return domain.Reminder(
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      type: ReminderType.values[row.type],
      amount: row.amount,
      categoryId: row.categoryId,
      dueDate: row.dueDate ?? DateTime.now(),
      recurrence: row.recurrence != null
          ? Recurrence.values.firstWhere(
              (e) => e.name == row.recurrence,
              orElse: () => Recurrence.monthly,
            )
          : null,
      isActive: row.isActive,
      syncStatus: SyncStatus.values[row.syncStatus],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isDeleted: row.isDeleted,
    );
  }

  RemindersTableCompanion _toCompanion(domain.Reminder r) {
    return RemindersTableCompanion(
      id: Value(r.id),
      title: Value(r.title),
      description: Value(r.description.isEmpty ? null : r.description),
      type: Value(r.type.index),
      amount: Value(r.amount),
      categoryId: Value(r.categoryId),
      dueDate: Value(r.dueDate),
      recurrence: Value(r.recurrence?.name),
      isActive: Value(r.isActive),
      syncStatus: Value(r.syncStatus.index),
      createdAt: Value(r.createdAt),
      updatedAt: Value(r.updatedAt),
      isDeleted: Value(r.isDeleted),
    );
  }

  // ── Streams ──────────────────────────────────────────────────────────

  @override
  Stream<List<domain.Reminder>> watchActive() {
    return _dao
        .watchActiveReminders()
        .map((rows) => rows.map(_toDomain).toList());
  }

  // ── Reads ────────────────────────────────────────────────────────────

  @override
  Future<List<domain.Reminder>> getUpcoming(int days) async {
    final rows = await _dao.getUpcomingReminders(days);
    return rows.map(_toDomain).toList();
  }

  // ── Mutations ────────────────────────────────────────────────────────

  @override
  Future<void> add(domain.Reminder reminder) {
    return _dao.insertReminder(_toCompanion(reminder));
  }

  @override
  Future<void> update(domain.Reminder reminder) {
    return _dao.updateReminder(_toCompanion(reminder));
  }

  @override
  Future<void> delete(String id) {
    return _dao.softDeleteReminder(id);
  }
}
