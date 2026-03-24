import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/budget_categories_table.dart';
import 'package:paisa_track/data/local/database/tables/budgets_table.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';
import 'package:paisa_track/data/local/database/tables/transactions_table.dart';

part 'budget_dao.g.dart';

@DriftAccessor(tables: [
  BudgetsTable,
  BudgetCategoriesTable,
  CategoriesTable,
  TransactionsTable,
])
class BudgetDao extends DatabaseAccessor<AppDatabase>
    with _$BudgetDaoMixin {
  BudgetDao(super.db);

  // ── Streams ───────────────────────────────────────────────────────────

  /// Watch all active, non-deleted budgets.
  Stream<List<BudgetsTableData>> watchActiveBudgets() {
    return (select(budgetsTable)
          ..where(
              (b) => b.isActive.equals(true) & b.isDeleted.equals(false)))
        .watch();
  }

  // ── Reads ─────────────────────────────────────────────────────────────

  /// Fetch a budget by [id].
  Future<BudgetsTableData?> getBudgetById(String id) {
    return (select(budgetsTable)..where((b) => b.id.equals(id)))
        .getSingleOrNull();
  }

  /// Return a budget together with the categories it tracks.
  Future<BudgetWithCategories?> getBudgetWithCategories(String id) async {
    final budget = await getBudgetById(id);
    if (budget == null) return null;

    final query = select(budgetCategoriesTable).join([
      innerJoin(
        categoriesTable,
        categoriesTable.id.equalsExp(budgetCategoriesTable.categoryId),
      ),
    ])
      ..where(budgetCategoriesTable.budgetId.equals(id));

    final rows = await query.get();
    final categories = rows
        .map((row) => row.readTable(categoriesTable))
        .toList();

    return BudgetWithCategories(budget: budget, categories: categories);
  }

  /// Calculate total spending against a budget for the given period.
  ///
  /// Sums expense transactions whose category is linked to the budget
  /// and whose date falls within [start] – [end].
  Future<double> getBudgetSpending(
    String budgetId,
    DateTime start,
    DateTime end,
  ) async {
    // Get category ids linked to this budget.
    final catRows = await (select(budgetCategoriesTable)
          ..where((bc) => bc.budgetId.equals(budgetId)))
        .get();
    final categoryIds = catRows.map((r) => r.categoryId).toList();

    if (categoryIds.isEmpty) return 0.0;

    final sumExpr = transactionsTable.amount.sum();
    final query = selectOnly(transactionsTable)
      ..addColumns([sumExpr])
      ..where(transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(TransactionType.expense) &
          transactionsTable.categoryId.isIn(categoryIds) &
          transactionsTable.transactionDate.isBiggerOrEqualValue(start) &
          transactionsTable.transactionDate.isSmallerOrEqualValue(end));

    final row = await query.getSingle();
    return row.read(sumExpr) ?? 0.0;
  }

  // ── Mutations ─────────────────────────────────────────────────────────

  /// Insert a new budget.
  Future<void> insertBudget(BudgetsTableCompanion entry) {
    return into(budgetsTable).insert(entry);
  }

  /// Update an existing budget.
  Future<void> updateBudget(BudgetsTableCompanion entry) {
    return (update(budgetsTable)
          ..where((b) => b.id.equals(entry.id.value)))
        .write(entry);
  }

  /// Soft-delete a budget and flag for sync.
  Future<void> softDeleteBudget(String id) {
    return (update(budgetsTable)..where((b) => b.id.equals(id))).write(
      BudgetsTableCompanion(
        isDeleted: const Value(true),
        syncStatus: Value(SyncStatus.pending.index),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }

  /// Link a category to a budget.
  Future<void> addCategoryToBudget(String budgetId, String categoryId) {
    return into(budgetCategoriesTable).insert(
      BudgetCategoriesTableCompanion(
        budgetId: Value(budgetId),
        categoryId: Value(categoryId),
      ),
    );
  }

  /// Remove a category from a budget.
  Future<void> removeCategoryFromBudget(
    String budgetId,
    String categoryId,
  ) {
    return (delete(budgetCategoriesTable)
          ..where((bc) =>
              bc.budgetId.equals(budgetId) &
              bc.categoryId.equals(categoryId)))
        .go();
  }
}

/// A budget paired with its tracked categories.
class BudgetWithCategories {
  BudgetWithCategories({required this.budget, required this.categories});

  final BudgetsTableData budget;
  final List<CategoriesTableData> categories;
}
