import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/models/category.dart' as cat_model;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const _kBackground = Color(0xFF0B0B0F);
const _kSurface = Color(0xFF141418);
const _kSurfaceBorder = Color(0x1AFFFFFF);
const _kTextPrimary = Color(0xFFFFFFFF);
const _kTextSecondary = Color(0xFF8E8E93);
const _kCardRadius = 20.0;
const _kSmallRadius = 16.0;

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD SCREEN
// ═══════════════════════════════════════════════════════════════════════════

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _fabController;
  late final Animation<double> _fabAnimation;
  bool _isFabOpen = false;

  @override
  void initState() {
    super.initState();
    _fabController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );
    _fabAnimation = CurvedAnimation(
      parent: _fabController,
      curve: Curves.easeOutCubic,
      reverseCurve: Curves.easeInCubic,
    );
  }

  @override
  void dispose() {
    _fabController.dispose();
    super.dispose();
  }

  void _toggleFab() {
    setState(() => _isFabOpen = !_isFabOpen);
    if (_isFabOpen) {
      _fabController.forward();
    } else {
      _fabController.reverse();
    }
  }

  void _closeFab() {
    if (_isFabOpen) {
      setState(() => _isFabOpen = false);
      _fabController.reverse();
    }
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final dashAsync = ref.watch(dashboardProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: _kBackground,
      body: GestureDetector(
        onTap: _closeFab,
        child: RefreshIndicator(
          color: AppColors.primary,
          backgroundColor: _kSurface,
          onRefresh: () => ref.refresh(dashboardProvider.future),
          child: SafeArea(
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 16),

                  // ── Greeting Bar ──────────────────────────────────
                  _GreetingBar(greeting: _greeting()),

                  const SizedBox(height: 24),

                  // ── Balance Card ──────────────────────────────────
                  dashAsync.when(
                    loading: () => const _BalanceCardShimmer(),
                    error: (e, _) => _ErrorCard(message: '$e'),
                    data: (data) => _BalanceCard(data: data),
                  ),

                  const SizedBox(height: 20),

                  // ── Stats Row ─────────────────────────────────────
                  dashAsync.when(
                    loading: () => const SizedBox(height: 80),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (data) => _StatsRow(
                      data: data,
                      budgetLimit: settings.monthlyBudgetLimit,
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Spending Breakdown ────────────────────────────
                  dashAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (data) => categoriesAsync.when(
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                      data: (categories) => _SpendingBreakdown(
                        transactions: data.recentTransactions,
                        categories: categories,
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // ── Recent Transactions ───────────────────────────
                  dashAsync.when(
                    loading: () => const _TransactionsShimmer(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (data) => _RecentTransactionsSection(
                      transactions: data.recentTransactions,
                    ),
                  ),

                  // Bottom padding for FAB clearance
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: _SpeedDialFab(
        isOpen: _isFabOpen,
        animation: _fabAnimation,
        onToggle: _toggleFab,
        onAddExpense: () {
          _closeFab();
          context.push('/transactions/add?type=expense');
        },
        onScanReceipt: () {
          _closeFab();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Coming soon'),
              backgroundColor: _kSurface,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        },
        onVoiceInput: () {
          _closeFab();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Coming soon'),
              backgroundColor: _kSurface,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GREETING BAR
// ═══════════════════════════════════════════════════════════════════════════

class _GreetingBar extends StatelessWidget {
  const _GreetingBar({required this.greeting});

  final String greeting;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          greeting,
          style: const TextStyle(
            color: _kTextSecondary,
            fontSize: 16,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.2,
          ),
        ),
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _kSurface,
            border: Border.all(color: _kSurfaceBorder),
          ),
          child: const Icon(
            Icons.person_outline_rounded,
            color: _kTextSecondary,
            size: 20,
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BALANCE CARD — Glassmorphism
// ═══════════════════════════════════════════════════════════════════════════

class _BalanceCard extends StatelessWidget {
  const _BalanceCard({required this.data});

  final DashboardData data;

  @override
  Widget build(BuildContext context) {
    final net = data.monthlyIncome - data.monthlyExpense;
    final isPositive = net >= 0;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(_kCardRadius),
        color: const Color(0xFF1A1A20),
        border: Border.all(color: _kSurfaceBorder),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1C1C24),
            Color(0xFF141418),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Total Balance',
            style: TextStyle(
              color: _kTextSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            formatCurrency(data.totalBalance),
            style: const TextStyle(
              color: _kTextPrimary,
              fontSize: 36,
              fontWeight: FontWeight.w800,
              letterSpacing: -1.0,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: isPositive
                  ? AppColors.income.withValues(alpha: 0.12)
                  : AppColors.expense.withValues(alpha: 0.12),
            ),
            child: Text(
              '${isPositive ? '+' : ''}${formatCurrency(net)} this month',
              style: TextStyle(
                color: isPositive ? AppColors.income : AppColors.expense,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BalanceCardShimmer extends StatelessWidget {
  const _BalanceCardShimmer();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 160,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(_kCardRadius),
        color: _kSurface,
        border: Border.all(color: _kSurfaceBorder),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          color: AppColors.primary,
          strokeWidth: 2,
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS ROW — Spent / Income / Budget Left
// ═══════════════════════════════════════════════════════════════════════════

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.data, required this.budgetLimit});

  final DashboardData data;
  final double budgetLimit;

  @override
  Widget build(BuildContext context) {
    final budgetLeft = budgetLimit > 0
        ? budgetLimit - data.monthlyExpense
        : data.monthlyIncome - data.monthlyExpense;

    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Spent',
            amount: formatCompact(data.monthlyExpense),
            color: AppColors.expense,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            label: 'Income',
            amount: formatCompact(data.monthlyIncome),
            color: AppColors.income,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            label: 'Budget Left',
            amount: formatCompact(budgetLeft),
            color: budgetLeft >= 0
                ? AppColors.primary
                : AppColors.expense,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.amount,
    required this.color,
  });

  final String label;
  final String amount;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(_kSmallRadius),
        color: _kSurface,
        border: Border.all(color: _kSurfaceBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: _kTextSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            amount,
            style: TextStyle(
              color: color,
              fontSize: 17,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPENDING BREAKDOWN — Pie chart + legend
// ═══════════════════════════════════════════════════════════════════════════

class _SpendingBreakdown extends StatelessWidget {
  const _SpendingBreakdown({
    required this.transactions,
    required this.categories,
  });

  final List<Transaction> transactions;
  final List<cat_model.Category> categories;

  @override
  Widget build(BuildContext context) {
    // Group expense transactions by categoryId and sum amounts
    final expenseTxns = transactions
        .where((t) => t.type == TransactionType.expense)
        .toList();

    if (expenseTxns.isEmpty) return const SizedBox.shrink();

    final Map<String, double> categoryTotals = {};
    for (final t in expenseTxns) {
      categoryTotals[t.categoryId] =
          (categoryTotals[t.categoryId] ?? 0) + t.amount;
    }

    // Sort by amount descending, take top 5
    final sortedEntries = categoryTotals.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    final top5 = sortedEntries.take(5).toList();
    final totalExpense = top5.fold(0.0, (s, e) => s + e.value);

    // Build a category lookup map
    final catMap = {for (final c in categories) c.id: c};

    // Build chart data
    final chartSections = <PieChartSectionData>[];
    final legendItems = <_LegendItem>[];

    for (var i = 0; i < top5.length; i++) {
      final entry = top5[i];
      final category = catMap[entry.key];
      final color = AppColors.chartColorsDark[i % AppColors.chartColorsDark.length];
      final percentage = totalExpense > 0
          ? (entry.value / totalExpense * 100)
          : 0.0;

      chartSections.add(
        PieChartSectionData(
          value: entry.value,
          color: color,
          radius: 28,
          showTitle: false,
        ),
      );

      legendItems.add(_LegendItem(
        color: color,
        name: category?.name ?? 'Other',
        amount: formatCompact(entry.value),
        percentage: percentage,
      ));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Where your money goes',
          style: TextStyle(
            color: _kTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_kCardRadius),
            color: _kSurface,
            border: Border.all(color: _kSurfaceBorder),
          ),
          child: Row(
            children: [
              // Pie chart
              SizedBox(
                width: 120,
                height: 120,
                child: PieChart(
                  PieChartData(
                    sections: chartSections,
                    centerSpaceRadius: 30,
                    sectionsSpace: 2,
                    startDegreeOffset: -90,
                  ),
                ),
              ),
              const SizedBox(width: 24),
              // Legend
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: legendItems
                      .map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _LegendRow(item: item),
                          ))
                      .toList(),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _LegendItem {
  const _LegendItem({
    required this.color,
    required this.name,
    required this.amount,
    required this.percentage,
  });

  final Color color;
  final String name;
  final String amount;
  final double percentage;
}

class _LegendRow extends StatelessWidget {
  const _LegendRow({required this.item});

  final _LegendItem item;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: item.color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            item.name,
            style: const TextStyle(
              color: _kTextSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Text(
          item.amount,
          style: const TextStyle(
            color: _kTextPrimary,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RECENT TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

class _RecentTransactionsSection extends ConsumerWidget {
  const _RecentTransactionsSection({required this.transactions});

  final List<Transaction> transactions;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (transactions.isEmpty) {
      return _EmptyTransactions(
        onAdd: () => context.push('/transactions/add'),
      );
    }

    final display = transactions.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Recent Transactions',
              style: TextStyle(
                color: _kTextPrimary,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.2,
              ),
            ),
            GestureDetector(
              onTap: () => context.go('/transactions'),
              child: const Text(
                'See All',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Transaction list
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_kCardRadius),
            color: _kSurface,
            border: Border.all(color: _kSurfaceBorder),
          ),
          child: Column(
            children: [
              for (var i = 0; i < display.length; i++) ...[
                _TransactionTile(
                  transaction: display[i],
                  onTap: () =>
                      context.push('/transactions/${display[i].id}'),
                ),
                if (i < display.length - 1)
                  const Divider(
                    height: 1,
                    indent: 68,
                    endIndent: 16,
                    color: Color(0x0DFFFFFF),
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _TransactionTile extends ConsumerWidget {
  const _TransactionTile({required this.transaction, required this.onTap});

  final Transaction transaction;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final isExpense = transaction.type == TransactionType.expense;

    return categoriesAsync.when(
      loading: () => const SizedBox(height: 64),
      error: (_, __) => const SizedBox(height: 64),
      data: (categories) {
        final category = categories
            .where((c) => c.id == transaction.categoryId)
            .firstOrNull;

        final catColor =
            category != null ? Color(category.color) : AppColors.primary;
        final icon = category != null
            ? IconHelper.fromName(category.icon)
            : Icons.category_outlined;
        final name = category?.name ?? 'Unknown';

        return InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(_kSmallRadius),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                // Category icon container
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: catColor.withValues(alpha: 0.12),
                  ),
                  child: Icon(icon, color: catColor, size: 20),
                ),
                const SizedBox(width: 12),

                // Name and subtitle
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          color: _kTextPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        transaction.note.isNotEmpty
                            ? transaction.note
                            : formatRelativeDate(
                                transaction.transactionDate),
                        style: const TextStyle(
                          color: _kTextSecondary,
                          fontSize: 12,
                          fontWeight: FontWeight.w400,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Amount and date
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${isExpense ? '-' : '+'}${formatCurrency(transaction.amount)}',
                      style: TextStyle(
                        color:
                            isExpense ? AppColors.expense : AppColors.income,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      formatRelativeDate(transaction.transactionDate),
                      style: const TextStyle(
                        color: _kTextSecondary,
                        fontSize: 11,
                      ),
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

class _TransactionsShimmer extends StatelessWidget {
  const _TransactionsShimmer();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Transactions',
          style: TextStyle(
            color: _kTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          height: 200,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_kCardRadius),
            color: _kSurface,
            border: Border.all(color: _kSurfaceBorder),
          ),
          child: const Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyTransactions extends StatelessWidget {
  const _EmptyTransactions({required this.onAdd});

  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Transactions',
          style: TextStyle(
            color: _kTextPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_kCardRadius),
            color: _kSurface,
            border: Border.all(color: _kSurfaceBorder),
          ),
          child: Column(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withValues(alpha: 0.1),
                ),
                child: const Icon(
                  Icons.receipt_long_outlined,
                  size: 32,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'No transactions yet',
                style: TextStyle(
                  color: _kTextPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Add your first transaction to\nstart tracking your finances',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: _kTextSecondary,
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Add Transaction'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CARD
// ═══════════════════════════════════════════════════════════════════════════

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(_kCardRadius),
        color: _kSurface,
        border: Border.all(color: _kSurfaceBorder),
      ),
      child: Column(
        children: [
          const Icon(Icons.error_outline, color: AppColors.expense, size: 32),
          const SizedBox(height: 12),
          Text(
            message,
            style: const TextStyle(color: _kTextSecondary, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPEED-DIAL FAB
// ═══════════════════════════════════════════════════════════════════════════

class _SpeedDialFab extends StatelessWidget {
  const _SpeedDialFab({
    required this.isOpen,
    required this.animation,
    required this.onToggle,
    required this.onAddExpense,
    required this.onScanReceipt,
    required this.onVoiceInput,
  });

  final bool isOpen;
  final Animation<double> animation;
  final VoidCallback onToggle;
  final VoidCallback onAddExpense;
  final VoidCallback onScanReceipt;
  final VoidCallback onVoiceInput;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Mini FABs
        _MiniFabEntry(
          animation: animation,
          index: 2,
          icon: Icons.mic_rounded,
          color: const Color(0xFF7C4DFF),
          label: 'Voice Input',
          onTap: onVoiceInput,
        ),
        const SizedBox(height: 12),
        _MiniFabEntry(
          animation: animation,
          index: 1,
          icon: Icons.camera_alt_rounded,
          color: AppColors.secondary,
          label: 'Scan Receipt',
          onTap: onScanReceipt,
        ),
        const SizedBox(height: 12),
        _MiniFabEntry(
          animation: animation,
          index: 0,
          icon: Icons.remove_rounded,
          color: AppColors.expense,
          label: 'Add Expense',
          onTap: onAddExpense,
        ),
        const SizedBox(height: 16),

        // Main FAB
        AnimatedBuilder(
          animation: animation,
          builder: (context, child) {
            return FloatingActionButton(
              onPressed: onToggle,
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 6,
              shape: const CircleBorder(),
              child: Transform.rotate(
                angle: animation.value * math.pi / 4,
                child: const Icon(Icons.add, size: 28),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _MiniFabEntry extends StatelessWidget {
  const _MiniFabEntry({
    required this.animation,
    required this.index,
    required this.icon,
    required this.color,
    required this.label,
    required this.onTap,
  });

  final Animation<double> animation;
  final int index;
  final IconData icon;
  final Color color;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) {
        final progress = Curves.easeOutCubic.transform(
          (animation.value - index * 0.1).clamp(0.0, 1.0),
        );

        return Opacity(
          opacity: progress,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - progress)),
            child: child,
          ),
        );
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Label chip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _kSurface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: _kSurfaceBorder),
            ),
            child: Text(
              label,
              style: const TextStyle(
                color: _kTextPrimary,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 12),
          // Mini button
          SizedBox(
            width: 44,
            height: 44,
            child: FloatingActionButton(
              heroTag: 'fab_$label',
              onPressed: onTap,
              backgroundColor: color,
              foregroundColor: Colors.white,
              elevation: 4,
              shape: const CircleBorder(),
              child: Icon(icon, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED BUILDER HELPER
// ═══════════════════════════════════════════════════════════════════════════

class AnimatedBuilder extends AnimatedWidget {
  const AnimatedBuilder({
    super.key,
    required Animation<double> animation,
    required this.builder,
    this.child,
  }) : super(listenable: animation);

  final Widget Function(BuildContext context, Widget? child) builder;
  final Widget? child;

  @override
  Widget build(BuildContext context) => builder(context, child);
}
