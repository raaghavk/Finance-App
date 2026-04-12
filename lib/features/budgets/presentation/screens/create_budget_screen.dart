import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';

import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/category.dart';

class CreateBudgetScreen extends ConsumerStatefulWidget {
  const CreateBudgetScreen({super.key});

  @override
  ConsumerState<CreateBudgetScreen> createState() =>
      _CreateBudgetScreenState();
}

class _CreateBudgetScreenState extends ConsumerState<CreateBudgetScreen> {
  final _nameController = TextEditingController();
  final _limitController = TextEditingController();
  final Set<String> _selectedCategoryIds = {};
  bool _saving = false;

  @override
  void dispose() {
    _nameController.dispose();
    _limitController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_nameController.text.trim().isEmpty) {
      _showError('Please enter a budget name');
      return;
    }
    final limit = double.tryParse(_limitController.text.replaceAll(',', ''));
    if (limit == null || limit <= 0) {
      _showError('Please enter a valid limit amount');
      return;
    }

    setState(() => _saving = true);
    try {
      final budget = Budget(
        id: const Uuid().v4(),
        name: _nameController.text.trim(),
        limitAmount: limit,
        startDate: DateTime(DateTime.now().year, DateTime.now().month, 1),
        isActive: true,
        categoryIds: _selectedCategoryIds.toList(),
        createdAt: DateTime.now(),
      );
      await ref.read(budgetsProvider.notifier).add(budget);
      if (mounted) context.pop();
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
    final categoriesAsync = ref.watch(expenseCategoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Budget'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2))
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
            // ── Name ────────────────────────────────────────────────
            Text('Budget Name',
                style: theme.textTheme.labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                hintText: 'e.g. Food Budget, Transport',
                prefixIcon: const Icon(Icons.label_outline),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),

            const SizedBox(height: 24),

            // ── Limit ────────────────────────────────────────────────
            Text('Monthly Limit (₹)',
                style: theme.textTheme.labelLarge
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            TextField(
              controller: _limitController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(
                    RegExp(r'^\d*\.?\d{0,2}$')),
              ],
              decoration: InputDecoration(
                hintText: '5000',
                prefixText: '₹ ',
                prefixStyle: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 16),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              style: const TextStyle(
                  fontSize: 20, fontWeight: FontWeight.w700),
            ),

            const SizedBox(height: 24),

            // ── Categories ───────────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Categories',
                    style: theme.textTheme.labelLarge
                        ?.copyWith(fontWeight: FontWeight.w600)),
                Text(
                  _selectedCategoryIds.isEmpty ? 'All' : '${_selectedCategoryIds.length} selected',
                  style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Leave empty to track all expenses, or select specific categories.',
              style: theme.textTheme.bodySmall
                  ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 12),

            categoriesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
              data: (cats) => _CategorySelector(
                categories: cats,
                selected: _selectedCategoryIds,
                onToggle: (id) => setState(() {
                  if (_selectedCategoryIds.contains(id)) {
                    _selectedCategoryIds.remove(id);
                  } else {
                    _selectedCategoryIds.add(id);
                  }
                }),
              ),
            ),

            const SizedBox(height: 36),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: _saving ? null : _save,
                style: FilledButton.styleFrom(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: _saving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Create Budget',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _CategorySelector extends StatelessWidget {
  const _CategorySelector({
    required this.categories,
    required this.selected,
    required this.onToggle,
  });

  final List<Category> categories;
  final Set<String> selected;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: categories.map((cat) {
        final isSelected = selected.contains(cat.id);
        final color = Color(cat.color);
        return FilterChip(
          label: Text(cat.name.split(' / ').first),
          avatar: Icon(IconHelper.fromName(cat.icon), size: 16,
              color: isSelected ? Colors.white : color),
          selected: isSelected,
          onSelected: (_) => onToggle(cat.id),
          selectedColor: color,
          checkmarkColor: Colors.white,
          labelStyle: TextStyle(
            color: isSelected ? Colors.white : null,
            fontSize: 13,
          ),
          backgroundColor: color.withOpacity(0.08),
          side: BorderSide(
              color: isSelected ? color : color.withOpacity(0.2)),
        );
      }).toList(),
    );
  }
}
