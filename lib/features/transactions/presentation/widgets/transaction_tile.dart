import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/transaction.dart';

/// A single transaction row for use in a list view.
///
/// Shows category icon, name, truncated note, time, formatted amount
/// (coloured by type), and a small input-source indicator icon.
class TransactionTile extends StatelessWidget {
  const TransactionTile({
    super.key,
    required this.transaction,
    this.onTap,
    this.onLongPress,
  });

  final Transaction transaction;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  // ── Amount formatting (Indian number system) ────────────────────────────

  static String formatIndianAmount(double amount) {
    final wholePart = amount.truncate().abs();
    final decimalPart =
        ((amount.abs() - wholePart) * 100).round().toString().padLeft(2, '0');
    final wholeStr = wholePart.toString();

    if (wholeStr.length <= 3) return '$wholeStr.$decimalPart';

    final last3 = wholeStr.substring(wholeStr.length - 3);
    var remaining = wholeStr.substring(0, wholeStr.length - 3);
    final groups = <String>[];
    while (remaining.length > 2) {
      groups.add(remaining.substring(remaining.length - 2));
      remaining = remaining.substring(0, remaining.length - 2);
    }
    if (remaining.isNotEmpty) groups.add(remaining);
    final reversed = groups.reversed.join(',');
    return '$reversed,$last3.$decimalPart';
  }

  // ── Icon maps ───────────────────────────────────────────────────────────

  static IconData categoryIconFromName(String iconName) {
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

  static IconData _inputSourceIcon(InputSource source) {
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

  static Color _amountColor(TransactionType type) {
    switch (type) {
      case TransactionType.income:
        return Colors.green;
      case TransactionType.expense:
        return Colors.red;
      case TransactionType.transfer:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final category = CategoryConstants.findById(transaction.categoryId);
    final catColor =
        category != null ? Color(category.color) : theme.colorScheme.primary;
    final catIcon = category != null
        ? categoryIconFromName(category.iconName)
        : Icons.category;
    final catName = category?.name ?? 'Unknown';
    final amountColor = _amountColor(transaction.type);

    final sign = transaction.type == TransactionType.income
        ? '+'
        : transaction.type == TransactionType.expense
            ? '-'
            : '';
    final amountText =
        '$sign\u20B9${formatIndianAmount(transaction.amount)}';
    final timeText = DateFormat('h:mm a').format(transaction.transactionDate);

    return ListTile(
      onTap: onTap,
      onLongPress: onLongPress,
      leading: CircleAvatar(
        backgroundColor: catColor.withOpacity(0.15),
        child: Icon(catIcon, color: catColor, size: 20),
      ),
      title: Text(
        catName,
        style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
      ),
      subtitle: Row(
        children: [
          if (transaction.note.isNotEmpty) ...[
            Flexible(
              child: Text(
                transaction.note,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
            const SizedBox(width: 6),
          ],
          Text(
            timeText,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant.withOpacity(0.7),
            ),
          ),
          const SizedBox(width: 4),
          Icon(
            _inputSourceIcon(transaction.inputSource),
            size: 12,
            color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5),
          ),
        ],
      ),
      trailing: Text(
        amountText,
        style: theme.textTheme.titleMedium?.copyWith(
          color: amountColor,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
