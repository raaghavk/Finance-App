import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/transaction.dart';

part 'transactions_provider.g.dart';

// ---------------------------------------------------------------------------
// Filter state
// ---------------------------------------------------------------------------

/// Holds the current filter / search criteria for the transaction list.
@immutable
class TransactionFilter {
  const TransactionFilter({
    this.query = '',
    this.type,
    this.categoryId,
    this.startDate,
    this.endDate,
    this.minAmount,
    this.maxAmount,
    this.categoryIds = const {},
  });

  final String query;
  final TransactionType? type;
  final String? categoryId;
  final DateTime? startDate;
  final DateTime? endDate;
  final double? minAmount;
  final double? maxAmount;
  final Set<String> categoryIds;

  TransactionFilter copyWith({
    String? query,
    TransactionType? Function()? type,
    String? Function()? categoryId,
    DateTime? Function()? startDate,
    DateTime? Function()? endDate,
    double? Function()? minAmount,
    double? Function()? maxAmount,
    Set<String>? categoryIds,
  }) {
    return TransactionFilter(
      query: query ?? this.query,
      type: type != null ? type() : this.type,
      categoryId: categoryId != null ? categoryId() : this.categoryId,
      startDate: startDate != null ? startDate() : this.startDate,
      endDate: endDate != null ? endDate() : this.endDate,
      minAmount: minAmount != null ? minAmount() : this.minAmount,
      maxAmount: maxAmount != null ? maxAmount() : this.maxAmount,
      categoryIds: categoryIds ?? this.categoryIds,
    );
  }
}

// ---------------------------------------------------------------------------
// TransactionsNotifier – manages the full list of transactions
// ---------------------------------------------------------------------------

@riverpod
class TransactionsNotifier extends _$TransactionsNotifier {
  @override
  AsyncValue<List<Transaction>> build() {
    // Kick off initial load.
    loadTransactions();
    return const AsyncValue.loading();
  }

