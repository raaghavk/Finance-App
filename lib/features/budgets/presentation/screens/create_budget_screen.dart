import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/features/budgets/providers/budgets_provider.dart';

/// Indian number formatter for amount display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// Screen for creating a new budget with name, limit, period, date,
/// and category selection.
class CreateBudgetScreen extends ConsumerStatefulWidget {
  const CreateBudgetScreen({super.key});

  @override
  ConsumerState<CreateBudgetScreen> createState() => _CreateBudgetScreenState();
}

class _CreateBudgetScreenState extends ConsumerState<CreateBudgetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _amountController = TextEditingController();

  BudgetPeriod _period = BudgetPeriod.monthly;
  DateTime _startDate = DateTime.now();
  final Set<String> _selectedCategoryIds = {};
  bool _isSaving = false;

  @override
  void dispose() {
    _nameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _pickStartDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() => _startDate = picked);
    }
  }

  void _toggleCategory(String id) {
    setState(() {
      if (_selectedCategoryIds.contains(id)) {
        _selectedCategoryIds.remove(id);
      } else {
        _selectedCategoryIds.add(id);
      }
    });
  }

  void _toggleSelectAll() {
    setState(() {
      final allIds = CategoryConstants.defaultExpenseCategories
          .map((c) => c.id)
          .toSet();
      if (_selectedCategoryIds.length == allIds.length) {
        _selectedCategoryIds.clear();
      } else {
        _selectedCategoryIds
          ..clear()
          ..addAll(allIds);
      }
    });
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategoryIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one category')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final amount = double.tryParse(
          _amountController.text.replaceAll(',', ''),
        ) ??
        0;

    await ref.read(budgetsNotifierProvider.notifier).addBudget(
          name: _nameController.text.trim(),
          limitAmount: amount,
          period: _period,
          startDate: _startDate,
          categoryIds: _selectedCategoryIds.toList(),
        );

    if (mounted) {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final allExpenseCategories = CategoryConstants.defaultExpenseCategories;
    final allSelected =
        _selectedCategoryIds.length == allExpenseCategories.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Budget'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // ── Name ──────────────────────────────────────────────
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Budget Name',
                hintText: 'e.g. Monthly Groceries',
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.words,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Name is required';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // ── Amount ────────────────────────────────────────────
            TextFormField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Limit Amount',
                prefixText: '\u20B9 ',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
              ],
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Amount is required';
                }
                final parsed = double.tryParse(value.replaceAll(',', ''));
                if (parsed == null || parsed <= 0) {
                  return 'Enter an amount greater than 0';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // ── Period Selector ───────────────────────────────────
            Text(
              'Budget Period',
              style: theme.textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            SegmentedButton<BudgetPeriod>(
              segments: const [
                ButtonSegment(
                  value: BudgetPeriod.weekly,
                  label: Text('Weekly'),
                ),
                ButtonSegment(
                  value: BudgetPeriod.monthly,
                  label: Text('Monthly'),
                ),
                ButtonSegment(
                  value: BudgetPeriod.yearly,
                  label: Text('Yearly'),
                ),
                ButtonSegment(
                  value: BudgetPeriod.custom,
                  label: Text('Custom'),
                ),
              ],
              selected: {_period},
              onSelectionChanged: (selected) {
                setState(() => _period = selected.first);
              },
            ),
            const SizedBox(height: 16),

            // ── Start Date ────────────────────────────────────────
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Start Date'),
              subtitle: Text(
                DateFormat('dd MMM yyyy').format(_startDate),
              ),
              trailing: const Icon(Icons.calendar_today),
              onTap: _pickStartDate,
            ),
            const Divider(),
            const SizedBox(height: 8),

            // ── Category Selection ────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Categories',
                  style: theme.textTheme.titleSmall,
                ),
                TextButton(
                  onPressed: _toggleSelectAll,
                  child: Text(allSelected ? 'Deselect All' : 'Select All'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 2.4,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: allExpenseCategories.length,
              itemBuilder: (context, index) {
                final category = allExpenseCategories[index];
                final isSelected = _selectedCategoryIds.contains(category.id);
                return FilterChip(
                  selected: isSelected,
                  label: Text(
                    category.name,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.labelSmall,
                  ),
                  avatar: isSelected
                      ? const Icon(Icons.check, size: 16)
                      : null,
                  backgroundColor: Color(category.color).withOpacity(0.15),
                  selectedColor: Color(category.color).withOpacity(0.35),
                  onSelected: (_) => _toggleCategory(category.id),
                );
              },
            ),
            const SizedBox(height: 24),

            // ── Save Button ───────────────────────────────────────
            FilledButton(
              onPressed: _isSaving ? null : _save,
              child: _isSaving
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save Budget'),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
