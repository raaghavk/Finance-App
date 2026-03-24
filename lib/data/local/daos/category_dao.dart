import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';

part 'category_dao.g.dart';

@DriftAccessor(tables: [CategoriesTable])
class CategoryDao extends DatabaseAccessor<AppDatabase>
    with _$CategoryDaoMixin {
  CategoryDao(super.db);

  // ── Streams ───────────────────────────────────────────────────────────

  /// Watch all active categories ordered by [sortOrder].
  Stream<List<CategoriesTableData>> watchActiveCategories() {
    return (select(categoriesTable)
          ..where((c) => c.isActive.equals(true))
          ..orderBy([(c) => OrderingTerm.asc(c.sortOrder)]))
        .watch();
  }

  /// Watch active categories filtered by [type].
  Stream<List<CategoriesTableData>> watchCategoriesByType(
    TransactionType type,
  ) {
    return (select(categoriesTable)
          ..where((c) =>
              c.isActive.equals(true) &
              c.type.equalsValue(type))
          ..orderBy([(c) => OrderingTerm.asc(c.sortOrder)]))
        .watch();
  }

  // ── Reads ─────────────────────────────────────────────────────────────

  /// Return all built-in default categories.
  Future<List<CategoriesTableData>> getDefaultCategories() {
    return (select(categoriesTable)
          ..where((c) => c.isDefault.equals(true))
          ..orderBy([(c) => OrderingTerm.asc(c.sortOrder)]))
        .get();
  }

  /// Fetch a single category by [id].
  Future<CategoriesTableData?> getCategoryById(String id) {
    return (select(categoriesTable)..where((c) => c.id.equals(id)))
        .getSingleOrNull();
  }

  // ── Mutations ─────────────────────────────────────────────────────────

  /// Insert a new category.
  Future<void> insertCategory(CategoriesTableCompanion entry) {
    return into(categoriesTable).insert(entry);
  }

  /// Update an existing category.
  Future<void> updateCategory(CategoriesTableCompanion entry) {
    return (update(categoriesTable)
          ..where((c) => c.id.equals(entry.id.value)))
        .write(entry);
  }

  /// Delete a category by [id]. Prefer deactivating over hard-deleting.
  Future<void> deleteCategory(String id) {
    return (delete(categoriesTable)..where((c) => c.id.equals(id))).go();
  }
}
