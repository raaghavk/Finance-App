import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/enums/recurrence.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';
import 'package:paisa_track/domain/models/reminder.dart';

/// Indian number formatter for currency display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// A list tile for displaying a single reminder with icon, title,
/// subtitle (amount + date), recurrence badge, and active toggle.
class ReminderTile extends StatelessWidget {
  const ReminderTile({
    required this.reminder,
    this.isOverdue = false,
    this.onToggle,
    this.onTap,
    super.key,
  });

  /// The reminder to display.
  final Reminder reminder;

  /// Whether this reminder is past due.
  final bool isOverdue;

  /// Called when the active switch is toggled.
  final ValueChanged<bool>? onToggle;

  /// Optional tap callback.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tileColor =
        isOverdue ? theme.colorScheme.errorContainer.withOpacity(0.3) : null;

    return ListTile(
      tileColor: tileColor,
      leading: _LeadingIcon(type: reminder.type, isOverdue: isOverdue),
      title: Text(
        reminder.title,
        style: theme.textTheme.bodyLarge?.copyWith(
          fontWeight: FontWeight.w500,
          color: isOverdue ? theme.colorScheme.error : null,
        ),
      ),
      subtitle: _Subtitle(reminder: reminder),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (reminder.recurrence != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: _RecurrenceBadge(recurrence: reminder.recurrence!),
            ),
          Switch.adaptive(
            value: reminder.isActive,
            onChanged: onToggle,
          ),
        ],
      ),
      onTap: onTap,
    );
  }
}

/// Leading icon based on reminder type, coloured red if overdue.
class _LeadingIcon extends StatelessWidget {
  const _LeadingIcon({
    required this.type,
    required this.isOverdue,
  });

  final ReminderType type;
  final bool isOverdue;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = isOverdue ? theme.colorScheme.error : theme.colorScheme.primary;

    final icon = switch (type) {
      ReminderType.billDue => Icons.receipt_long,
      ReminderType.overspendAlert => Icons.warning_amber_rounded,
      ReminderType.lowBalance => Icons.account_balance_wallet_outlined,
      ReminderType.custom => Icons.notifications_outlined,
    };

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, color: color, size: 22),
    );
  }
}

/// Subtitle showing amount and due date information.
class _Subtitle extends StatelessWidget {
  const _Subtitle({required this.reminder});

  final Reminder reminder;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final parts = <String>[];

    if (reminder.amount != null && reminder.amount! > 0) {
      parts.add(_currencyFormat.format(reminder.amount));
    }

    if (reminder.recurrence != null) {
      parts.add(_recurrenceDescription(reminder));
    } else {
      parts.add('due on ${DateFormat('MMM dd').format(reminder.dueDate)}');
    }

    return Text(
      parts.join(' '),
      style: theme.textTheme.bodySmall?.copyWith(
        color: theme.colorScheme.onSurfaceVariant,
      ),
    );
  }

  String _recurrenceDescription(Reminder reminder) {
    final day = reminder.dueDate.day;
    return switch (reminder.recurrence!) {
      Recurrence.daily => 'every day',
      Recurrence.weekly =>
        'every ${DateFormat('EEEE').format(reminder.dueDate)}',
      Recurrence.biweekly =>
        'every 2 weeks on ${DateFormat('EEEE').format(reminder.dueDate)}',
      Recurrence.monthly => 'every month on ${_ordinal(day)}',
      Recurrence.quarterly => 'every 3 months on ${_ordinal(day)}',
      Recurrence.yearly =>
        'every year on ${DateFormat('MMM dd').format(reminder.dueDate)}',
    };
  }

  String _ordinal(int day) {
    if (day >= 11 && day <= 13) return '${day}th';
    return switch (day % 10) {
      1 => '${day}st',
      2 => '${day}nd',
      3 => '${day}rd',
      _ => '${day}th',
    };
  }
}

/// Small badge showing the recurrence type.
class _RecurrenceBadge extends StatelessWidget {
  const _RecurrenceBadge({required this.recurrence});

  final Recurrence recurrence;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final label = switch (recurrence) {
      Recurrence.daily => 'Daily',
      Recurrence.weekly => 'Weekly',
      Recurrence.biweekly => 'Bi-weekly',
      Recurrence.monthly => 'Monthly',
      Recurrence.quarterly => 'Quarterly',
      Recurrence.yearly => 'Yearly',
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.onSecondaryContainer,
          fontSize: 10,
        ),
      ),
    );
  }
}
