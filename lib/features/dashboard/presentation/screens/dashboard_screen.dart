import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';
import 'package:paisa_track/domain/models/transaction.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashAsync = ref.watch(dashboardProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(dashboardProvider.future),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 220,
              pinned: true,
              backgroundColor: AppColors.primary,
              flexibleSpace: FlexibleSpaceBar(
                background: _BalanceHeader(dashAsync: dashAsync, isDark: isDark),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined,
                      color: Colors.white),
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.account_circle_outlined,
                      color: Colors.white),
                  onPressed: () => context.push('/settings'),
                ),
              ],
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: _QuickActions(),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Recent Transactions',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w700)),
                    TextButton(
                      onPressed: () => context.go('/transactions'),
                      child: const Text('See All'),
                    ),
                  ],
                ),
              ),
            ),

            dashAsync.when(
              loading: () => const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: CircularProgressIndicator()),
                ),
              ),
              error: (e, _) => SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Center(child: Text('Error: $e')),
                ),
              ),
              data: (data) {
                if (data.recentTransactions.isEmpty) {
                  return SliverToBoxAdapter(
                    child: _EmptyTransactions(
                      onAdd: () => context.push('/transactions/add'),
                    ),
                  );
                }
                return SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) {
                      final t = data.recentTransactions[i];
                      return _TransactionTile(
                        transaction: t,
                        onTap: () => context.push('/transactions/${t.id}'),
                      );
                    },
                    childCount: data.recentTransactions.length,
                  ),
                );
              },
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/transactions/add'),
        icon: const Icon(Icons.add),
        label: const Text('Add'),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
      ),
    );
  }
}

class _BalanceHeader extends StatelessWidget {
  const _BalanceHeader({required this.dashAsync, required this.isDark});

  final AsyncValue<DashboardData> dashAsync;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: isDark
            ? AppColors.balanceCardGradientDark
            : AppColors.balanceCardGradient,
      ),
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 16),
      child: dashAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: Colors.white30),
        ),
        error: (_, __) => const SizedBox.shrink(),
        data: (data) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            const Text(
              'Total Balance',
              style: TextStyle(
                  color: Colors.white70, fontSize: 13, letterSpacing: 0.5),
            ),
            const SizedBox(height: 4),
            Text(
              formatCurrency(data.totalBalance),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 34,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _MiniStat(
                  label: DateFormat('MMM').format(DateTime.now()) + ' Income',
                  amount: data.monthlyIncome,
                  color: const Color(0xFF69F0AE),
                  icon: Icons.arrow_downward_rounded,
                ),
                const SizedBox(width: 16),
                _MiniStat(
                  label: DateFormat('MMM').format(DateTime.now()) + ' Expense',
                  amount: data.monthlyExpense,
                  color: const Color(0xFFFF8A80),
                  icon: Icons.arrow_upward_rounded,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.label,
    required this.amount,
    required this.color,
    required this.icon,
  });

  final String label;
  final double amount;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(color: Colors.white60, fontSize: 10)),
                Text(
                  formatCompact(amount),
                  style: TextStyle(
                      color: color, fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _ActionButton(
          icon: Icons.remove_circle_outline,
          label: 'Expense',
          color: AppColors.expense,
          onTap: () => context.push('/transactions/add?type=expense'),
        ),
        const SizedBox(width: 12),
        _ActionButton(
          icon: Icons.add_circle_outline,
          label: 'Income',
          color: AppColors.income,
          onTap: () => context.push('/transactions/add?type=income'),
        ),
        const SizedBox(width: 12),
        _ActionButton(
          icon: Icons.camera_alt_outlined,
          label: 'Scan',
          color: AppColors.primary,
          onTap: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Receipt scanner coming soon!')),
            );
          },
        ),
        const SizedBox(width: 12),
        _ActionButton(
          icon: Icons.bar_chart_rounded,
          label: 'Budgets',
          color: AppColors.tertiary,
          onTap: () => context.go('/budgets'),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.15)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(label,
                  style: TextStyle(
                      color: color,
                      fontSize: 11,
                      fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}

class _TransactionTile extends ConsumerWidget {
  const _TransactionTile({required this.transaction, required this.onTap});

  final Transaction transaction;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final categoriesAsync = ref.watch(categoriesProvider);
    final isExpense = transaction.type == TransactionType.expense;

    return categoriesAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (categories) {
        final category =
            categories.where((c) => c.id == transaction.categoryId).firstOrNull;

        final color =
            category != null ? Color(category.color) : AppColors.primary;
        final icon = category != null
            ? IconHelper.fromName(category.icon)
            : Icons.category_outlined;
        final name = category?.name ?? 'Unknown';

        return InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name,
                          style: theme.textTheme.bodyMedium
                              ?.copyWith(fontWeight: FontWeight.w600)),
                      Text(
                        transaction.note.isEmpty
                            ? formatRelativeDate(transaction.transactionDate)
                            : transaction.note,
                        style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${isExpense ? '-' : '+'}${formatCurrency(transaction.amount)}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isExpense ? AppColors.expense : AppColors.income,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      formatRelativeDate(transaction.transactionDate),
                      style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _EmptyTransactions extends StatelessWidget {
  const _EmptyTransactions({required this.onAdd});
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.receipt_long_outlined,
                size: 40, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text('No transactions yet',
              style: theme.textTheme.titleMedium
                  ?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            'Add your first transaction to\nstart tracking your finances',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: 20),
          FilledButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add),
            label: const Text('Add Transaction'),
          ),
        ],
      ),
    );
  }
}
