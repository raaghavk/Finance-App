import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/budget_progress.dart';
import 'package:paisa_track/domain/models/transaction.dart';

part 'dashboard_provider.g.dart';

// ---------------------------------------------------------------------------
// DashboardSummary value object
// ---------------------------------------------------------------------------

/// Aggregated financial snapshot for the current month.
@immutable
class DashboardSummary {
  const DashboardSummary({
    required this.totalBalance,
    required this.monthlyIncome,
    required this.monthlyExpense,
  });

  /// Net balance across all accounts.
  final double totalBalance;

  /// Total income received this month.
  final double monthlyIncome;

  /// Total expenses incurred this month.
  final double monthlyExpense;

  /// Savings = income - expense for the current month.
  double get monthlySavings => monthlyIncome - monthlyExpense;

  /// Savings as a fraction of income (0.0 – 1.0). Returns 0 when income is 0.
  double get savingsRate =>
      monthlyIncome == 0 ? 0.0 : monthlySavings / monthlyIncome;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DashboardSummary &&
          runtimeType == other.runtimeType &&
          totalBalance == other.totalBalance &&
          monthlyIncome == other.monthlyIncome &&
          monthlyExpense == other.monthlyExpense;

  @override
  int get hashCode => Object.hash(totalBalance, monthlyIncome, monthlyExpense);
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

/// Placeholder provider that should be overridden with the actual
/// transaction-repository implementation.  Returns all non-deleted
/// transactions.
@riverpod
Future<List<Transaction>> allTransactions(AllTransactionsRef ref) async {
  // TODO: Replace with actual repository call, e.g.:
  // final repo = ref.watch(transactionRepositoryProvider);
  // return repo.getAllTransactions();
  return <Transaction>[];
}

/// Placeholder provider that should be overridden with the actual
/// budget-progress repository implementation.
@riverpod
Future<List<BudgetProgress>> allBudgetProgress(
  AllBudgetProgressRef ref,
) async {
  // TODO: Replace with actual repository call, e.g.:
  // final repo = ref.watch(budgetRepositoryProvider);
  // return repo.getActiveBudgetProgress();
  return <BudgetProgress>[];
}

/// Provides a [DashboardSummary] by aggregating data from the transaction
/// repository for the current calendar month.
@riverpod
Future<DashboardSummary> dashboardSummary(DashboardSummaryRef ref) async {
  final transactions = await ref.watch(allTransactionsProvider.future);

  final now = DateTime.now();
  final startOfMonth = DateTime(now.year, now.month);

  double totalBalance = 0;
  double monthlyIncome = 0;
  double monthlyExpense = 0;

  for (final txn in transactions) {
    if (txn.isDeleted) continue;

    // Accumulate total balance across all time.
    switch (txn.type) {
      case TransactionType.income:
        totalBalance += txn.amount;
      case TransactionType.expense:
        totalBalance -= txn.amount;
      case TransactionType.transfer:
        break; // transfers are zero-sum
    }

    // Accumulate this month's figures.
    if (!txn.transactionDate.isBefore(startOfMonth)) {
      switch (txn.type) {
        case TransactionType.income:
          monthlyIncome += txn.amount;
        case TransactionType.expense:
          monthlyExpense += txn.amount;
        case TransactionType.transfer:
          break;
      }
    }
  }

  return DashboardSummary(
    totalBalance: totalBalance,
    monthlyIncome: monthlyIncome,
    monthlyExpense: monthlyExpense,
  );
}

/// Provides the 5 most recent non-deleted transactions, sorted newest-first.
@riverpod
Future<List<Transaction>> recentTransactions(
  RecentTransactionsRef ref,
) async {
  final transactions = await ref.watch(allTransactionsProvider.future);

  final active = transactions.where((t) => !t.isDeleted).toList()
    ..sort((a, b) => b.transactionDate.compareTo(a.transactionDate));

  return active.take(5).toList();
}

/// Provides budget progress entries for all currently active budgets.
@riverpod
Future<List<BudgetProgress>> activeBudgetProgress(
  ActiveBudgetProgressRef ref,
) async {
  final progress = await ref.watch(allBudgetProgressProvider.future);
  return progress.where((bp) => bp.budget.isActive).toList();
}