  /// Load all non-deleted transactions, sorted by date descending.
  Future<void> loadTransactions() async {
    state = const AsyncValue.loading();
    try {
      // TODO: Replace with actual repository call once available.
      // final repo = ref.read(transactionRepositoryProvider);
      // final transactions = await repo.getAll();
      final List<Transaction> transactions = [];
      state = AsyncValue.data(transactions);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Load transactions within a date range.
  Future<void> loadByDateRange(DateTime start, DateTime end) async {
    state = const AsyncValue.loading();
    try {
      // TODO: Replace with actual repository call.
      // final repo = ref.read(transactionRepositoryProvider);
      // final transactions = await repo.getByDateRange(start, end);
      final all = state.valueOrNull ?? [];
      final filtered = all.where((t) {
        return !t.transactionDate.isBefore(start) &&
            !t.transactionDate.isAfter(end);
      }).toList();
      state = AsyncValue.data(filtered);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Load transactions for a specific category.
  Future<void> loadByCategory(String categoryId) async {
    state = const AsyncValue.loading();
    try {
      // TODO: Replace with actual repository call.
      // final repo = ref.read(transactionRepositoryProvider);
      // final transactions = await repo.getByCategory(categoryId);
      final all = state.valueOrNull ?? [];
      final filtered = all.where((t) => t.categoryId == categoryId).toList();
      state = AsyncValue.data(filtered);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Free-text search across notes and category names.
  Future<void> search(String query) async {
    state = const AsyncValue.loading();
    try {
      // TODO: Replace with actual repository call.
      // final repo = ref.read(transactionRepositoryProvider);
      // final results = await repo.search(query);
      final all = state.valueOrNull ?? [];
      final lowerQuery = query.toLowerCase();
      final results = all
          .where(
              (t) => t.note.toLowerCase().contains(lowerQuery) || !t.isDeleted)
          .toList();
      state = AsyncValue.data(results);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Delete a transaction by id (soft-delete).
  Future<bool> deleteTransaction(String id) async {
    try {
      // TODO: Replace with actual repository call.
      // final repo = ref.read(transactionRepositoryProvider);
      // await repo.delete(id);
      final current = state.valueOrNull ?? [];
      state =
          AsyncValue.data(current.where((t) => t.id != id).toList());
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Transaction filter state provider
// ---------------------------------------------------------------------------

@riverpod
class TransactionFilterNotifier extends _$TransactionFilterNotifier {
  @override
  TransactionFilter build() => const TransactionFilter();

  void setQuery(String query) =>
      state = state.copyWith(query: query);

  void setType(TransactionType? type) =>
      state = state.copyWith(type: () => type);

  void setDateRange(DateTime? start, DateTime? end) => state = state.copyWith(
        startDate: () => start,
        endDate: () => end,
      );

  void setCategoryId(String? categoryId) =>
      state = state.copyWith(categoryId: () => categoryId);

  void setCategoryIds(Set<String> ids) =>
      state = state.copyWith(categoryIds: ids);

  void setAmountRange(double? min, double? max) => state = state.copyWith(
        minAmount: () => min,
        maxAmount: () => max,
      );

  void reset() => state = const TransactionFilter();
}

// ---------------------------------------------------------------------------
// Derived providers
// ---------------------------------------------------------------------------

/// Filtered & sorted transaction list based on current filter state.
@riverpod
AsyncValue<List<Transaction>> transactionsList(TransactionsListRef ref) {
  final filter = ref.watch(transactionFilterNotifierProvider);
  final asyncTransactions = ref.watch(transactionsNotifierProvider);

  return asyncTransactions.whenData((transactions) {
    var result = transactions.where((t) => !t.isDeleted).toList();

    // Type filter
    if (filter.type != null) {
      result = result.where((t) => t.type == filter.type).toList();
    }

    // Category filter (single)
    if (filter.categoryId != null) {
      result =
          result.where((t) => t.categoryId == filter.categoryId).toList();
    }

    // Category filter (multi)
    if (filter.categoryIds.isNotEmpty) {
      result = result
          .where((t) => filter.categoryIds.contains(t.categoryId))
          .toList();
    }

    // Date range filter
    if (filter.startDate != null) {
      result = result
          .where((t) => !t.transactionDate.isBefore(filter.startDate!))
          .toList();
    }
    if (filter.endDate != null) {
      result = result
          .where((t) => !t.transactionDate.isAfter(filter.endDate!))
          .toList();
    }

    // Amount range filter
    if (filter.minAmount != null) {
      result = result.where((t) => t.amount >= filter.minAmount!).toList();
    }
    if (filter.maxAmount != null) {
      result = result.where((t) => t.amount <= filter.maxAmount!).toList();
    }

    // Search query
    if (filter.query.isNotEmpty) {
      final lowerQuery = filter.query.toLowerCase();
      result = result
          .where((t) => t.note.toLowerCase().contains(lowerQuery))
          .toList();
    }

    // Sort by date descending
    result.sort((a, b) => b.transactionDate.compareTo(a.transactionDate));
    return result;
  });
}

/// Transactions grouped by date for the list view with sticky headers.
@riverpod
AsyncValue<Map<DateTime, List<Transaction>>> transactionsByDate(
    TransactionsByDateRef ref) {
  final asyncList = ref.watch(transactionsListProvider);
  return asyncList.whenData((transactions) {
    final Map<DateTime, List<Transaction>> grouped = {};
    for (final t in transactions) {
      final dateKey = DateTime(
        t.transactionDate.year,
        t.transactionDate.month,
        t.transactionDate.day,
      );
      grouped.putIfAbsent(dateKey, () => []).add(t);
    }
    return grouped;
  });
}

/// Summary of total income and expense for the current month.
@riverpod
AsyncValue<TransactionSummary> transactionSummary(
    TransactionSummaryRef ref) {
  final asyncTransactions = ref.watch(transactionsNotifierProvider);
  return asyncTransactions.whenData((transactions) {
    final now = DateTime.now();
    final monthStart = DateTime(now.year, now.month);
    final monthEnd = DateTime(now.year, now.month + 1);

    double totalIncome = 0;
    double totalExpense = 0;

    for (final t in transactions) {
      if (t.isDeleted) continue;
      if (t.transactionDate.isBefore(monthStart) ||
          !t.transactionDate.isBefore(monthEnd)) {
        continue;
      }
      if (t.type == TransactionType.income) {
        totalIncome += t.amount;
      } else if (t.type == TransactionType.expense) {
        totalExpense += t.amount;
      }
    }
    return TransactionSummary(
      totalIncome: totalIncome,
      totalExpense: totalExpense,
    );
  });
}

/// Simple data class holding monthly totals.
@immutable
class TransactionSummary {
  const TransactionSummary({
    required this.totalIncome,
    required this.totalExpense,
  });

  final double totalIncome;
  final double totalExpense;

  double get balance => totalIncome - totalExpense;
}
