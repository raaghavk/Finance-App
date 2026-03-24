import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// A date-picker widget that shows the selected date as relative text
/// ("Today", "Yesterday", "Mar 20") with quick-select chips and a
/// tap-to-open Material date picker.
class TransactionDatePicker extends StatelessWidget {
  const TransactionDatePicker({
    super.key,
    required this.selectedDate,
    required this.onDateSelected,
  });

  final DateTime selectedDate;
  final ValueChanged<DateTime> onDateSelected;

  // ── Helpers ──────────────────────────────────────────────────────────────

  String _relativeLabel(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final dateOnly = DateTime(date.year, date.month, date.day);

    if (dateOnly == today) return 'Today';
    if (dateOnly == yesterday) return 'Yesterday';
    if (date.year == now.year) return DateFormat('d MMM').format(date);
    return DateFormat('d MMM yyyy').format(date);
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  bool _isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year &&
        date.month == yesterday.month &&
        date.day == yesterday.day;
  }

  Future<void> _openMaterialPicker(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      // Preserve the time portion from the currently selected date or use now.
      final now = DateTime.now();
      onDateSelected(DateTime(
        picked.year,
        picked.month,
        picked.day,
        now.hour,
        now.minute,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Quick-select chips ─────────────────────────────────────────
        Row(
          children: [
            _QuickChip(
              label: 'Today',
              selected: _isToday(selectedDate),
              onTap: () {
                final now = DateTime.now();
                onDateSelected(DateTime(
                  now.year,
                  now.month,
                  now.day,
                  now.hour,
                  now.minute,
                ));
              },
            ),
            const SizedBox(width: 8),
            _QuickChip(
              label: 'Yesterday',
              selected: _isYesterday(selectedDate),
              onTap: () {
                final yesterday =
                    DateTime.now().subtract(const Duration(days: 1));
                final now = DateTime.now();
                onDateSelected(DateTime(
                  yesterday.year,
                  yesterday.month,
                  yesterday.day,
                  now.hour,
                  now.minute,
                ));
              },
            ),
            const SizedBox(width: 8),
            _QuickChip(
              label: 'Pick Date',
              selected: !_isToday(selectedDate) && !_isYesterday(selectedDate),
              onTap: () => _openMaterialPicker(context),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // ── Display row ───────────────────────────────────────────────
        InkWell(
          onTap: () => _openMaterialPicker(context),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: theme.colorScheme.outline.withOpacity(0.5),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 20,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Text(
                  _relativeLabel(selectedDate),
                  style: theme.textTheme.bodyLarge?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                Text(
                  DateFormat('EEEE').format(selectedDate),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  Icons.arrow_drop_down,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Quick select chip
// ---------------------------------------------------------------------------

class _QuickChip extends StatelessWidget {
  const _QuickChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      showCheckmark: false,
      selectedColor: theme.colorScheme.primaryContainer,
      labelStyle: TextStyle(
        color: selected
            ? theme.colorScheme.onPrimaryContainer
            : theme.colorScheme.onSurface,
        fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
      ),
    );
  }
}
