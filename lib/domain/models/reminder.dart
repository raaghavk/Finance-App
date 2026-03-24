import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/recurrence.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';
import 'package:paisa_track/core/enums/sync_status.dart';

part 'reminder.freezed.dart';
part 'reminder.g.dart';

/// A scheduled reminder for bills, payments, or goals.
@freezed
class Reminder with _$Reminder {
  const factory Reminder({
    /// Unique identifier (UUID v4).
    required String id,

    /// Short title shown in the notification.
    required String title,

    /// Optional longer description.
    @Default('') String description,

    /// The kind of reminder (bill, payment, goal, custom).
    required ReminderType type,

    /// Expected amount for the reminder.
    double? amount,

    /// Optional category association.
    String? categoryId,

    /// When the reminder is due.
    required DateTime dueDate,

    /// How often the reminder repeats. Null for one-off reminders.
    Recurrence? recurrence,

    /// Whether the reminder is currently active.
    @Default(true) bool isActive,

    /// Cloud sync status.
    @Default(SyncStatus.pending) SyncStatus syncStatus,

    /// When the record was created locally.
    required DateTime createdAt,

    /// When the record was last updated.
    required DateTime updatedAt,

    /// Soft-delete flag.
    @Default(false) bool isDeleted,
  }) = _Reminder;

  factory Reminder.fromJson(Map<String, dynamic> json) =>
      _$ReminderFromJson(json);
}
