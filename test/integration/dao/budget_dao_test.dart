// These tests require `dart run build_runner build` to generate Drift types.
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/daos/budget_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';

void main() {
  late AppDatabase db;
  late BudgetDao dao;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    dao = db.budgetDao;
  });

  tearDown(() async {
    await db.close();
  });

  Future<void> seedCategory() async {
    await db.into(db.categoriesTable).insert(CategoriesTableCompanion.insert(
          id: const Value('cat_groceries'),
          name: 'Groceries',
          nameHi: 'किराना',
          icon: 'shopping_cart',
          color: 0xFF4CAF50,
          type: const Value(TransactionType.expense),
          isDefault: const Value(true),
        ));
  }

  Future<void> seedAccount() async {
    await db.into(db.accountsTable).insert(AccountsTableCompanion.insert(
          id: const Value('acc_cash'),
          name: 'Cash',
          type: 'cash',
        ));
  }

  BudgetsTableCompanion makeBudgetEntry({
    required String id,
    String name = 'Test Budget',
    double limitAmount = 5000,
    bool isActive = true,
    bool isDeleted = false,
  }) {
    final now = DateTime.now();
    return BudgetsTableCompanion(
      id: Value(id),
      name: Value(name),
      limitAmount: Value(limitAmount),
      period: const Value('monthly'),
      startDate: Value(DateTime(now.year, now.month, 1)),
      mode: const Value('manual'),
      isActive: Value(isActive),
      isDeleted: Value(isDeleted),
      createdAt: Value(now),
      updatedAt: Value(now),
    );
  }

  group('CRUD', () {
    test('insertBudget and getBudgetById returns the row', () async {
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));

      final row = await dao.getBudgetById('b_001');
      expect(row, isNotNull);
      expect(row!.id, 'b_001');
      expect(row.limitAmount, 5000);
    });

    test('softDeleteBudget marks as deleted', () async {
      await dao.insertBudget(makeBudgetEntry(id: 'b_002'));
      await dao.softDeleteBudget('b_002');

      final row = await dao.getBudgetById('b_002');
      expect(row!.isDeleted, isTrue);
    });
  });

  group('watchActiveBudgets', () {
    test('returns only active, non-deleted budgets', () async {
      await dao.insertBudget(makeBudgetEntry(id: 'b_active'));
      await dao.insertBudget(
          makeBudgetEntry(id: 'b_inactive', isActive: false));
      await dao.insertBudget(
          makeBudgetEntry(id: 'b_deleted', isDeleted: true));

      final result = await dao.watchActiveBudgets().first;
      expect(result, hasLength(1));
      expect(result.first.id, 'b_active');
    });
  });

  group('category linking', () {
    test('addCategoryToBudget and getBudgetWithCategories works', () async {
      await seedCategory();
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));
      await dao.addCategoryToBudget('b_001', 'cat_groceries');

      final result = await dao.getBudgetWithCategories('b_001');
      expect(result, isNotNull);
      expect(result!.categories, hasLength(1));
      expect(result.categories.first.id, 'cat_groceries');
    });

    test('removeCategoryFromBudget removes the link', () async {
      await seedCategory();
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));
      await dao.addCategoryToBudget('b_001', 'cat_groceries');
      await dao.removeCategoryFromBudget('b_001', 'cat_groceries');

      final result = await dao.getBudgetWithCategories('b_001');
      expect(result!.categories, isEmpty);
    });
  });

  group('getBudgetSpending', () {
    test('sums expense transactions for linked categories', () async {
      await seedCategory();
      await seedAccount();
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));
      await dao.addCategoryToBudget('b_001', 'cat_groceries');

      // Add expense transactions
      final now = DateTime.now();
      final txDao = db.transactionDao;
      await txDao.insertTransaction(TransactionsTableCompanion(
        id: const Value('txn_1'),
        amount: const Value(200),
        type: const Value(1), // expense
        categoryId: const Value('cat_groceries'),
        accountId: const Value('acc_cash'),
        transactionDate: Value(now),
        createdAt: Value(now),
        updatedAt: Value(now),
      ));
      await txDao.insertTransaction(TransactionsTableCompanion(
        id: const Value('txn_2'),
        amount: const Value(300),
        type: const Value(1), // expense
        categoryId: const Value('cat_groceries'),
        accountId: const Value('acc_cash'),
        transactionDate: Value(now),
        createdAt: Value(now),
        updatedAt: Value(now),
      ));

      final spending = await dao.getBudgetSpending(
        'b_001',
        DateTime(now.year, now.month, 1),
        DateTime(now.year, now.month + 1, 0, 23, 59, 59),
      );
      expect(spending, 500.0);
    });

    test('returns 0.0 when no linked categories', () async {
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));

      final spending = await dao.getBudgetSpending(
        'b_001',
        DateTime(2025, 3, 1),
        DateTime(2025, 3, 31),
      );
      expect(spending, 0.0);
    });

    test('ignores income transactions', () async {
      await seedCategory();
      await seedAccount();
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));
      await dao.addCategoryToBudget('b_001', 'cat_groceries');

      final now = DateTime.now();
      await db.transactionDao.insertTransaction(TransactionsTableCompanion(
        id: const Value('txn_income'),
        amount: const Value(1000),
        type: const Value(0), // income
        categoryId: const Value('cat_groceries'),
        accountId: const Value('acc_cash'),
        transactionDate: Value(now),
        createdAt: Value(now),
        updatedAt: Value(now),
      ));

      final spending = await dao.getBudgetSpending(
        'b_001',
        DateTime(now.year, now.month, 1),
        DateTime(now.year, now.month + 1, 0, 23, 59, 59),
      );
      expect(spending, 0.0);
    });

    test('ignores deleted transactions', () async {
      await seedCategory();
      await seedAccount();
      await dao.insertBudget(makeBudgetEntry(id: 'b_001'));
      await dao.addCategoryToBudget('b_001', 'cat_groceries');

      final now = DateTime.now();
      await db.transactionDao.insertTransaction(TransactionsTableCompanion(
        id: const Value('txn_deleted'),
        amount: const Value(500),
        type: const Value(1), // expense
        categoryId: const Value('cat_groceries'),
        accountId: const Value('acc_cash'),
        transactionDate: Value(now),
        isDeleted: const Value(true),
        createdAt: Value(now),
        updatedAt: Value(now),
      ));

      final spending = await dao.getBudgetSpending(
        'b_001',
        DateTime(now.year, now.month, 1),
        DateTime(now.year, now.month + 1, 0, 23, 59, 59),
      );
      expect(spending, 0.0);
    });
  });
}
