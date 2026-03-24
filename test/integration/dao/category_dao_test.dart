// These tests require `dart run build_runner build` to generate Drift types.
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/daos/category_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';

void main() {
  late AppDatabase db;
  late CategoryDao dao;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    dao = db.categoryDao;
  });

  tearDown(() async {
    await db.close();
  });

  CategoriesTableCompanion makeCategory({
    required String id,
    String name = 'Test Category',
    String nameHi = 'परीक्षा',
    int type = 1, // expense
    bool isDefault = false,
    bool isActive = true,
    int sortOrder = 0,
  }) {
    return CategoriesTableCompanion(
      id: Value(id),
      name: Value(name),
      nameHi: Value(nameHi),
      icon: const Value('category'),
      color: const Value(0xFF000000),
      type: Value(type),
      isDefault: Value(isDefault),
      isActive: Value(isActive),
      sortOrder: Value(sortOrder),
    );
  }

  group('CRUD', () {
    test('insertCategory and getCategoryById returns it', () async {
      await dao.insertCategory(makeCategory(id: 'cat_001', name: 'Food'));

      final row = await dao.getCategoryById('cat_001');
      expect(row, isNotNull);
      expect(row!.name, 'Food');
    });

    test('deleteCategory hard-deletes the row', () async {
      await dao.insertCategory(makeCategory(id: 'cat_del'));
      await dao.deleteCategory('cat_del');

      final row = await dao.getCategoryById('cat_del');
      expect(row, isNull);
    });
  });

  group('watchActiveCategories', () {
    test('returns only active categories ordered by sortOrder', () async {
      await dao.insertCategory(
          makeCategory(id: 'cat_b', name: 'B', sortOrder: 2));
      await dao.insertCategory(
          makeCategory(id: 'cat_a', name: 'A', sortOrder: 1));
      await dao.insertCategory(
          makeCategory(id: 'cat_inactive', isActive: false));

      final result = await dao.watchActiveCategories().first;
      expect(result, hasLength(2));
      expect(result.first.id, 'cat_a'); // sortOrder 1
      expect(result.last.id, 'cat_b'); // sortOrder 2
    });
  });

  group('watchCategoriesByType', () {
    test('filters by expense type', () async {
      await dao.insertCategory(
          makeCategory(id: 'cat_exp', type: 1)); // expense
      await dao.insertCategory(
          makeCategory(id: 'cat_inc', type: 0)); // income

      final result =
          await dao.watchCategoriesByType(TransactionType.expense).first;
      expect(result, hasLength(1));
      expect(result.first.id, 'cat_exp');
    });

    test('filters by income type', () async {
      await dao.insertCategory(
          makeCategory(id: 'cat_exp', type: 1)); // expense
      await dao.insertCategory(
          makeCategory(id: 'cat_inc', type: 0)); // income

      final result =
          await dao.watchCategoriesByType(TransactionType.income).first;
      expect(result, hasLength(1));
      expect(result.first.id, 'cat_inc');
    });
  });

  group('getDefaultCategories', () {
    test('returns categories where isDefault=true', () async {
      await dao.insertCategory(
          makeCategory(id: 'cat_def', isDefault: true, name: 'Default'));
      await dao.insertCategory(
          makeCategory(id: 'cat_custom', isDefault: false, name: 'Custom'));

      final result = await dao.getDefaultCategories();
      expect(result, hasLength(1));
      expect(result.first.name, 'Default');
    });
  });
}
