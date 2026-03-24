import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/budget_mode.dart';
import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/data/local/daos/budget_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/budgets_table.dart';
import 'package:paisa_track/domain/models/budget.dart' as domain;
import 'package:paisa_track/domain/models/budget_progress.dart';
import 'package:paisa_track/domain/repositories/budget_repository.dart';

/// Drift-backed implementation of [BudgetRepository].
class BudgetRepositoryImpl implements BudgetRepository {
  BudgetRepositoryImpl({
    required BudgetDao budgetDao,
  }) : _budgetDao = budgetDao;

  final BudgetDao _budgetDao;

  // ── Mapping helpers ──────────────────────────────────────────────────

  static BudgetPeriod _parsePeriod(String value) {
    return BudgetPeriod.values.firstWhere(
      (e) => e.name == value,
      orElse: () => BudgetPeriod.monthly,
    );
  }

  static BudgetMode _parseMode(String value) {
    return BudgetMode.values.firstWhere(
      (e) => e.name == value,
      orElse: () => BudgetMode.manual,
    );
  }

  domain.Budget _toDomain(
    BudgetsTableData row, {
    List<String> categoryIds = const [],
  }) {
    return domain.Budget(
      id: row.id,
      name: row.name,
      limitAmount: row.limitAmount,
      period: _parsePeriod(row.period),
      startDate: row.startDate,
      endDate: row.endDate,
      mode: _parseMode(row.mode),
      isActive: row.isActive,
      categoryIds: categoryIds,
      syncStatus: SyncStatus.values[row.syncStatus],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isDeleted: row.isDeleted,
    );
  }

  BudgetsTableCompanion _toCompanion(domain.Budget b) {
    return BudgetsTableCompanion(
      id: Value(b.id),
      name: Value(b.name),
      limitAmount: Value(b.limitAmount),
      period: Value(b.period.name),
      startDate: Value(b.startDate),
      endDate: Value(b.endDate),
      mode: Value(b.mode.name),
      isActive: Value(b.isActive),
      syncStatus: Value(b.syncStatus.index),
      createdAt: Value(b.createdAt),
      updatedAt: Value(b.updatedAt),
      isDeleted: Value(b.isDeleted),
    );
  }

  // ── Streams ──────────────────────────────────────────────────────────

  @override
  Stream<List<domain.Budget>> watchActive() {
    return _budgetDao.watchActiveBudgets().asyncMap((rows) async {
      final budgets = <domain.Budget>[];
      for (final row in rows) {
        final withCats = await _budgetDao.getBudgetWithCategories(row.id);
        final catIds =
            withCats?.categories.map((c) => c.id).toList() ?? const [];
        budgets.add(_toDomain(row, categoryIds: catIds));
      }
      return budgets;
    });
  }

  // ── Single reads ─────────────────────────────────────────────────────

  @override
  Future<domain.Budget?> getById(String id) async {
    final withCats = await _budgetDao.getBudgetWithCategories(id);
    if (withCats == null) return null;

    final catIds = withCats.categories.map((c) => c.id).toList();
    return _toDomain(withCats.budget, categoryIds: catIds);
  }

  // ── Progress ─────────────────────────────────────────────────────────

  @override
  Future<BudgetProgress> getProgress(String budgetId) async {
    final budget = await getById(budgetId);
    if (budget == null) {
      throw StateError('Budget with id $budgetId not found');
    }

    final start = budget.startDate;
    final end = budget.endDate ?? _computePeriodEnd(budget);

    final spent = await _budgetDao.getBudgetSpending(budgetId, start, end);
    final remaining = budget.limitAmount - spent;
    final percentage =
        budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100.0 : 0.0;

    return BudgetProgress(
      budget: budget,
      spent: spent,
      remaining: remaining,
      percentage: percentage,
      isOverBudget: spent > budget.limitAmount,
    );
  }

  /// Compute the end of the current budget period when no explicit end date
  /// is stored.
  DateTime _computePeriodEnd(domain.Budget budget) {
    final start = budget.startDate;
    switch (budget.period) {
      case BudgetPeriod.weekly:
        return start.add(const Duration(days: 7));
      case BudgetPeriod.monthly:
        return DateTime(start.year, start.month + 1, start.day);
      case BudgetPeriod.yearly:
        return DateTime(start.year + 1, start.month, start.day);
      case BudgetPeriod.custom:
        // Fall back to end of current month for custom periods without end date.
        return DateTime(start.year, start.month + 1, 0, 23, 59, 59);
    }
  }

  // ── Mutations ────────────────────────────────────────────────────────

  @override
  Future<void> add(domain.Budget budget) async {
    await _budgetDao.insertBudget(_toCompanion(budget));
    // Link categories.
    for (final catId in budget.categoryIds) {
      await _budgetDao.addCategoryToBudget(budget.id, catId);
    }
  }

  @override
  Future<void> update(domain.Budget budget) async {
    await _budgetDao.updateBudget(_toCompanion(budget));

    // Reconcile category links: remove old, add new.
    final existing = await _budgetDao.getBudgetWithCategories(budget.id);
    final oldIds =
        existing?.categories.map((c) => c.id).toSet() ?? <String>{};
    final newIds = budget.categoryIds.toSet();

    for (final removed in oldIds.difference(newIds)) {
      await _budgetDao.removeCategoryFromBudget(budget.id, removed);
    }
    for (final added in newIds.difference(oldIds)) {
      await _budgetDao.addCategoryToBudget(budget.id, added);
    }
  }

  @override
  Future<void> delete(String id) {
    return _budgetDao.softDeleteBudget(id);
  }
}
