import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/features/dashboard/providers/dashboard_provider.dart';

/// Displays the last 5 transactions with a "See All" button at the bottom.
class RecentTransactionsList extends ConsumerWidget {
  const RecentTransactionsList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncTxns = ref.watch(recentTransactionsProvider);
    final theme = Theme.of(context);

    return asyncTxns.when(
      loading: () => const SizedBox(
        height: 120,
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          'Could not load transactions',
          style: TextStyle(color: theme.colorScheme.error),
        ),
      ),
      data: (transactions) {
        if (transactions.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 48,
                    color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'No transactions yet. Tap + to add one!',
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
          mainAxisSize: MainAxisSize.min,
          children: [
            ...transactions.map(
              (txn) => _TransactionTile(transaction: txn),
            ),
            // See All button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => context.go(AppRoutes.transactions),
                  icon: const Text('See All'),
                  label: const Icon(Icons.arrow_forward_rounded, size: 18),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Single transaction tile
// ---------------------------------------------------------------------------

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.transaction});

  final Transaction transaction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isExpense = transaction.type == TransactionType.expense;
    final isIncome = transaction.type == TransactionType.income;

    final amountColor = isExpense
        ? const Color(0xFFEF5350)
        : isIncome
            ? const Color(0xFF66BB6A)
            : theme.colorScheme.onSurface;

    final sign = isExpense ? '-' : isIncome ? '+' : '';

    final currencyFormat = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '\u20B9',
      decimalDigits: 2,
    );

    final defaultCat = CategoryConstants.findById(transaction.categoryId);
    final categoryName = defaultCat?.name ?? 'Other';
    final categoryColor =
        defaultCat != null ? Color(defaultCat.color) : theme.colorScheme.primary;
    final categoryIcon = _resolveIcon(defaultCat?.iconName);

    final dateStr = DateFormat('d MMM, h:mm a').format(transaction.transactionDate);

    return ListTile(
      onTap: () {
        context.push(
          AppRoutes.transactionDetail.replaceFirst(':id', transaction.id),
        );
      },
      leading: CircleAvatar(
        backgroundColor: categoryColor.withValues(alpha: 0.15),
        child: Icon(categoryIcon, color: categoryColor, size: 20),
      ),
      title: Text(
        transaction.note.isNotEmpty ? transaction.note : categoryName,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      subtitle: Text(
        '$categoryName  \u2022  $dateStr',
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: theme.textTheme.bodySmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
      trailing: Text(
        '$sign${currencyFormat.format(transaction.amount)}',
        style: theme.textTheme.titleSmall?.copyWith(
          color: amountColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  /// Best-effort icon resolution from a Material icon name string.
  IconData _resolveIcon(String? iconName) {
    const mapping = <String, IconData>{
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
      'account_balance_wallet': Icons.account_balance_wallet,
      'work': Icons.work,
      'store': Icons.store,
      'savings': Icons.savings,
      'pie_chart': Icons.pie_chart,
      'apartment': Icons.apartment,
      'currency_rupee': Icons.currency_rupee,
      'redeem': Icons.redeem,
    };
    return mapping[iconName] ?? Icons.category_outlined;
  }
}
