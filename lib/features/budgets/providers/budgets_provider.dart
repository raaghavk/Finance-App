import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';

import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/budget_progress.dart';
import 'package:paisa_track/domain/models/transaction.dart';

part 'budgets_provider.g.dart';

const _uuid = Uuid();

/// Manages the list of user-created budgets.
@riverpod
class BudgetsNotifier extends _$BudgetsNotifier {
  @override
  AsyncValue<List<Budget>> build() {
    // Load budgets on initialization.
    loadBudgets();
    return const AsyncValue.loading();
  }

  /// Fetches all active (non-deleted) budgets from local storage.
  Future<void> loadBudgets() async {
    state = const AsyncValue.loading();
    try {
      // TODO: Replace with actual DAO / repository call.
      await Future<void>.delayed(const Duration(milliseconds: 300));
      state = const AsyncValue.data([]);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Creates a new budget and appends it to the list.
  Future<void> addBudget({
    required String name,
    required double limitAmount,
    required BudgetPeriod period,
    required DateTime startDate,
    DateTime? endDate,
    required List<String> categoryIds,
  }) async {
    final now = DateTime.now();
    final budget = Budget(
      id: _uuid.v4(),
      name: name,
      limitAmount: limitAmount,
      period: period,
      startDate: startDate,
      endDate: endDate,
      categoryIds: categoryIds,
      syncStatus: SyncStatus.pending,
      createdAt: now,
      updatedAt: now,
    );

    final current = state.valueOrNull ?? [];
    state = AsyncValue.data([...current, budget]);

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Budget added: ${budget.id}');
    } catch (error, stackTrace) {
      // Rollback on failure.
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Updates an existing budget by [id].
  Future<void> updateBudget(Budget updated) async {
    final current = state.valueOrNull ?? [];
    final index = current.indexWhere((b) => b.id == updated.id);
    if (index == -1) return;

    final patched = updated.copyWith(
      updatedAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );
    final next = [...current];
    next[index] = patched;
    state = AsyncValue.data(next);

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Budget updated: ${patched.id}');
    } catch (error, stackTrace) {
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Soft-deletes a budget by [id].
  Future<void> deleteBudget(String id) async {
    final current = state.valueOrNull ?? [];
    final index = current.indexWhere((b) => b.id == id);
    if (index == -1) return;

    final next = [...current];
    next[index] = next[index].copyWith(
      isDeleted: true,
      updatedAt: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );
    state = AsyncValue.data(next.where((b) => !b.isDeleted).toList());

    try {
      // TODO: Persist via DAO / repository.
      debugPrint('Budget deleted: $id');
    } catch (error, stackTrace) {
      state = AsyncValue.data(current);
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

/// Provides a list of [BudgetProgress] items with spent / remaining
/// calculated from the user's transactions.
@riverpod
Future<List<BudgetProgress>> budgetProgressList(BudgetProgressListRef ref) async {
  final budgetsAsync = ref.watch(budgetsNotifierProvider);
  final budgets = budgetsAsync.valueOrNull ?? [];

  if (budgets.isEmpty) return [];

  // TODO: Replace with actual transaction repository query.
  final List<Transaction> transactions = [];

  final now = DateTime.now();

  return budgets.where((b) => b.isActive && !b.isDeleted).map((budget) {
    final cycleStart = _cycleStart(budget, now);
    final cycleEnd = _cycleEnd(budget, cycleStart);

    final spent = transactions
        .where((t) =>
            t.type == TransactionType.expense &&
            budget.categoryIds.contains(t.categoryId) &&
            !t.transactionDate.isBefore(cycleStart) &&
            t.transactionDate.isBefore(cycleEnd))
        .fold<double>(0, (sum, t) => sum + t.amount);

    final remaining = budget.limitAmount - spent;
    final percentage =
        budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0.0;

    return BudgetProgress(
      budget: budget,
      spent: spent,
      remaining: remaining,
      percentage: percentage,
      isOverBudget: spent > budget.limitAmount,
    );
  }).toList();
}

/// Returns the start of the current budget cycle based on the period.
DateTime _cycleStart(Budget budget, DateTime now) {
  switch (budget.period) {
    case BudgetPeriod.weekly:
      return now.subtract(Duration(days: now.weekday - 1));
    case BudgetPeriod.monthly:
      return DateTime(now.year, now.month, budget.startDate.day);
    case BudgetPeriod.yearly:
      return DateTime(now.year, budget.startDate.month, budget.startDate.day);
    case BudgetPeriod.custom:
      return budget.startDate;
  }
}

/// Returns the end of the current budget cycle.
DateTime _cycleEnd(Budget budget, DateTime cycleStart) {
  switch (budget.period) {
    case BudgetPeriod.weekly:
      return cycleStart.add(const Duration(days: 7));
    case BudgetPeriod.monthly:
      return DateTime(cycleStart.year, cycleStart.month + 1, cycleStart.day);
    case BudgetPeriod.yearly:
      return DateTime(cycleStart.year + 1, cycleStart.month, cycleStart.day);
    case BudgetPeriod.custom:
      return budget.endDate ?? cycleStart.add(const Duration(days: 30));
  }
}
