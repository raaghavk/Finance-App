import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/features/transactions/providers/transactions_provider.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/transaction_tile.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/filter_sheet.dart';

/// Main screen showing all transactions grouped by date.
class TransactionsListScreen extends ConsumerStatefulWidget {
  const TransactionsListScreen({super.key});

  @override
  ConsumerState<TransactionsListScreen> createState() =>
      _TransactionsListScreenState();
}

class _TransactionsListScreenState
    extends ConsumerState<TransactionsListScreen> {
  bool _isSearchOpen = false;
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleSearch() {
    setState(() {
      _isSearchOpen = !_isSearchOpen;
      if (!_isSearchOpen) {
        _searchController.clear();
        ref.read(transactionFilterNotifierProvider.notifier).setQuery('');
      }
    });
  }

  void _onSearchChanged(String query) {
    ref.read(transactionFilterNotifierProvider.notifier).setQuery(query);
  }

  void _onFilterChipSelected(TransactionType? type) {
    final current = ref.read(transactionFilterNotifierProvider).type;
    ref
        .read(transactionFilterNotifierProvider.notifier)
        .setType(current == type ? null : type);
  }

  Future<void> _onRefresh() async {
    await ref.read(transactionsNotifierProvider.notifier).loadTransactions();
  }

  void _showFilterSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const FilterSheet(),
    );
  }

  Future<void> _confirmDelete(Transaction transaction) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Transaction'),
        content: const Text(
          'Are you sure you want to delete this transaction? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await ref
          .read(transactionsNotifierProvider.notifier)
          .deleteTransaction(transaction.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transaction deleted')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final filter = ref.watch(transactionFilterNotifierProvider);
    final asyncGrouped = ref.watch(transactionsByDateProvider);

    return Scaffold(
      appBar: AppBar(
        title: _isSearchOpen
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: const InputDecoration(
                  hintText: 'Search transactions...',
                  border: InputBorder.none,
                  filled: false,
                ),
                onChanged: _onSearchChanged,
              )
            : const Text('Transactions'),
        actions: [
          IconButton(
            icon: Icon(_isSearchOpen ? Icons.close : Icons.search),
            onPressed: _toggleSearch,
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Filter chips ──────────────────────────────────────────────
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _FilterChipWidget(
                  label: 'All',
                  selected: filter.type == null,
                  onSelected: (_) => _onFilterChipSelected(null),
                ),
                const SizedBox(width: 8),
                _FilterChipWidget(
                  label: 'Income',
                  selected: filter.type == TransactionType.income,
                  onSelected: (_) =>
                      _onFilterChipSelected(TransactionType.income),
                ),
                const SizedBox(width: 8),
                _FilterChipWidget(
                  label: 'Expense',
                  selected: filter.type == TransactionType.expense,
                  onSelected: (_) =>
                      _onFilterChipSelected(TransactionType.expense),
                ),
                const SizedBox(width: 8),
                _FilterChipWidget(
                  label: 'Transfer',
                  selected: filter.type == TransactionType.transfer,
                  onSelected: (_) =>
                      _onFilterChipSelected(TransactionType.transfer),
                ),
                const SizedBox(width: 8),
                ActionChip(
                  avatar: const Icon(Icons.date_range, size: 18),
                  label: Text(
                    filter.startDate != null
                        ? '${DateFormat('d MMM').format(filter.startDate!)} - ${DateFormat('d MMM').format(filter.endDate ?? DateTime.now())}'
                        : 'Date Range',
                  ),
                  onPressed: () async {
                    final range = await showDateRangePicker(
                      context: context,
                      firstDate:
                          DateTime.now().subtract(const Duration(days: 365)),
                      lastDate: DateTime.now(),
                    );
                    if (range != null) {
                      ref
                          .read(transactionFilterNotifierProvider.notifier)
                          .setDateRange(range.start, range.end);
                    }
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),

          // ── Transaction list ──────────────────────────────────────────
          Expanded(
            child: asyncGrouped.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline,
                        size: 48, color: theme.colorScheme.error),
                    const SizedBox(height: 12),
                    Text('Failed to load transactions',
                        style: theme.textTheme.bodyLarge),
                    const SizedBox(height: 8),
                    FilledButton.tonal(
                      onPressed: _onRefresh,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (grouped) {
                if (grouped.isEmpty) {
                  return _EmptyState(onAdd: () {
                    context.push(AppRoutes.addTransaction);
                  });
                }

                final sortedDates = grouped.keys.toList()
                  ..sort((a, b) => b.compareTo(a));

                return RefreshIndicator(
                  onRefresh: _onRefresh,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(bottom: 80),
                    itemCount: sortedDates.length,
                    itemBuilder: (context, index) {
                      final date = sortedDates[index];
                      final transactions = grouped[date]!;
                      return _DateGroup(
                        date: date,
                        transactions: transactions,
                        onTap: (t) {
                          context.push(
                            AppRoutes.transactionDetail
                                .replaceFirst(':id', t.id),
                          );
                        },
                        onLongPress: _confirmDelete,
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
        onPressed: () => context.push(AppRoutes.addTransaction),
        child: const Icon(Icons.add),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Private helper widgets
// ---------------------------------------------------------------------------

class _FilterChipWidget extends StatelessWidget {
  const _FilterChipWidget({
    required this.label,
    required this.selected,
    required this.onSelected,
  });

  final String label;
  final bool selected;
  final ValueChanged<bool> onSelected;

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: onSelected,
      showCheckmark: false,
    );
  }
}

class _DateGroup extends StatelessWidget {
  const _DateGroup({
    required this.date,
    required this.transactions,
    required this.onTap,
    required this.onLongPress,
  });

  final DateTime date;
  final List<Transaction> transactions;
  final ValueChanged<Transaction> onTap;
  final ValueChanged<Transaction> onLongPress;

  String _formatDateHeader(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    if (date == today) return 'Today';
    if (date == yesterday) return 'Yesterday';
    return DateFormat('EEEE, d MMMM yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
          child: Text(
            _formatDateHeader(date),
            style: theme.textTheme.titleSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        ...transactions.map(
          (t) => TransactionTile(
            transaction: t,
            onTap: () => onTap(t),
            onLongPress: () => onLongPress(t),
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onAdd});

  final VoidCallback onAdd;

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
              Icons.receipt_long_outlined,
              size: 80,
              color: theme.colorScheme.onSurfaceVariant.withOpacity(0.4),
            ),
            const SizedBox(height: 16),
            Text(
              'No transactions yet',
              style: theme.textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'Start tracking your expenses by adding your first transaction.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add),
              label: const Text('Add Transaction'),
            ),
          ],
        ),
      ),
    );
  }
}
