import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';
import 'package:paisa_track/domain/models/transaction.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() =>
      _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  TransactionType? _filterType;
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final txnsAsync = ref.watch(transactionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        actions: [
          PopupMenuButton<TransactionType?>(
            icon: Icon(
              Icons.filter_list,
              color: _filterType != null ? AppColors.primary : null,
            ),
            onSelected: (v) => setState(() => _filterType = v),
            itemBuilder: (_) => [
              const PopupMenuItem(
                  value: null, child: Text('All')),
              const PopupMenuItem(
                  value: TransactionType.expense,
                  child: Text('Expenses only')),
              const PopupMenuItem(
                  value: TransactionType.income,
                  child: Text('Income only')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Search ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: SearchBar(
              hintText: 'Search transactions…',
              leading: const Icon(Icons.search_outlined, size: 20),
              padding: const WidgetStatePropertyAll(
                  EdgeInsets.symmetric(horizontal: 12)),
              onChanged: (v) => setState(() => _search = v.toLowerCase()),
            ),
          ),

          // ── List ─────────────────────────────────────────────────────
          Expanded(
            child: txnsAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (all) {
                final txns = all.where((t) {
                  if (_filterType != null && t.type != _filterType) {
                    return false;
                  }
                  if (_search.isNotEmpty &&
                      !t.note.toLowerCase().contains(_search)) {
                    return false;
                  }
                  return true;
                }).toList();

                if (txns.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.receipt_long_outlined,
                            size: 56,
                            color: theme.colorScheme.onSurfaceVariant
                                .withOpacity(0.3)),
                        const SizedBox(height: 12),
                        Text('No transactions',
                            style: theme.textTheme.bodyLarge?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant)),
                      ],
                    ),
                  );
                }

                // Group by date
                final grouped = _groupByDate(txns);
                final keys = grouped.keys.toList();

                return RefreshIndicator(
                  onRefresh: () =>
                      ref.read(transactionsProvider.notifier).load(),
                  child: ListView.builder(
                    itemCount: keys.length,
                    itemBuilder: (context, i) {
                      final date = keys[i];
                      final dayTxns = grouped[date]!;
                      final dayTotal = dayTxns.fold(0.0, (sum, t) {
                        return t.type == TransactionType.expense
                            ? sum - t.amount
                            : sum + t.amount;
                      });

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Date header
                          Padding(
                            padding: const EdgeInsets.fromLTRB(
                                16, 16, 16, 4),
                            child: Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  formatRelativeDate(date),
                                  style: theme.textTheme.labelMedium
                                      ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: theme.colorScheme.onSurfaceVariant,
                                  ),
                                ),
                                Text(
                                  (dayTotal >= 0 ? '+' : '') +
                                      formatCurrency(dayTotal),
                                  style: theme.textTheme.labelMedium
                                      ?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: dayTotal >= 0
                                        ? AppColors.income
                                        : AppColors.expense,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          ...dayTxns.map((t) => _TxnTile(
                                transaction: t,
                                onTap: () =>
                                    context.push('/transactions/${t.id}'),
                              )),
                        ],
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/transactions/add'),
        child: const Icon(Icons.add),
      ),
    );
  }

  Map<DateTime, List<Transaction>> _groupByDate(
      List<Transaction> txns) {
    final Map<DateTime, List<Transaction>> result = {};
    for (final t in txns) {
      final key = DateTime(t.transactionDate.year,
          t.transactionDate.month, t.transactionDate.day);
      result.putIfAbsent(key, () => []).add(t);
    }
    return result;
  }
}

class _TxnTile extends ConsumerWidget {
  const _TxnTile({required this.transaction, required this.onTap});

  final Transaction transaction;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final categories = ref.watch(categoriesProvider).valueOrNull ?? [];
    final category = categories
        .where((c) => c.id == transaction.categoryId)
        .firstOrNull;

    final color = category != null ? Color(category.color) : AppColors.primary;
    final icon = category != null
        ? IconHelper.fromName(category.icon)
        : Icons.category_outlined;
    final name = category?.name ?? 'Unknown';
    final isExpense = transaction.type == TransactionType.expense;

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
                  if (transaction.note.isNotEmpty)
                    Text(transaction.note,
                        style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            Text(
              '${isExpense ? '-' : '+'}${formatCurrency(transaction.amount)}',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isExpense ? AppColors.expense : AppColors.income,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
