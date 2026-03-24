import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/domain/models/parsed_expense.dart';

/// Displays the fields extracted from a voice/chat/OCR input in a visually
/// rich card. Each field is tappable for inline editing. Includes confidence
/// indicator and action buttons.
class ParsedExpenseCard extends StatelessWidget {
  const ParsedExpenseCard({
    required this.expense,
    this.onSave,
    this.onEdit,
    this.onAmountTap,
    this.onCategoryTap,
    this.onDateTap,
    this.onAccountTap,
    this.onNoteTap,
    super.key,
  });

  /// The parsed expense to display.
  final ParsedExpense expense;

  /// Called when the user taps "Looks good!".
  final VoidCallback? onSave;

  /// Called when the user taps "Edit Details".
  final VoidCallback? onEdit;

  /// Inline-edit callbacks for individual fields.
  final VoidCallback? onAmountTap;
  final VoidCallback? onCategoryTap;
  final VoidCallback? onDateTap;
  final VoidCallback? onAccountTap;
  final VoidCallback? onNoteTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Amount ────────────────────────────────────────────────
            GestureDetector(
              onTap: onAmountTap,
              child: Center(
                child: Text(
                  _formatAmount(expense.amount),
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colorScheme.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Chips row ─────────────────────────────────────────────
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                // Category chip
                if (expense.categoryName != null &&
                    expense.categoryName!.isNotEmpty)
                  _TappableChip(
                    icon: Icons.category_outlined,
                    label: expense.categoryName!,
                    onTap: onCategoryTap,
                  ),

                // Date chip
                _TappableChip(
                  icon: Icons.calendar_today_outlined,
                  label: _formatDate(expense.date),
                  onTap: onDateTap,
                ),

                // Account chip
                _TappableChip(
                  icon: Icons.account_balance_wallet_outlined,
                  label: expense.accountId ?? 'Default',
                  onTap: onAccountTap,
                ),
              ],
            ),
            const SizedBox(height: 12),

            // ── Note ──────────────────────────────────────────────────
            if (expense.note != null && expense.note!.isNotEmpty)
              GestureDetector(
                onTap: onNoteTap,
                child: Row(
                  children: [
                    Icon(
                      Icons.notes_outlined,
                      size: 16,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        expense.note!,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Icon(
                      Icons.edit_outlined,
                      size: 14,
                      color: colorScheme.onSurfaceVariant.withOpacity(0.5),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 12),

            // ── Confidence indicator ──────────────────────────────────
            _ConfidenceIndicator(confidence: expense.confidence),
            const SizedBox(height: 16),

            // ── Action buttons ────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    onPressed: onSave,
                    child: const Text('Looks good!'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onEdit,
                    child: const Text('Edit Details'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatAmount(double? amount) {
    if (amount == null) return '\u20B9 --';
    final formatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '\u20B9',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'Today';
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(date.year, date.month, date.day);

    if (target == today) return 'Today';
    if (target == today.subtract(const Duration(days: 1))) return 'Yesterday';
    return DateFormat('dd MMM yyyy').format(date);
  }
}

// ---------------------------------------------------------------------------
// Private helper widgets
// ---------------------------------------------------------------------------

class _TappableChip extends StatelessWidget {
  const _TappableChip({
    required this.icon,
    required this.label,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Chip(
        avatar: Icon(icon, size: 16),
        label: Text(label),
        side: BorderSide(color: colorScheme.outlineVariant),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}

class _ConfidenceIndicator extends StatelessWidget {
  const _ConfidenceIndicator({required this.confidence});

  final double confidence;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (label, color) = switch (confidence) {
      >= 0.75 => ('High confidence', Colors.green),
      >= 0.45 => ('Medium confidence', Colors.orange),
      _ => ('Low confidence', Colors.red),
    };

    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: theme.textTheme.labelSmall?.copyWith(color: color),
        ),
        const Spacer(),
        Text(
          '${(confidence * 100).round()}%',
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
