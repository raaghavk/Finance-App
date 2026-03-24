import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/features/budgets/providers/smart_budget_provider.dart';

/// Indian number formatter for currency display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// A card displaying an AI-generated budget suggestion with
/// category info, average spending, suggested limit, a mini bar
/// chart of the last 3 months, and accept/adjust actions.
class AiSuggestionCard extends StatelessWidget {
  const AiSuggestionCard({
    required this.suggestion,
    required this.onAccept,
    required this.onAdjust,
    super.key,
  });

  /// The budget suggestion to display.
  final BudgetSuggestion suggestion;

  /// Called when the user accepts the suggestion as-is.
  final VoidCallback onAccept;

  /// Called when the user wants to adjust the suggested amount.
  final VoidCallback onAdjust;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: theme.colorScheme.outlineVariant,
          width: 0.5,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Category Header ─────────────────────────────────
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    _resolveIcon(suggestion.categoryIcon),
                    size: 20,
                    color: theme.colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    suggestion.categoryName,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // ── Average & Suggested ─────────────────────────────
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Your average',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_currencyFormat.format(suggestion.monthlyAverage)}/month',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Suggested budget',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_currencyFormat.format(suggestion.suggestedLimit)}/month',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // ── Mini Bar Chart (last 3 months) ──────────────────
            _MiniBarChart(
              values: suggestion.lastThreeMonths,
              suggestedLimit: suggestion.suggestedLimit,
            ),
            const SizedBox(height: 16),

            // ── Action Buttons ──────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onAdjust,
                    child: const Text('Adjust'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton(
                    onPressed: onAccept,
                    child: const Text('Accept'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

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

/// A compact bar chart showing spending for 3 months with a dashed
/// suggested-limit line.
class _MiniBarChart extends StatelessWidget {
  const _MiniBarChart({
    required this.values,
    required this.suggestedLimit,
  });

  final List<double> values;
  final double suggestedLimit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (values.isEmpty) return const SizedBox.shrink();

    final maxVal = [
      ...values,
      suggestedLimit,
    ].reduce((a, b) => a > b ? a : b);

    final now = DateTime.now();
    final monthLabels = List.generate(values.length, (i) {
      final month = DateTime(now.year, now.month - (values.length - 1 - i));
      return DateFormat('MMM').format(month);
    });

    return SizedBox(
      height: 60,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(values.length, (i) {
          final fraction = maxVal > 0 ? (values[i] / maxVal) : 0.0;
          return Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    _currencyFormat.format(values[i]),
                    style: theme.textTheme.labelSmall?.copyWith(
                      fontSize: 9,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Flexible(
                    child: FractionallySizedBox(
                      heightFactor: fraction.clamp(0.05, 1.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.7),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    monthLabels[i],
                    style: theme.textTheme.labelSmall?.copyWith(
                      fontSize: 9,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
