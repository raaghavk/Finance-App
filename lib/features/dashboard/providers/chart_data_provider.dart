import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/features/dashboard/providers/dashboard_provider.dart';

part 'chart_data_provider.g.dart';

// ---------------------------------------------------------------------------
// Daily spending data point
// ---------------------------------------------------------------------------

/// A single (date, amount) pair used for the daily spending bar chart.
class DailySpendingEntry {
  const DailySpendingEntry({required this.date, required this.amount});

  final DateTime date;
  final double amount;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DailySpendingEntry &&
          date.year == other.date.year &&
          date.month == other.date.month &&
          date.day == other.date.day &&
          amount == other.amount;

  @override
  int get hashCode => Object.hash(date.year, date.month, date.day, amount);
}

// ---------------------------------------------------------------------------
// Weekly comparison data
// ---------------------------------------------------------------------------

/// Comparison of spending totals between the current and previous week.
class WeeklyComparison {
  const WeeklyComparison({
    required this.thisWeekSpending,
    required this.lastWeekSpending,
  });

  final double thisWeekSpending;
  final double lastWeekSpending;

  /// Percentage change from last week to this week.
  /// Positive means spending increased, negative means decreased.
  double get changePercent => lastWeekSpending == 0
      ? (thisWeekSpending > 0 ? 100.0 : 0.0)
      : ((thisWeekSpending - lastWeekSpending) / lastWeekSpending) * 100;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

/// Provides a map of category name to total expense amount for the current
/// month, suitable for rendering a pie chart.
@riverpod
Future<Map<String, double>> spendingByCategory(
  SpendingByCategoryRef ref,
) async {
  final transactions = await ref.watch(allTransactionsProvider.future);

  final now = DateTime.now();
  final startOfMonth = DateTime(now.year, now.month);

  final Map<String, double> categoryTotals = {};

  for (final txn in transactions) {
    if (txn.isDeleted) continue;
    if (txn.type != TransactionType.expense) continue;
    if (txn.transactionDate.isBefore(startOfMonth)) continue;

    // Resolve category name from the default constants, falling back to
    // the category ID when the category is user-created.
    final defaultCat = CategoryConstants.findById(txn.categoryId);
    final categoryName = defaultCat?.name ?? txn.categoryId;

    categoryTotals[categoryName] =
        (categoryTotals[categoryName] ?? 0) + txn.amount;
  }

  return categoryTotals;
}

/// Provides a list of daily spending totals for each day of the current month
/// (up to today), suitable for a bar chart.
@riverpod
Future<List<DailySpendingEntry>> dailySpending(
  DailySpendingRef ref,
) async {
  final transactions = await ref.watch(allTransactionsProvider.future);

  final now = DateTime.now();
  final startOfMonth = DateTime(now.year, now.month);

  // Build a map keyed by day-of-month.
  final Map<int, double> dayTotals = {};
  for (var day = 1; day <= now.day; day++) {
    dayTotals[day] = 0;
  }

  for (final txn in transactions) {
    if (txn.isDeleted) continue;
    if (txn.type != TransactionType.expense) continue;
    if (txn.transactionDate.isBefore(startOfMonth)) continue;
    if (txn.transactionDate.isAfter(now)) continue;

    final day = txn.transactionDate.day;
    dayTotals[day] = (dayTotals[day] ?? 0) + txn.amount;
  }

  return dayTotals.entries
      .map(
        (e) => DailySpendingEntry(
          date: DateTime(now.year, now.month, e.key),
          amount: e.value,
        ),
      )
      .toList()
    ..sort((a, b) => a.date.compareTo(b.date));
}

/// Compares total expense spending of the current week (Mon-Sun) with the
/// previous week.
@riverpod
Future<WeeklyComparison> weeklyComparison(
  WeeklyComparisonRef ref,
) async {
  final transactions = await ref.watch(allTransactionsProvider.future);

  final now = DateTime.now();
  // Monday of the current week.
  final thisMonday = now.subtract(Duration(days: now.weekday - 1));
  final thisWeekStart =
      DateTime(thisMonday.year, thisMonday.month, thisMonday.day);
  final lastWeekStart = thisWeekStart.subtract(const Duration(days: 7));

  double thisWeek = 0;
  double lastWeek = 0;

  for (final txn in transactions) {
    if (txn.isDeleted) continue;
    if (txn.type != TransactionType.expense) continue;

    final date = txn.transactionDate;

    if (!date.isBefore(thisWeekStart) && !date.isAfter(now)) {
      thisWeek += txn.amount;
    } else if (!date.isBefore(lastWeekStart) && date.isBefore(thisWeekStart)) {
      lastWeek += txn.amount;
    }
  }

  return WeeklyComparison(
    thisWeekSpending: thisWeek,
    lastWeekSpending: lastWeek,
  );
}
