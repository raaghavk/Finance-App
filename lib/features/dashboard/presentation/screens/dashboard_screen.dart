import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/features/dashboard/providers/dashboard_provider.dart';
import 'package:paisa_track/features/dashboard/presentation/widgets/balance_card.dart';
import 'package:paisa_track/features/dashboard/presentation/widgets/budget_progress_ring.dart';
import 'package:paisa_track/features/dashboard/presentation/widgets/quick_action_fab.dart';
import 'package:paisa_track/features/dashboard/presentation/widgets/recent_transactions_list.dart';
import 'package:paisa_track/features/dashboard/presentation/widgets/spending_chart.dart';

/// The main dashboard screen of PaisaTrack.
///
/// Displays a financial summary card, active budget progress rings,
/// spending charts, and recent transactions. A [QuickActionFab] at the
/// bottom-right provides fast access to various input methods.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'PaisaTrack',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            tooltip: 'Notifications',
            onPressed: () {
              // TODO: Navigate to notifications / reminders screen.
              context.push(AppRoutes.reminders);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Invalidate providers to force a refresh.
          ref.invalidate(dashboardSummaryProvider);
          ref.invalidate(recentTransactionsProvider);
          ref.invalidate(activeBudgetProgressProvider);
        },
        child: const _DashboardBody(),
      ),
      floatingActionButton: const QuickActionFab(),
    );
  }
}

/// Scrollable body containing all dashboard sections.
class _DashboardBody extends StatelessWidget {
  const _DashboardBody();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.only(bottom: 96), // room for FAB
      children: [
        // ── Balance Card ───────────────────────────────────────────────
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: BalanceCard(),
        ),

        // ── Budget Progress ────────────────────────────────────────────
        _SectionHeader(
          title: 'Budget Progress',
          trailing: TextButton(
            onPressed: () => GoRouter.of(context).go(AppRoutes.budgets),
            child: const Text('View All'),
          ),
        ),
        const BudgetProgressRing(),
        const SizedBox(height: 8),

        // ── Spending Charts ────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: Text(
            'Spending Overview',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 8),
        const SpendingChart(),
        const SizedBox(height: 16),

        // ── Recent Transactions ────────────────────────────────────────
        _SectionHeader(
          title: 'Recent Transactions',
          trailing: TextButton.icon(
            onPressed: () => GoRouter.of(context).go(AppRoutes.transactions),
            icon: const Text('See All'),
            label: const Icon(Icons.arrow_forward_rounded, size: 16),
          ),
        ),
        const RecentTransactionsList(),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    this.trailing,
  });

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
