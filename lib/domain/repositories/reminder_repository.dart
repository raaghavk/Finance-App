import 'package:paisa_track/domain/models/reminder.dart';

/// Contract for reminder data access.
abstract class ReminderRepository {
  /// Stream of all active, non-deleted reminders.
  Stream<List<Reminder>> watchActive();

  /// Get reminders due within the next [days] days.
  Future<List<Reminder>> getUpcoming(int days);

  /// Insert a new reminder.
  Future<void> add(Reminder reminder);

  /// Update an existing reminder.
  Future<void> update(Reminder reminder);

  /// Soft-delete a reminder by [id].
  Future<void> delete(String id);
}
