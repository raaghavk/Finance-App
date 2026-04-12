import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';
import 'package:paisa_track/domain/models/budget.dart';

class BudgetsScreen extends ConsumerWidget {
  const BudgetsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final budgetsAsync = ref.watch(budgetsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Budgets')),
      body: budgetsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (budgets) {
          final active = budgets.where((b) => b.isActive).toList();

          if (active.isEmpty) {
            return _EmptyBudgets(
                onAdd: () => context.push('/budgets/create'));
          }

          return RefreshIndicator(
            onRefresh: () => ref.read(budgetsProvider.notifier).load(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── Summary card ─────────────────────────────────────
                _SummaryCard(budgets: active),
                const SizedBox(height: 20),
                Text('Active Budgets',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                ...active.map((b) => _BudgetCard(budget: b, ref: ref)),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/budgets/create'),
        icon: const Icon(Icons.add),
        label: const Text('New Budget'),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.budgets});
  final List<Budget> budgets;

  @override
  Widget build(BuildContext context) {
    final totalLimit = budgets.fold(0.0, (s, b) => s + b.limitAmount);
    final totalSpent = budgets.fold(0.0, (s, b) => s + b.spentAmount);
    final overBudget = budgets.where((b) => b.isOverBudget).length;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.balanceCardGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('This Month',
              style: TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Spent',
                        style: TextStyle(color: Colors.white60, fontSize: 12)),
                    Text(formatCurrency(totalSpent),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Budget',
                        style: TextStyle(color: Colors.white60, fontSize: 12)),
                    Text(formatCurrency(totalLimit),
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
          ),
          if (overBudget > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: Colors.orangeAccent, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    '$overBudget budget${overBudget > 1 ? 's' : ''} over limit',
                    style: const TextStyle(
                        color: Colors.orangeAccent, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _BudgetCard extends ConsumerWidget {
  const _BudgetCard({required this.budget, required this.ref});
  final Budget budget;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final categories = ref.watch(categoriesProvider).valueOrNull ?? [];

    // Find first category icon/color for this budget
    final firstCat = budget.categoryIds.isNotEmpty
        ? categories.where((c) => c.id == budget.categoryIds.first).firstOrNull
        : null;
    final color = firstCat != null
        ? Color(firstCat.color)
        : AppColors.primary;
    final icon = firstCat != null
        ? IconHelper.fromName(firstCat.icon)
        : Icons.savings_outlined;

    final progress = budget.progressPercent;
    final barColor = budget.isOverBudget ? AppColors.expense : color;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: budget.isOverBudget
                ? AppColors.expense.withOpacity(0.3)
                : theme.colorScheme.outlineVariant,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: color, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(budget.name,
                            style: theme.textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700)),
                        Text(
                          budget.categoryIds.isEmpty
                              ? 'All categories'
                              : '${budget.categoryIds.length} categories',
                          style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 20),
                    color: theme.colorScheme.onSurfaceVariant,
                    onPressed: () => _delete(context, ref),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${formatCurrency(budget.spentAmount)} spent',
                    style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600),
                  ),
                  Text(
                    'of ${formatCurrency(budget.limitAmount)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: barColor.withOpacity(0.12),
                  valueColor: AlwaysStoppedAnimation(barColor),
                  minHeight: 8,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    budget.isOverBudget
                        ? 'Over by ${formatCurrency(budget.spentAmount - budget.limitAmount)}'
                        : '${formatCurrency(budget.remainingAmount)} remaining',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: budget.isOverBudget
                          ? AppColors.expense
                          : AppColors.income,
                    ),
                  ),
                  Text(
                    '${(progress * 100).toStringAsFixed(0)}%',
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: barColor),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _delete(BuildContext context, WidgetRef ref) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Budget'),
        content: Text('Delete "${budget.name}"?'),
        actions: [
          TextButton(onPressed: () => ctx.pop(false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => ctx.pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.expense),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok == true) {
      await ref.read(budgetsProvider.notifier).delete(budget.id);
    }
  }
}

class _EmptyBudgets extends StatelessWidget {
  const _EmptyBudgets({required this.onAdd});
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.savings_outlined,
                  size: 40, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            Text('No budgets yet',
                style: theme.textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('Set spending limits to track\nyour monthly goals',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add),
              label: const Text('Create Budget'),
            ),
          ],
        ),
      ),
    );
  }
}
