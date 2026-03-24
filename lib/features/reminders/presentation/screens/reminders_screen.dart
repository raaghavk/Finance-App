import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/enums/recurrence.dart';
import 'package:paisa_track/core/enums/reminder_type.dart';
import 'package:paisa_track/domain/models/reminder.dart';
import 'package:paisa_track/features/reminders/providers/reminders_provider.dart';
import 'package:paisa_track/features/reminders/presentation/widgets/reminder_tile.dart';
import 'package:paisa_track/shared/widgets/empty_state.dart';
import 'package:paisa_track/shared/widgets/loading_indicator.dart';

/// Indian number formatter for currency display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// Main screen listing reminders grouped by overdue, upcoming, and all.
class RemindersScreen extends ConsumerWidget {
  const RemindersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final remindersAsync = ref.watch(remindersNotifierProvider);
    final overdue = ref.watch(overdueRemindersProvider);
    final upcoming = ref.watch(upcomingRemindersProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reminders'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddReminderSheet(context, ref),
        tooltip: 'Add Reminder',
        child: const Icon(Icons.add),
      ),
      body: remindersAsync.when(
        loading: () => const LoadingIndicator(),
        error: (error, _) => Center(
          child: Text('Failed to load reminders: $error'),
        ),
        data: (allReminders) {
          if (allReminders.isEmpty) {
            return const EmptyState(
              title: 'No reminders yet',
              subtitle:
                  'Set up reminders for bills, payments, and other important dates.',
            );
          }

          return ListView(
            padding: const EdgeInsets.only(bottom: 80),
            children: [
              // ── Overdue Section ─────────────────────────────────
              if (overdue.isNotEmpty) ...[
                _SectionHeader(
                  title: 'Overdue',
                  color: theme.colorScheme.error,
                  count: overdue.length,
                ),
                ...overdue.map(
                  (reminder) => _DismissibleReminderTile(
                    reminder: reminder,
                    isOverdue: true,
                    ref: ref,
                  ),
                ),
                const SizedBox(height: 8),
              ],

              // ── Upcoming Section ────────────────────────────────
              if (upcoming.isNotEmpty) ...[
                _SectionHeader(
                  title: 'Upcoming (7 days)',
                  color: theme.colorScheme.primary,
                  count: upcoming.length,
                ),
                ...upcoming.map(
                  (reminder) => _DismissibleReminderTile(
                    reminder: reminder,
                    isOverdue: false,
                    ref: ref,
                  ),
                ),
                const SizedBox(height: 8),
              ],

              // ── All Reminders Section ───────────────────────────
              _SectionHeader(
                title: 'All Reminders',
                color: theme.colorScheme.onSurfaceVariant,
                count: allReminders.length,
              ),
              ...allReminders.map(
                (reminder) => _DismissibleReminderTile(
                  reminder: reminder,
                  isOverdue: reminder.dueDate.isBefore(DateTime.now()),
                  ref: ref,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  /// Shows the bottom sheet for adding a new reminder.
  void _showAddReminderSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _AddReminderSheet(ref: ref),
    );
  }
}

/// Section header with a coloured title and count badge.
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.color,
    required this.count,
  });

  final String title;
  final Color color;
  final int count;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Row(
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$count',
              style: theme.textTheme.labelSmall?.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Wraps a [ReminderTile] with swipe-to-delete behaviour.
class _DismissibleReminderTile extends StatelessWidget {
  const _DismissibleReminderTile({
    required this.reminder,
    required this.isOverdue,
    required this.ref,
  });

  final Reminder reminder;
  final bool isOverdue;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dismissible(
      key: ValueKey(reminder.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: theme.colorScheme.error,
        child: Icon(
          Icons.delete_outline,
          color: theme.colorScheme.onError,
        ),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Delete Reminder'),
            content: Text('Delete "${reminder.title}"?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancel'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Delete'),
              ),
            ],
          ),
        );
      },
      onDismissed: (_) {
        ref.read(remindersNotifierProvider.notifier).deleteReminder(
              reminder.id,
            );
      },
      child: ReminderTile(
        reminder: reminder,
        isOverdue: isOverdue,
        onToggle: (active) {
          ref
              .read(remindersNotifierProvider.notifier)
              .toggleActive(reminder.id);
        },
      ),
    );
  }
}

/// Bottom sheet form for adding a new reminder.
class _AddReminderSheet extends StatefulWidget {
  const _AddReminderSheet({required this.ref});

  final WidgetRef ref;

  @override
  State<_AddReminderSheet> createState() => _AddReminderSheetState();
}

class _AddReminderSheetState extends State<_AddReminderSheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _amountController = TextEditingController();

  ReminderType _type = ReminderType.billDue;
  DateTime _dueDate = DateTime.now().add(const Duration(days: 1));
  Recurrence? _recurrence;
  bool _isSaving = false;

  @override
  void dispose() {
    _titleController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _pickDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate,
      firstDate: DateTime.now(),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() => _dueDate = picked);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    final amount = _amountController.text.isNotEmpty
        ? double.tryParse(_amountController.text.replaceAll(',', ''))
        : null;

    await widget.ref.read(remindersNotifierProvider.notifier).addReminder(
          title: _titleController.text.trim(),
          type: _type,
          amount: amount,
          dueDate: _dueDate,
          recurrence: _recurrence,
        );

    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Add Reminder',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),

              // ── Title ───────────────────────────────────────────
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  hintText: 'e.g. Electricity Bill',
                  border: OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.sentences,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Title is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),

              // ── Type Selector ───────────────────────────────────
              DropdownButtonFormField<ReminderType>(
                value: _type,
                decoration: const InputDecoration(
                  labelText: 'Type',
                  border: OutlineInputBorder(),
                ),
                items: ReminderType.values
                    .map(
                      (t) => DropdownMenuItem(
                        value: t,
                        child: Text(t.label),
                      ),
                    )
                    .toList(),
                onChanged: (value) {
                  if (value != null) setState(() => _type = value);
                },
              ),
              const SizedBox(height: 12),

              // ── Amount (optional) ───────────────────────────────
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(
                  labelText: 'Amount (optional)',
                  prefixText: '\u20B9 ',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 12),

              // ── Due Date ────────────────────────────────────────
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Due Date'),
                subtitle: Text(
                  DateFormat('dd MMM yyyy').format(_dueDate),
                ),
                trailing: const Icon(Icons.calendar_today),
                onTap: _pickDueDate,
              ),
              const Divider(),

              // ── Recurrence ──────────────────────────────────────
              DropdownButtonFormField<Recurrence?>(
                value: _recurrence,
                decoration: const InputDecoration(
                  labelText: 'Recurrence',
                  border: OutlineInputBorder(),
                ),
                items: [
                  const DropdownMenuItem(
                    value: null,
                    child: Text('None'),
                  ),
                  ...Recurrence.values.map(
                    (r) => DropdownMenuItem(
                      value: r,
                      child: Text(_recurrenceLabel(r)),
                    ),
                  ),
                ],
                onChanged: (value) {
                  setState(() => _recurrence = value);
                },
              ),
              const SizedBox(height: 20),

              // ── Save Button ─────────────────────────────────────
              FilledButton(
                onPressed: _isSaving ? null : _save,
                child: _isSaving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Add Reminder'),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  String _recurrenceLabel(Recurrence r) {
    return switch (r) {
      Recurrence.daily => 'Daily',
      Recurrence.weekly => 'Weekly',
      Recurrence.biweekly => 'Bi-weekly',
      Recurrence.monthly => 'Monthly',
      Recurrence.quarterly => 'Quarterly',
      Recurrence.yearly => 'Yearly',
    };
  }
}
