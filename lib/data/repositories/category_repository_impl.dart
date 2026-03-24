import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/daos/category_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';
import 'package:paisa_track/domain/models/category.dart' as domain;
import 'package:paisa_track/domain/repositories/category_repository.dart';

/// Drift-backed implementation of [CategoryRepository].
class CategoryRepositoryImpl implements CategoryRepository {
  CategoryRepositoryImpl(this._dao);

  final CategoryDao _dao;

  // ── Mapping helpers ──────────────────────────────────────────────────

  domain.Category _toDomain(CategoriesTableData row) {
    return domain.Category(
      id: row.id,
      name: row.name,
      nameHi: row.nameHi,
      icon: row.icon,
      color: row.color,
      parentId: row.parentId,
      type: TransactionType.values[row.type],
      isDefault: row.isDefault,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
    );
  }

  CategoriesTableCompanion _toCompanion(domain.Category c) {
    return CategoriesTableCompanion(
      id: Value(c.id),
      name: Value(c.name),
      nameHi: Value(c.nameHi),
      icon: Value(c.icon),
      color: Value(c.color),
      parentId: Value(c.parentId),
      type: Value(c.type.index),
      isDefault: Value(c.isDefault),
      isActive: Value(c.isActive),
      sortOrder: Value(c.sortOrder),
      createdAt: Value(c.createdAt),
    );
  }

  // ── Streams ──────────────────────────────────────────────────────────

  @override
  Stream<List<domain.Category>> watchActive() {
    return _dao
        .watchActiveCategories()
        .map((rows) => rows.map(_toDomain).toList());
  }

  @override
  Stream<List<domain.Category>> watchByType(TransactionType type) {
    return _dao
        .watchCategoriesByType(type)
        .map((rows) => rows.map(_toDomain).toList());
  }

  // ── Reads ────────────────────────────────────────────────────────────

  @override
  Future<List<domain.Category>> getDefaults() async {
    final rows = await _dao.getDefaultCategories();
    return rows.map(_toDomain).toList();
  }

  // ── Mutations ────────────────────────────────────────────────────────

  @override
  Future<void> add(domain.Category category) {
    return _dao.insertCategory(_toCompanion(category));
  }

  @override
  Future<void> update(domain.Category category) {
    return _dao.updateCategory(_toCompanion(category));
  }

  @override
  Future<void> delete(String id) async {
    // Built-in categories are deactivated instead of hard-deleted.
    final row = await _dao.getCategoryById(id);
    if (row == null) return;

    if (row.isDefault) {
      await _dao.updateCategory(
        CategoriesTableCompanion(
          id: Value(id),
          isActive: const Value(false),
        ),
      );
    } else {
      await _dao.deleteCategory(id);
    }
  }
}
