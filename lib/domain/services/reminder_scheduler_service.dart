import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:paisa_track/domain/models/reminder.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';

/// Schedules and manages local notifications for reminders.
class ReminderSchedulerService {
  final FlutterLocalNotificationsPlugin _notifications;

  static const _channelId = 'paisa_track_reminders';
  static const _channelName = 'Reminders';
  static const _channelDescription = 'Bill due dates and budget alerts';

  ReminderSchedulerService(this._notifications);

  /// Initialize notification channels and settings.
  Future<void> initialize() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }

  /// Schedule a notification for a reminder.
  Future<void> scheduleReminder(Reminder reminder) async {
    if (!reminder.isActive || reminder.dueDate == null) return;

    final notificationId = reminder.id.hashCode;

    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    final title = _getTitleForType(reminder.type);
    final body = _getBodyForReminder(reminder);

    final scheduledDate = tz.TZDateTime.from(
      reminder.dueDate!,
      tz.getLocation('Asia/Kolkata'),
    );

    // Don't schedule past notifications
    if (scheduledDate.isBefore(tz.TZDateTime.now(tz.local))) return;

    if (reminder.recurrence != null) {
      await _scheduleRecurring(
        notificationId,
        title,
        body,
        scheduledDate,
        reminder.recurrence!,
        details,
      );
    } else {
      await _notifications.zonedSchedule(
        notificationId,
        title,
        body,
        scheduledDate,
        details,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      );
    }
  }

  /// Cancel a scheduled notification.
  Future<void> cancelReminder(String reminderId) async {
    await _notifications.cancel(reminderId.hashCode);
  }

  /// Cancel all notifications.
  Future<void> cancelAll() async {
    await _notifications.cancelAll();
  }

  /// Reschedule all active reminders.
  Future<void> rescheduleAll(List<Reminder> reminders) async {
    await cancelAll();
    for (final reminder in reminders) {
      await scheduleReminder(reminder);
    }
  }

  /// Show an immediate notification (for overspend alerts, etc.)
  Future<void> showImmediateNotification({
    required String title,
    required String body,
    int id = 0,
  }) async {
    final androidDetails = AndroidNotificationDetails(
      _channelId,
      _channelName,
      channelDescription: _channelDescription,
      importance: Importance.high,
      priority: Priority.high,
    );

    final details = NotificationDetails(android: androidDetails);
    await _notifications.show(id, title, body, details);
  }

  Future<void> _scheduleRecurring(
    int id,
    String title,
    String body,
    tz.TZDateTime scheduledDate,
    String recurrence,
    NotificationDetails details,
  ) async {
    DateTimeComponents? matchComponents;

    switch (recurrence) {
      case 'daily':
        matchComponents = DateTimeComponents.time;
        break;
      case 'weekly':
        matchComponents = DateTimeComponents.dayOfWeekAndTime;
        break;
      case 'monthly':
        matchComponents = DateTimeComponents.dayOfMonthAndTime;
        break;
      case 'yearly':
        matchComponents = DateTimeComponents.dateAndTime;
        break;
      default:
        matchComponents = null;
    }

    if (matchComponents != null) {
      await _notifications.zonedSchedule(
        id,
        title,
        body,
        scheduledDate,
        details,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: matchComponents,
      );
    }
  }

  String _getTitleForType(ReminderType type) {
    switch (type) {
      case ReminderType.billDue:
        return '💰 Bill Due';
      case ReminderType.overspendAlert:
        return '⚠️ Overspend Alert';
      case ReminderType.lowBalance:
        return '📉 Low Balance';
      case ReminderType.custom:
        return '🔔 Reminder';
    }
  }

  String _getBodyForReminder(Reminder reminder) {
    final amountStr =
        reminder.amount != null ? ' - ₹${reminder.amount!.toStringAsFixed(0)}' : '';
    return '${reminder.title}$amountStr';
  }

  void _onNotificationTapped(NotificationResponse response) {
    // Navigation will be handled by the app's notification listener
  }
}
