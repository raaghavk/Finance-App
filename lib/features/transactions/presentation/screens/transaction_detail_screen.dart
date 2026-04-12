import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';
import 'package:paisa_track/core/utils/icon_helper.dart';

class TransactionDetailScreen extends ConsumerWidget {
  const TransactionDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final txnsAsync = ref.watch(transactionsProvider);
    final categoriesAsync = ref.watch(categoriesProvider);
    final accountsAsync = ref.watch(accountsProvider);

    return txnsAsync.when(
      loading: () =>
          const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) =>
          Scaffold(body: Center(child: Text('Error: $e'))),
      data: (txns) {
        final t = txns.where((t) => t.id == id).firstOrNull;
        if (t == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Transaction')),
            body: const Center(child: Text('Transaction not found')),
          );
        }

        final isExpense = t.type == TransactionType.expense;
        final color = isExpense ? AppColors.expense : AppColors.income;

        final categories = categoriesAsync.valueOrNull ?? [];
        final category = categories.where((c) => c.id == t.categoryId).firstOrNull;
        final accounts = accountsAsync.valueOrNull ?? [];
        final account = accounts.where((a) => a.id == t.accountId).firstOrNull;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Transaction Details'),
            actions: [
              IconButton(
                icon: const Icon(Icons.delete_outline, color: AppColors.expense),
                onPressed: () => _confirmDelete(context, ref, id),
              ),
            ],
          ),
          body: SingleChildScrollView(
            child: Column(
              children: [
                // ── Hero ──────────────────────────────────────────────
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(32),
                  color: color.withOpacity(0.08),
                  child: Column(
                    children: [
                      if (category != null)
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: Color(category.color).withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            IconHelper.fromName(category.icon),
                            color: Color(category.color),
                            size: 32,
                          ),
                        ),
                      const SizedBox(height: 12),
                      Text(
                        '${isExpense ? '-' : '+'}${formatCurrency(t.amount)}',
                        style: TextStyle(
                          fontSize: 36,
                          fontWeight: FontWeight.w800,
                          color: color,
                        ),
                      ),
                      Text(
                        category?.name ?? 'Unknown Category',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // ── Details ───────────────────────────────────────────
                _DetailRow(label: 'Type', value: isExpense ? 'Expense' : 'Income',
                    valueColor: color),
                const Divider(indent: 16, endIndent: 16, height: 1),
                _DetailRow(
                    label: 'Date',
                    value: formatFullDate(t.transactionDate)),
                const Divider(indent: 16, endIndent: 16, height: 1),
                _DetailRow(
                    label: 'Account',
                    value: account?.name ?? 'Unknown'),
                if (t.note.isNotEmpty) ...[
                  const Divider(indent: 16, endIndent: 16, height: 1),
                  _DetailRow(label: 'Note', value: t.note),
                ],
                const Divider(indent: 16, endIndent: 16, height: 1),
                _DetailRow(
                    label: 'Added on',
                    value: '${formatFullDate(t.createdAt)} · ${formatTime(t.createdAt)}'),

                const SizedBox(height: 32),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _confirmDelete(context, ref, id),
                      icon: const Icon(Icons.delete_outline,
                          color: AppColors.expense),
                      label: const Text('Delete Transaction',
                          style: TextStyle(color: AppColors.expense)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.expense),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _confirmDelete(
      BuildContext context, WidgetRef ref, String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Transaction'),
        content: const Text(
            'Are you sure you want to delete this transaction? This action cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => ctx.pop(false),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () => ctx.pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.expense),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(transactionsProvider.notifier).delete(id);
      if (context.mounted) context.pop();
    }
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value, this.valueColor});

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label,
                style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant)),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: valueColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
