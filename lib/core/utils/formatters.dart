import 'package:intl/intl.dart';

/// Formats a number in the Indian number system: ₹1,00,000
String formatCurrency(double amount, {String symbol = '₹', bool showSign = false}) {
  final formatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: symbol,
    decimalDigits: amount == amount.truncateToDouble() ? 0 : 2,
  );
  final result = formatter.format(amount.abs());
  if (showSign && amount >= 0) return '+$result';
  if (amount < 0) return '-$result';
  return result;
}

/// Short format: ₹1.2L, ₹45K, ₹890
String formatCompact(double amount) {
  final abs = amount.abs();
  final prefix = amount < 0 ? '-₹' : '₹';
  if (abs >= 100000) {
    return '${prefix}${(abs / 100000).toStringAsFixed(1)}L';
  }
  if (abs >= 1000) {
    return '${prefix}${(abs / 1000).toStringAsFixed(1)}K';
  }
  return '$prefix${abs.toStringAsFixed(0)}';
}

/// Today → "Today", yesterday → "Yesterday", else "12 Apr"
String formatRelativeDate(DateTime date) {
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final yesterday = today.subtract(const Duration(days: 1));
  final d = DateTime(date.year, date.month, date.day);

  if (d == today) return 'Today';
  if (d == yesterday) return 'Yesterday';
  if (now.year == date.year) return DateFormat('d MMM').format(date);
  return DateFormat('d MMM yyyy').format(date);
}

/// Returns "April 2026"
String formatMonthYear(DateTime date) => DateFormat('MMMM yyyy').format(date);

/// Returns "12 Apr 2026"
String formatFullDate(DateTime date) => DateFormat('d MMM yyyy').format(date);

/// Returns "2:30 PM"
String formatTime(DateTime date) => DateFormat('h:mm a').format(date);
