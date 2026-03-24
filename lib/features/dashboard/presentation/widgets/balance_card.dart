import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/features/dashboard/providers/dashboard_provider.dart';

/// Formats a number using the Indian numbering system (lakh / crore grouping).
String _formatIndian(double value) {
  final format = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '\u20B9',
    decimalDigits: 2,
  );
  return format.format(value);
}

/// A prominent card at the top of the dashboard displaying the user's
/// total balance, monthly income, monthly expense, and savings rate.
class BalanceCard extends ConsumerWidget {
  const BalanceCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncSummary = ref.watch(dashboardSummaryProvider);

    return asyncSummary.when(
      loading: () => const _BalanceCardShell(isLoading: true),
      error: (error, _) => _BalanceCardShell(errorMessage: error.toString()),
      data: (summary) => _BalanceCardContent(summary: summary),
    );
  }
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

class _BalanceCardContent extends StatelessWidget {
  const _BalanceCardContent({required this.summary});

  final DashboardSummary summary;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF00897B), Color(0xFFFF8F00)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00897B).withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Period label
          Text(
            'This Month',
            style: theme.textTheme.labelMedium?.copyWith(
              color: Colors.white70,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),

          // Total balance
          Text(
            'Total Balance',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.85),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            _formatIndian(summary.totalBalance),
            style: theme.textTheme.headlineLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          // Income / Expense row
          Row(
            children: [
              // Income
              Expanded(
                child: _MetricTile(
                  icon: Icons.arrow_upward_rounded,
                  iconColor: const Color(0xFF69F0AE),
                  label: 'Income',
                  amount: summary.monthlyIncome,
                ),
              ),
              Container(
                width: 1,
                height: 36,
                color: Colors.white24,
              ),
              // Expense
              Expanded(
                child: _MetricTile(
                  icon: Icons.arrow_downward_rounded,
                  iconColor: const Color(0xFFFF5252),
                  label: 'Expense',
                  amount: summary.monthlyExpense,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Savings indicator
          _SavingsIndicator(
            savings: summary.monthlySavings,
            rate: summary.savingsRate,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Sub-widgets
// ---------------------------------------------------------------------------

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.amount,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final double amount;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: Colors.white60,
              ),
            ),
            Text(
              _formatIndian(amount),
              style: theme.textTheme.titleSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _SavingsIndicator extends StatelessWidget {
  const _SavingsIndicator({
    required this.savings,
    required this.rate,
  });

  final double savings;
  final double rate;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final percentage = (rate * 100).clamp(-999, 999).toStringAsFixed(1);
    final isPositive = savings >= 0;

    return Row(
      children: [
        Icon(
          isPositive ? Icons.savings_outlined : Icons.warning_amber_rounded,
          color: isPositive ? const Color(0xFF69F0AE) : const Color(0xFFFF5252),
          size: 18,
        ),
        const SizedBox(width: 6),
        Text(
          isPositive
              ? 'Saving $percentage% of income'
              : 'Overspent by ${_formatIndian(savings.abs())}',
          style: theme.textTheme.bodySmall?.copyWith(
            color: Colors.white.withValues(alpha: 0.85),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Loading / error shell
// ---------------------------------------------------------------------------

class _BalanceCardShell extends StatelessWidget {
  const _BalanceCardShell({
    this.isLoading = false,
    this.errorMessage,
  });

  final bool isLoading;
  final String? errorMessage;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF00897B), Color(0xFFFF8F00)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Text(
                errorMessage ?? 'Something went wrong',
                style: const TextStyle(color: Colors.white70),
              ),
      ),
    );
  }
}
