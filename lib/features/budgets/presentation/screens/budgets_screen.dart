import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/domain/models/budget_progress.dart';
import 'package:paisa_track/features/budgets/providers/budgets_provider.dart';
import 'package:paisa_track/features/budgets/presentation/widgets/budget_card.dart';
import 'package:paisa_track/shared/widgets/empty_state.dart';
import 'package:paisa_track/shared/widgets/loading_indicator.dart';
import 'package:paisa_track/shared/widgets/premium_badge.dart';

/// Indian number formatter for currency display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// Main screen listing all active budgets with progress indicators.
class BudgetsScreen extends ConsumerWidget {
  const BudgetsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progressAsync = ref.watch(budgetProgressListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Budgets'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Create Budget',
            onPressed: () => context.push(AppRoutes.createBudget),
          ),
        ],
      ),
      body: progressAsync.when(
        loading: () => const LoadingIndicator(),
        error: (error, _) => Center(
          child: Text('Failed to load budgets: $error'),
        ),
        data: (progressList) => _BudgetsBody(progressList: progressList),
      ),
    );
  }
}

class _BudgetsBody extends StatelessWidget {
  const _BudgetsBody({required this.progressList});

  final List<BudgetProgress> progressList;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // Smart Budget suggestion card.
        SliverToBoxAdapter(
          child: _SmartBudgetCard(),
        ),

        if (progressList.isEmpty)
          const SliverFillRemaining(
            child: EmptyState(
              title: 'No budgets yet',
              subtitle:
                  'Create a budget to track your spending and stay on top of your finances.',
              actionLabel: 'Create Budget',
            ),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            sliver: SliverList.builder(
              itemCount: progressList.length,
              itemBuilder: (context, index) {
                final progress = progressList[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: BudgetCard(progress: progress),
                );
              },
            ),
          ),
      ],
    );
  }
}

class _SmartBudgetCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Card(
        elevation: 0,
        color: theme.colorScheme.tertiaryContainer.withOpacity(0.4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push(AppRoutes.smartBudget),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.tertiaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.auto_awesome,
                    color: theme.colorScheme.onTertiaryContainer,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Smart Budget',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const PremiumBadge(),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Let AI suggest budgets based on your spending',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
