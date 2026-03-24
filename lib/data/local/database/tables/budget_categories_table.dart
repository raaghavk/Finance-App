import 'package:drift/drift.dart';
import 'package:paisa_track/data/local/database/tables/budgets_table.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';

/// Join table linking budgets to the categories they track.
class BudgetCategoriesTable extends Table {
  @override
  String get tableName => 'budget_categories';

  /// Foreign key → [BudgetsTable.id].
  TextColumn get budgetId =>
      text().references(BudgetsTable, #id)();

  /// Foreign key → [CategoriesTable.id].
  TextColumn get categoryId =>
      text().references(CategoriesTable, #id)();

  @override
  Set<Column> get primaryKey => {budgetId, categoryId};
}
