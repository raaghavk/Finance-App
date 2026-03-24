import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/features/transactions/providers/transactions_provider.dart';

/// Displays full details of a single transaction.
class TransactionDetailScreen extends ConsumerWidget {
  const TransactionDetailScreen({
    super.key,
    required this.transactionId,
  });

  final String transactionId;

  // ── Helpers ──────────────────────────────────────────────────────────────

  static String _formatIndianAmount(double amount) {
    if (amount >= 10000000) {
      return '${(amount / 10000000).toStringAsFixed(2)} Cr';
    }
    if (amount >= 100000) {
      return '${(amount / 100000).toStringAsFixed(2)} L';
    }
    // Use custom Indian grouping.
    final wholePart = amount.truncate();
    final decimalPart =
        ((amount - wholePart) * 100).round().toString().padLeft(2, '0');
    final wholeStr = wholePart.toString();

    if (wholeStr.length <= 3) return '$wholeStr.$decimalPart';

    final last3 = wholeStr.substring(wholeStr.length - 3);
    var remaining = wholeStr.substring(0, wholeStr.length - 3);
    final buffer = StringBuffer();
    while (remaining.length > 2) {
      buffer.write('${remaining.substring(0, remaining.length - 2)},');
      remaining = remaining.substring(remaining.length - 2);
    }
    buffer.write(remaining);

    // Reverse the grouping: buffer has groups from the left
    final groups = buffer.toString().split(',').where((s) => s.isNotEmpty);
    final formatted = '${groups.join(',')},$last3';
    return '$formatted.$decimalPart';
  }

  Color _typeColor(TransactionType type, ColorScheme colors) {
    switch (type) {
      case TransactionType.income:
        return Colors.green;
      case TransactionType.expense:
        return Colors.red;
      case TransactionType.transfer:
        return Colors.blue;
    }
  }

  IconData _inputSourceIcon(InputSource source) {
    switch (source) {
      case InputSource.manual:
        return Icons.edit;
      case InputSource.voice:
        return Icons.mic;
      case InputSource.chat:
        return Icons.chat_bubble_outline;
      case InputSource.ocr:
        return Icons.camera_alt;
      case InputSource.sms:
        return Icons.sms_outlined;
    }
  }

  String _inputSourceLabel(InputSource source) {
    switch (source) {
      case InputSource.manual:
        return 'Manual';
      case InputSource.voice:
        return 'Voice';
      case InputSource.chat:
        return 'Chat';
      case InputSource.ocr:
        return 'Receipt Scan';
      case InputSource.sms:
        return 'SMS';
    }
  }

