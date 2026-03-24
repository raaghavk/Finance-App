import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/features/transactions/providers/transactions_provider.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/transaction_tile.dart';

/// Bottom sheet for advanced transaction filtering.
///
/// Provides:
/// - Date range presets (This week, This month, Last month, Custom range)
/// - Category multi-select
/// - Amount range (min / max)
/// - Transaction type checkboxes
/// - Apply / Reset buttons
class FilterSheet extends ConsumerStatefulWidget {
  const FilterSheet({super.key});

  @override
  ConsumerState<FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends ConsumerState<FilterSheet> {
  // Local mutable copies so the user can adjust before applying.
  late TransactionType? _selectedType;
  late DateTime? _startDate;
  late DateTime? _endDate;
  late double? _minAmount;
  late double? _maxAmount;
  late Set<String> _selectedCategoryIds;

  final _minAmountController = TextEditingController();
  final _maxAmountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final current = ref.read(transactionFilterNotifierProvider);
    _selectedType = current.type;
    _startDate = current.startDate;
    _endDate = current.endDate;
    _minAmount = current.minAmount;
    _maxAmount = current.maxAmount;
    _selectedCategoryIds = Set.from(current.categoryIds);

    if (_minAmount != null) {
      _minAmountController.text = _minAmount!.toStringAsFixed(0);
    }
    if (_maxAmount != null) {
      _maxAmountController.text = _maxAmount!.toStringAsFixed(0);
    }
  }

  @override
  void dispose() {
    _minAmountController.dispose();
    _maxAmountController.dispose();
    super.dispose();
  }

  // ── Date range presets ──────────────────────────────────────────────────

  void _setThisWeek() {
    final now = DateTime.now();
    final weekday = now.weekday; // Monday = 1
    setState(() {
      _startDate = DateTime(now.year, now.month, now.day - weekday + 1);
      _endDate = DateTime(now.year, now.month, now.day, 23, 59, 59);
    });
  }

  void _setThisMonth() {
    final now = DateTime.now();
    setState(() {
      _startDate = DateTime(now.year, now.month);
      _endDate = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
    });
  }

  void _setLastMonth() {
    final now = DateTime.now();
    setState(() {
      _startDate = DateTime(now.year, now.month - 1);
      _endDate = DateTime(now.year, now.month, 0, 23, 59, 59);
    });
  }

  Future<void> _pickCustomRange() async {
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 730)),
      lastDate: DateTime.now(),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
    );
    if (range != null) {
      setState(() {
        _startDate = range.start;
        _endDate = range.end;
      });
    }
  }

  String _dateRangeLabel() {
    if (_startDate == null || _endDate == null) return 'Not set';
    final fmt = DateFormat('d MMM');
    return '${fmt.format(_startDate!)} - ${fmt.format(_endDate!)}';
  }

  // ── Apply / Reset ──────────────────────────────────────────────────────

  void _apply() {
    final notifier = ref.read(transactionFilterNotifierProvider.notifier);
    notifier.setType(_selectedType);
    notifier.setDateRange(_startDate, _endDate);
    notifier.setCategoryIds(_selectedCategoryIds);
    notifier.setAmountRange(
      double.tryParse(_minAmountController.text),
      double.tryParse(_maxAmountController.text),
    );
    Navigator.of(context).pop();
  }

  void _reset() {
    ref.read(transactionFilterNotifierProvider.notifier).reset();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.92,
      expand: false,
      builder: (context, scrollController) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: ListView(
            controller: scrollController,
            children: [
              // ── Handle ───────────────────────────────────────────
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurfaceVariant.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Text(
                'Filter Transactions',
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),

              // ── Date Range ───────────────────────────────────────
              Text(
                'Date Range',
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    label: const Text('This Week'),
                    onPressed: _setThisWeek,
                  ),
                  ActionChip(
                    label: const Text('This Month'),
                    onPressed: _setThisMonth,
                  ),
                  ActionChip(
                    label: const Text('Last Month'),
                    onPressed: _setLastMonth,
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.calendar_today, size: 16),
                    label: const Text('Custom Range'),
                    onPressed: _pickCustomRange,
                  ),
                ],
              ),
              if (_startDate != null) ...[
                const SizedBox(height: 8),
                Text(
                  _dateRangeLabel(),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
              const SizedBox(height: 20),

              // ── Transaction Type ──────────────────────────────────
              Text(
                'Transaction Type',
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  for (final type in TransactionType.values)
                    FilterChip(
                      label: Text(type.label),
                      selected: _selectedType == type,
                      showCheckmark: true,
                      onSelected: (selected) {
                        setState(() {
                          _selectedType = selected ? type : null;
                        });
                      },
                    ),
                ],
              ),
              const SizedBox(height: 20),

              // ── Category Multi-select ─────────────────────────────
              Text(
                'Categories',
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              _CategoryMultiSelect(
                selectedIds: _selectedCategoryIds,
                onChanged: (ids) => setState(() => _selectedCategoryIds = ids),
              ),
              const SizedBox(height: 20),

              // ── Amount Range ──────────────────────────────────────
              Text(
                'Amount Range',
                style: theme.textTheme.titleSmall
                    ?.copyWith(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _minAmountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Min (\u20B9)',
                        prefixText: '\u20B9 ',
                        isDense: true,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      controller: _maxAmountController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Max (\u20B9)',
                        prefixText: '\u20B9 ',
                        isDense: true,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // ── Action buttons ────────────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _reset,
                      child: const Text('Reset'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: FilledButton(
                      onPressed: _apply,
                      child: const Text('Apply'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Category multi-select sub-widget
// ---------------------------------------------------------------------------

class _CategoryMultiSelect extends StatelessWidget {
  const _CategoryMultiSelect({
    required this.selectedIds,
    required this.onChanged,
  });

  final Set<String> selectedIds;
  final ValueChanged<Set<String>> onChanged;

  @override
  Widget build(BuildContext context) {
    final allCategories = CategoryConstants.allDefaultCategories;

    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: allCategories.map((cat) {
        final isSelected = selectedIds.contains(cat.id);
        final color = Color(cat.color);
        final icon = TransactionTile.categoryIconFromName(cat.iconName);

        return FilterChip(
          avatar: Icon(icon, size: 16, color: isSelected ? color : null),
          label: Text(cat.name),
          selected: isSelected,
          showCheckmark: false,
          selectedColor: color.withOpacity(0.15),
          side: isSelected
              ? BorderSide(color: color, width: 1.5)
              : null,
          onSelected: (selected) {
            final updated = Set<String>.from(selectedIds);
            if (selected) {
              updated.add(cat.id);
            } else {
              updated.remove(cat.id);
            }
            onChanged(updated);
          },
        );
      }).toList(),
    );
  }
}
