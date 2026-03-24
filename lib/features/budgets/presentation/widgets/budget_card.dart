import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/domain/models/budget_progress.dart';
import 'package:paisa_track/features/budgets/presentation/widgets/budget_progress_bar.dart';

/// Indian number formatter for currency display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// A card displaying budget name, progress bar, spent/limit amounts,
/// period badge, and category icons.
class BudgetCard extends StatelessWidget {
  const BudgetCard({
    required this.progress,
    this.onTap,
    super.key,
  });

  /// The budget progress data to display.
  final BudgetProgress progress;

  /// Optional tap callback for expanding details.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final budget = progress.budget;
    final percentage = progress.percentage.clamp(0, 150).toDouble();

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant,
          width: 0.5,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Name + Period Badge ────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: Text(
                      budget.name,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _PeriodBadge(period: budget.period),
                ],
              ),
              const SizedBox(height: 12),

              // ── Progress Bar ───────────────────────────────────
              BudgetProgressBar(
                percentage: percentage,
                showLabel: true,
              ),
              const SizedBox(height: 8),

              // ── Spent / Limit text ─────────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${_currencyFormat.format(progress.spent)} spent of '
                    '${_currencyFormat.format(budget.limitAmount)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  if (progress.isOverBudget)
                    Text(
                      'Over by ${_currencyFormat.format(progress.spent - budget.limitAmount)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.error,
                        fontWeight: FontWeight.w600,
                      ),
                    )
                  else
                    Text(
                      '${_currencyFormat.format(progress.remaining)} left',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),

              // ── Category Icons Row ─────────────────────────────
              if (budget.categoryIds.isNotEmpty)
                SizedBox(
                  height: 24,
                  child: Row(
                    children: [
                      ...budget.categoryIds.take(6).map((catId) {
                        final cat = CategoryConstants.findById(catId);
                        if (cat == null) return const SizedBox.shrink();
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: CircleAvatar(
                            radius: 12,
                            backgroundColor:
                                Color(cat.color).withOpacity(0.2),
                            child: Icon(
                              _resolveIcon(cat.iconName),
                              size: 12,
                              color: Color(cat.color),
                            ),
                          ),
                        );
                      }),
                      if (budget.categoryIds.length > 6)
                        Text(
                          '+${budget.categoryIds.length - 6}',
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  /// Maps a string icon name to a Material [IconData].
  static IconData _resolveIcon(String name) {
    const iconMap = <String, IconData>{
      'shopping_cart': Icons.shopping_cart,
      'local_cafe': Icons.local_cafe,
      'electric_rickshaw': Icons.electric_rickshaw,
      'local_taxi': Icons.local_taxi,
      'directions_bus': Icons.directions_bus,
      'local_gas_station': Icons.local_gas_station,
      'lunch_dining': Icons.lunch_dining,
      'home': Icons.home,
      'bolt': Icons.bolt,
      'water_drop': Icons.water_drop,
      'smartphone': Icons.smartphone,
      'wifi': Icons.wifi,
      'school': Icons.school,
      'local_hospital': Icons.local_hospital,
      'medication': Icons.medication,
      'checkroom': Icons.checkroom,
      'card_giftcard': Icons.card_giftcard,
      'temple_hindu': Icons.temple_hindu,
      'movie': Icons.movie,
      'shopping_bag': Icons.shopping_bag,
      'account_balance': Icons.account_balance,
      'security': Icons.security,
      'trending_up': Icons.trending_up,
      'diamond': Icons.diamond,
      'cleaning_services': Icons.cleaning_services,
      'propane_tank': Icons.propane_tank,
      'spa': Icons.spa,
      'content_cut': Icons.content_cut,
      'fitness_center': Icons.fitness_center,
      'more_horiz': Icons.more_horiz,
    };
    return iconMap[name] ?? Icons.category;
  }
}

class _PeriodBadge extends StatelessWidget {
  const _PeriodBadge({required this.period});

  final BudgetPeriod period;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final label = switch (period) {
      BudgetPeriod.weekly => 'Weekly',
      BudgetPeriod.monthly => 'Monthly',
      BudgetPeriod.yearly => 'Yearly',
      BudgetPeriod.custom => 'Custom',
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.onSecondaryContainer,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