  IconData _categoryIcon(String iconName) {
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
      'account_balance_wallet': Icons.account_balance_wallet,
      'work': Icons.work,
      'store': Icons.store,
      'savings': Icons.savings,
      'pie_chart': Icons.pie_chart,
      'apartment': Icons.apartment,
      'currency_rupee': Icons.currency_rupee,
      'redeem': Icons.redeem,
    };
    return iconMap[iconName] ?? Icons.category;
  }

  Future<void> _confirmDelete(
    BuildContext context,
    WidgetRef ref,
    Transaction transaction,
  ) async {
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
    if (confirmed == true) {
      final success = await ref
          .read(transactionsNotifierProvider.notifier)
          .deleteTransaction(transaction.id);
      if (success && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transaction deleted')),
        );
        context.pop();
      }
    }
  }

  void _showReceiptFullScreen(BuildContext context, String imagePath) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          appBar: AppBar(
            backgroundColor: Colors.black,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          backgroundColor: Colors.black,
          body: Center(
            child: InteractiveViewer(
              child: Image.file(File(imagePath)),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final asyncTransactions = ref.watch(transactionsNotifierProvider);

    return asyncTransactions.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (error, _) => Scaffold(
        appBar: AppBar(title: const Text('Transaction')),
        body: Center(child: Text('Error: $error')),
      ),
      data: (transactions) {
        final transaction = transactions.cast<Transaction?>().firstWhere(
              (t) => t?.id == transactionId,
              orElse: () => null,
            );

        if (transaction == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Transaction')),
            body: const Center(child: Text('Transaction not found')),
          );
        }

        final category = CategoryConstants.findById(transaction.categoryId);
        final amountColor = _typeColor(transaction.type, colors);
        final sign = transaction.type == TransactionType.income ? '+' : '-';
        final amountDisplay = transaction.type == TransactionType.transfer
            ? _formatIndianAmount(transaction.amount)
            : '$sign${_formatIndianAmount(transaction.amount)}';

        return Scaffold(
          appBar: AppBar(
            title: const Text('Transaction Details'),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                tooltip: 'Edit',
                onPressed: () {
                  context.push(
                    '${AppRoutes.addTransaction}?editId=${transaction.id}',
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline),
                tooltip: 'Delete',
                onPressed: () => _confirmDelete(context, ref, transaction),
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Amount ────────────────────────────────────────────
                Center(
                  child: Column(
                    children: [
                      Text(
                        '\u20B9 $amountDisplay',
                        style: theme.textTheme.displaySmall?.copyWith(
                          color: amountColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Type badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: amountColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          transaction.type.label,
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: amountColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 12),

                // ── Category ──────────────────────────────────────────
                _DetailRow(
                  icon: category != null
                      ? _categoryIcon(category.iconName)
                      : Icons.category,
                  iconColor:
                      category != null ? Color(category.color) : colors.primary,
                  label: 'Category',
                  value: category?.name ?? 'Unknown',
                ),
                const SizedBox(height: 16),

                // ── Account ──────────────────────────────────────────
                _DetailRow(
                  icon: Icons.account_balance_wallet,
                  iconColor: colors.primary,
                  label: transaction.type == TransactionType.transfer
                      ? 'From Account'
                      : 'Account',
                  value: transaction.accountId, // TODO: resolve to name
                ),
                if (transaction.type == TransactionType.transfer &&
                    transaction.toAccountId != null) ...[
                  const SizedBox(height: 16),
                  _DetailRow(
                    icon: Icons.arrow_forward,
                    iconColor: Colors.blue,
                    label: 'To Account',
                    value: transaction.toAccountId!,
                  ),
                ],
                const SizedBox(height: 16),

                // ── Date & Time ──────────────────────────────────────
                _DetailRow(
                  icon: Icons.calendar_today,
                  iconColor: colors.primary,
                  label: 'Date & Time',
                  value: DateFormat('EEEE, d MMMM yyyy  h:mm a')
                      .format(transaction.transactionDate),
                ),
                const SizedBox(height: 16),

                // ── Note ─────────────────────────────────────────────
                if (transaction.note.isNotEmpty) ...[
                  _DetailRow(
                    icon: Icons.notes,
                    iconColor: colors.primary,
                    label: 'Note',
                    value: transaction.note,
                  ),
                  const SizedBox(height: 16),
                ],

                // ── Input Source badge ───────────────────────────────
                _DetailRow(
                  icon: _inputSourceIcon(transaction.inputSource),
                  iconColor: colors.tertiary,
                  label: 'Input Source',
                  value: _inputSourceLabel(transaction.inputSource),
                ),
                const SizedBox(height: 16),

                // ── Receipt Image ────────────────────────────────────
                if (transaction.receiptImagePath != null &&
                    transaction.receiptImagePath!.isNotEmpty) ...[
                  const Divider(),
                  const SizedBox(height: 12),
                  Text(
                    'Receipt',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => _showReceiptFullScreen(
                        context, transaction.receiptImagePath!),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(
                        File(transaction.receiptImagePath!),
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          height: 200,
                          decoration: BoxDecoration(
                            color: colors.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(
                            child: Icon(Icons.broken_image, size: 48),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Private helper widget
// ---------------------------------------------------------------------------

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: theme.textTheme.bodyLarge,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
