import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/features/budgets/providers/budgets_provider.dart';
import 'package:paisa_track/features/budgets/providers/smart_budget_provider.dart';
import 'package:paisa_track/features/budgets/presentation/widgets/ai_suggestion_card.dart';
import 'package:paisa_track/shared/widgets/loading_indicator.dart';

/// Indian number formatter for currency display.
final _currencyFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '\u20B9',
  decimalDigits: 0,
);

/// Premium-gated screen displaying AI-generated budget suggestions
/// based on the last 3 months of spending.
class SmartBudgetScreen extends ConsumerWidget {
  const SmartBudgetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final suggestionsAsync = ref.watch(smartBudgetSuggestionsProvider);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Budget Suggestions'),
      ),
      body: suggestionsAsync.when(
        loading: () => const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LoadingIndicator(),
              SizedBox(height: 16),
              Text('Analysing your spending patterns...'),
            ],
          ),
        ),
        error: (error, _) => _PremiumGate(error: error),
        data: (suggestions) {
          if (suggestions.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      size: 64,
                      color: theme.colorScheme.outline,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Not enough data',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'We need at least 1 month of transactions to '
                      'generate smart budget suggestions.',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          return Column(
            children: [
              // Header explanation
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      color: theme.colorScheme.tertiary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Based on your last 3 months of spending, '
                        'here are personalised budget suggestions.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(indent: 16, endIndent: 16),

              // Suggestion list
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: suggestions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final suggestion = suggestions[index];
                    return AiSuggestionCard(
                      suggestion: suggestion,
                      onAccept: () => _acceptSuggestion(
                        context,
                        ref,
                        suggestion,
                      ),
                      onAdjust: () => _adjustSuggestion(
                        context,
                        ref,
                        suggestion,
                      ),
                    );
                  },
                ),
              ),

              // Accept All button
              SafeArea(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () =>
                          _acceptAll(context, ref, suggestions),
                      icon: const Icon(Icons.check_circle_outline),
                      label: const Text('Accept All'),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _acceptSuggestion(
    BuildContext context,
    WidgetRef ref,
    BudgetSuggestion suggestion,
  ) async {
    await ref.read(budgetsNotifierProvider.notifier).addBudget(
          name: suggestion.categoryName,
          limitAmount: suggestion.suggestedLimit,
          period: BudgetPeriod.monthly,
          startDate: DateTime(DateTime.now().year, DateTime.now().month, 1),
          categoryIds: [suggestion.categoryId],
        );

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Budget created for ${suggestion.categoryName}',
          ),
        ),
      );
    }
  }

  Future<void> _adjustSuggestion(
    BuildContext context,
    WidgetRef ref,
    BudgetSuggestion suggestion,
  ) async {
    final controller = TextEditingController(
      text: suggestion.suggestedLimit.toStringAsFixed(0),
    );

    final adjusted = await showDialog<double>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Adjust ${suggestion.categoryName}'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            prefixText: '\u20B9 ',
            labelText: 'Budget Limit',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final value = double.tryParse(
                controller.text.replaceAll(',', ''),
              );
              Navigator.pop(ctx, value);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );

    controller.dispose();

    if (adjusted != null && adjusted > 0) {
      await ref.read(budgetsNotifierProvider.notifier).addBudget(
            name: suggestion.categoryName,
            limitAmount: adjusted,
            period: BudgetPeriod.monthly,
            startDate:
                DateTime(DateTime.now().year, DateTime.now().month, 1),
            categoryIds: [suggestion.categoryId],
          );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Budget created for ${suggestion.categoryName}',
            ),
          ),
        );
      }
    }
  }

  Future<void> _acceptAll(
    BuildContext context,
    WidgetRef ref,
    List<BudgetSuggestion> suggestions,
  ) async {
    for (final suggestion in suggestions) {
      await ref.read(budgetsNotifierProvider.notifier).addBudget(
            name: suggestion.categoryName,
            limitAmount: suggestion.suggestedLimit,
            period: BudgetPeriod.monthly,
            startDate:
                DateTime(DateTime.now().year, DateTime.now().month, 1),
            categoryIds: [suggestion.categoryId],
          );
    }

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${suggestions.length} budgets created successfully',
          ),
        ),
      );
      context.pop();
    }
  }
}

/// Shown when the user is not on a premium plan.
class _PremiumGate extends StatelessWidget {
  const _PremiumGate({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.lock_outline,
              size: 64,
              color: theme.colorScheme.tertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'Premium Feature',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Smart Budget suggestions require a Premium subscription. '
              'Upgrade to unlock AI-powered budgets.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.push('/settings/premium'),
              child: const Text('Upgrade to Premium'),
            ),
          ],
        ),
      ),
    );
  }
}
