import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/domain/models/parsed_expense.dart';

/// Displays the fields extracted from an OCR scan in an editable list format.
///
/// Each row shows a label, the extracted value, and an edit icon. A confidence
/// colour (green / yellow) is displayed beside each value to indicate how
/// reliable the extraction is.
class ExtractedFields extends StatelessWidget {
  const ExtractedFields({
    required this.expense,
    this.onAmountTap,
    this.onMerchantTap,
    this.onCategoryTap,
    this.onDateTap,
    this.onAccountTap,
    super.key,
  });

  /// The parsed expense containing the extracted values.
  final ParsedExpense expense;

  /// Inline-edit callbacks for individual fields.
  final VoidCallback? onAmountTap;
  final VoidCallback? onMerchantTap;
  final VoidCallback? onCategoryTap;
  final VoidCallback? onDateTap;
  final VoidCallback? onAccountTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Extracted Details',
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        _FieldRow(
          label: 'Amount',
          value: expense.amount != null
              ? '\u20B9${NumberFormat('#,##,##0.00', 'en_IN').format(expense.amount)}'
              : 'Not detected',
          confidence: expense.amount != null
              ? _Confidence.high
              : _Confidence.low,
          onTap: onAmountTap,
        ),
        const Divider(height: 1),
        _FieldRow(
          label: 'Merchant / Note',
          value: expense.note?.isNotEmpty == true
              ? expense.note!
              : 'Not detected',
          confidence: expense.note?.isNotEmpty == true
              ? _Confidence.medium
              : _Confidence.low,
          onTap: onMerchantTap,
        ),
        const Divider(height: 1),
        _FieldRow(
          label: 'Category',
          value: expense.categoryName?.isNotEmpty == true
              ? expense.categoryName!
              : 'Uncategorised',
          confidence: expense.categoryName != null
              ? _Confidence.medium
              : _Confidence.low,
          onTap: onCategoryTap,
        ),
        const Divider(height: 1),
        _FieldRow(
          label: 'Date',
          value: expense.date != null
              ? DateFormat('dd MMM yyyy').format(expense.date!)
              : 'Today',
          confidence:
              expense.date != null ? _Confidence.high : _Confidence.medium,
          onTap: onDateTap,
        ),
        const Divider(height: 1),
        _FieldRow(
          label: 'Account',
          value: expense.accountId ?? 'Default',
          confidence: _Confidence.medium,
          onTap: onAccountTap,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

enum _Confidence { high, medium, low }

class _FieldRow extends StatelessWidget {
  const _FieldRow({
    required this.label,
    required this.value,
    required this.confidence,
    this.onTap,
  });

  final String label;
  final String value;
  final _Confidence confidence;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final confidenceColor = switch (confidence) {
      _Confidence.high => Colors.green,
      _Confidence.medium => Colors.orange,
      _Confidence.low => Colors.red.shade300,
    };

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            // Confidence dot
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: confidenceColor,
                shape: BoxShape.circle,
              ),
            ),
            // Label & value
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            // Edit icon
            Icon(
              Icons.edit_outlined,
              size: 16,
              color: colorScheme.onSurfaceVariant.withOpacity(0.6),
            ),
          ],
        ),
      ),
    );
  }
}
