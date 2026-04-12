import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';
import 'package:paisa_track/domain/models/category.dart';
import 'package:paisa_track/domain/models/transaction.dart';

class AddTransactionScreen extends ConsumerStatefulWidget {
  const AddTransactionScreen({super.key, this.initialType});
  final String? initialType;

  @override
  ConsumerState<AddTransactionScreen> createState() =>
      _AddTransactionScreenState();
}

class _AddTransactionScreenState extends ConsumerState<AddTransactionScreen> {
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  late TransactionType _type;
  String? _selectedCategoryId;
  String? _selectedAccountId;
  DateTime _date = DateTime.now();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _type = widget.initialType == 'income'
        ? TransactionType.income
        : TransactionType.expense;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Color get _typeColor =>
      _type == TransactionType.expense ? AppColors.expense : AppColors.income;

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _save() async {
    if (_amountController.text.isEmpty) {
      _showError('Please enter an amount');
      return;
    }
    final amount = double.tryParse(
        _amountController.text.replaceAll(',', ''));
    if (amount == null || amount <= 0) {
      _showError('Please enter a valid amount');
      return;
    }
    if (_selectedCategoryId == null) {
      _showError('Please select a category');
      return;
    }

    // Use default account if none selected
    final accounts = ref.read(accountsProvider).valueOrNull ?? [];
    final accountId = _selectedAccountId ??
        (accounts.isNotEmpty ? accounts.first.id : 'default-cash-account');

    setState(() => _saving = true);
    try {
      final transaction = Transaction(
        id: const Uuid().v4(),
        amount: amount,
        type: _type,
        categoryId: _selectedCategoryId!,
        accountId: accountId,
        note: _noteController.text.trim(),
        transactionDate: _date,
        createdAt: DateTime.now(),
      );

      final success =
          await ref.read(transactionsProvider.notifier).add(transaction);
      if (success && mounted) {
        context.pop();
      } else if (mounted) {
        _showError('Failed to save transaction');
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categoriesAsync = _type == TransactionType.expense
        ? ref.watch(expenseCategoriesProvider)
        : ref.watch(incomeCategoriesProvider);
    final accountsAsync = ref.watch(accountsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(_type == TransactionType.expense
            ? 'Add Expense'
            : 'Add Income'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save',
                    style: TextStyle(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Type Toggle ──────────────────────────────────────────
            Container(
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: [
                  _TypeChip(
                    label: 'Expense',
                    selected: _type == TransactionType.expense,
                    color: AppColors.expense,
                    onTap: () => setState(() {
                      _type = TransactionType.expense;
                      _selectedCategoryId = null;
                    }),
                  ),
                  _TypeChip(
                    label: 'Income',
                    selected: _type == TransactionType.income,
                    color: AppColors.income,
                    onTap: () => setState(() {
                      _type = TransactionType.income;
                      _selectedCategoryId = null;
                    }),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // ── Amount ───────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: _typeColor.withOpacity(0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _typeColor.withOpacity(0.2)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text('₹',
                      style: TextStyle(
                          color: _typeColor,
                          fontSize: 32,
                          fontWeight: FontWeight.w700)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _amountController,
                      keyboardType: const TextInputType.numberWithOptions(
                          decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(
                            RegExp(r'^\d*\.?\d{0,2}$')),
                      ],
                      style: TextStyle(
                          color: _typeColor,
                          fontSize: 32,
                          fontWeight: FontWeight.w700),
                      decoration: InputDecoration(
                        hintText: '0',
                        hintStyle: TextStyle(
                            color: _typeColor.withOpacity(0.3),
                            fontSize: 32,
                            fontWeight: FontWeight.w700),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ── Category ─────────────────────────────────────────────
            Text('Category',
                style: theme.textTheme.labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            categoriesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
              data: (cats) => _CategoryGrid(
                categories: cats,
                selectedId: _selectedCategoryId,
                onSelect: (id) =>
                    setState(() => _selectedCategoryId = id),
              ),
            ),

            const SizedBox(height: 24),

            // ── Account ──────────────────────────────────────────────
            Text('Account',
                style: theme.textTheme.labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            accountsAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
              data: (accounts) => Wrap(
                spacing: 8,
                children: accounts
                    .map((a) => ChoiceChip(
                          label: Text(a.name),
                          selected: _selectedAccountId == a.id ||
                              (_selectedAccountId == null &&
                                  a == accounts.first),
                          onSelected: (_) =>
                              setState(() => _selectedAccountId = a.id),
                        ))
                    .toList(),
              ),
            ),

            const SizedBox(height: 24),

            // ── Note ─────────────────────────────────────────────────
            Text('Note (optional)',
                style: theme.textTheme.labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            TextField(
              controller: _noteController,
              decoration: InputDecoration(
                hintText: 'e.g. Lunch with friends',
                prefixIcon:
                    const Icon(Icons.edit_note_outlined),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              maxLines: 2,
            ),

            const SizedBox(height: 24),

            // ── Date ─────────────────────────────────────────────────
            Text('Date',
                style: theme.textTheme.labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            InkWell(
              onTap: _pickDate,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  border: Border.all(
                      color: theme.colorScheme.outline),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined,
                        size: 20),
                    const SizedBox(width: 12),
                    Text(formatFullDate(_date),
                        style: theme.textTheme.bodyMedium),
                    const Spacer(),
                    Icon(Icons.chevron_right_outlined,
                        color: theme.colorScheme.onSurfaceVariant),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 36),

            // ── Save Button ──────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: _saving ? null : _save,
                style: FilledButton.styleFrom(
                  backgroundColor: _typeColor,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: _saving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        _type == TransactionType.expense
                            ? 'Save Expense'
                            : 'Save Income',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700),
                      ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  const _TypeChip({
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? color : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: selected ? Colors.white : color,
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryGrid extends StatelessWidget {
  const _CategoryGrid({
    required this.categories,
    required this.selectedId,
    required this.onSelect,
  });

  final List<Category> categories;
  final String? selectedId;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.85,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: categories.length,
      itemBuilder: (context, i) {
        final cat = categories[i];
        final color = Color(cat.color);
        final isSelected = cat.id == selectedId;

        return GestureDetector(
          onTap: () => onSelect(cat.id),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            decoration: BoxDecoration(
              color: isSelected
                  ? color
                  : color.withOpacity(0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? color : color.withOpacity(0.2),
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  IconHelper.fromName(cat.icon),
                  color: isSelected ? Colors.white : color,
                  size: 24,
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    cat.name.split(' / ').first,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isSelected ? Colors.white : color,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
