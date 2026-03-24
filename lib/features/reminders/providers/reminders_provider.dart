import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';

import 'package:paisa_track/core/enums/recurrence.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/domain/models/reminder.dart';

part 'reminders_provider.g.dart';

const _uuid = Uuid();

/// Manages the list of user reminders with CRUD operations.
@riverpod
class RemindersNotifier extends _$RemindersNotifier {
  @override
  AsyncValue<List<Reminder>> build() {
    loadReminders();
    return const AsyncValue.loading();
  }

  /// Fetches all active (non-deleted) reminders from local storage.
  Future<void> loadReminders() async {
    state = const AsyncValue.loading();
    try {
      // TODO: Replace with actual DAO / repository call.
      await Future<void>.delayed(const Duration(milliseconds: 300));
      state = const AsyncValue.data([]);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Creates a new reminder.
  Future<void> addReminder({
    required String title,
    required ReminderType type,
    double? amount,
    required DateTime dueDate,
    Recurrence? recurrence,
    String? description,
  }) async {
    final now = DateTime.now();
    final reminder = Reminder(
      id: _uuid.v4(),
      title: title,
      description: description ?? '',
      type: type,
      amount: amount,
      dueDate: dueDate,
      recurrence: recurrence,
      syncStatus: SyncStatus.pending,
      createdAt: now,
      updatedAt: now,
    );

    final current = state.valueOrNull ?? [];
    state = AsyncValue.data([...current, reminder]);

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Reminder added: ${reminder.id}');
    } catch (error, stackTrace) {
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Updates an existing reminder.
  Future<void> updateReminder(Reminder updated) async {
    final current = state.valueOrNull ?? [];
    final index = current.indexWhere((r) => r.id == updated.id);
    if (index == -1) return;

    final patched = updated.copyWith(
      updatedAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );
    final next = [...current];
    next[index] = patched;
    state = AsyncValue.data(next);

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Reminder updated: ${patched.id}');
    } catch (error, stackTrace) {
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Toggles the active state of a reminder.
  Future<void> toggleActive(String id) async {
    final current = state.valueOrNull ?? [];
    final index = current.indexWhere((r) => r.id == id);
    if (index == -1) return;

    final toggled = current[index].copyWith(
      isActive: !current[index].isActive,
      updatedAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );
    final next = [...current];
    next[index] = toggled;
    state = AsyncValue.data(next);

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Reminder toggled: $id -> ${toggled.isActive}');
    } catch (error, stackTrace) {
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Soft-deletes a reminder by [id].
  Future<void> deleteReminder(String id) async {
    final current = state.valueOrNull ?? [];
    final index = current.indexWhere((r) => r.id == id);
    if (index == -1) return;

    final next = [...current];
    next[index] = next[index].copyWith(
      isDeleted: true,
      updatedAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );
    state = AsyncValue.data(next.where((r) => !r.isDeleted).toList());

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Reminder deleted: $id');
    } catch (error, stackTrace) {
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

/// Provides reminders due within the next 7 days.
@riverpod
List<Reminder> upcomingReminders(UpcomingRemindersRef ref) {
  final remindersAsync = ref.watch(remindersNotifierProvider);
  final reminders = remindersAsync.valueOrNull ?? [];
  final now = DateTime.now();
  final weekFromNow = now.add(const Duration(days: 7));

  return reminders
      .where((r) =>
          r.isActive &&
          !r.isDeleted &&
          !r.dueDate.isBefore(now) &&
          r.dueDate.isBefore(weekFromNow))
      .toList()
    ..sort((a, b) => a.dueDate.compareTo(b.dueDate));
}

/// Provides reminders that are past due.
@riverpod
List<Reminder> overdueReminders(OverdueRemindersRef ref) {
  final remindersAsync = ref.watch(remindersNotifierProvider);
  final reminders = remindersAsync.valueOrNull ?? [];
  final now = DateTime.now();

  return reminders
      .where((r) =>
          r.isActive && !r.isDeleted && r.dueDate.isBefore(now))
      .toList()
    ..sort((a, b) => a.dueDate.compareTo(b.dueDate));
}
