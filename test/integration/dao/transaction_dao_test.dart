// These tests require `dart run build_runner build` to generate Drift types,
// and `sqlite3` on the system for NativeDatabase.memory().
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/daos/transaction_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';

void main() {
  late AppDatabase db;
  late TransactionDao dao;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    dao = db.transactionDao;
  });

  tearDown(() async {
    await db.close();
  });

  /// Inserts prerequisite category and account rows needed by FK constraints.
  Future<void> seedPrerequisites() async {
    await db.into(db.categoriesTable).insert(CategoriesTableCompanion.insert(
          id: const Value('cat_groceries'),
          name: 'Groceries',
          nameHi: 'किराना',
          icon: 'shopping_cart',
          color: 0xFF4CAF50,
          type: const Value(TransactionType.expense),
          isDefault: const Value(true),
        ));

    await db.into(db.accountsTable).insert(AccountsTableCompanion.insert(
          id: const Value('acc_cash'),
          name: 'Cash',
          type: 'cash',
        ));
  }

  TransactionsTableCompanion makeEntry({
    required String id,
    double amount = 100.0,
    int type = 1, // expense
    DateTime? transactionDate,
    String note = '',
    bool isDeleted = false,
  }) {
    final now = DateTime.now();
    return TransactionsTableCompanion(
      id: Value(id),
      amount: Value(amount),
      type: Value(type),
      categoryId: const Value('cat_groceries'),
      accountId: const Value('acc_cash'),
      transactionDate: Value(transactionDate ?? now),
      note: Value(note),
      isDeleted: Value(isDeleted),
      createdAt: Value(now),
      updatedAt: Value(now),
    );
  }

  group('CRUD operations', () {
    test('insertTransaction and getTransactionById returns the row', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(id: 'txn_001', amount: 500));

      final row = await dao.getTransactionById('txn_001');
      expect(row, isNotNull);
      expect(row!.id, 'txn_001');
      expect(row.amount, 500.0);
    });

    test('softDeleteTransaction sets isDeleted=true', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(id: 'txn_002'));
      await dao.softDeleteTransaction('txn_002');

      final row = await dao.getTransactionById('txn_002');
      expect(row!.isDeleted, isTrue);
    });

    test('getTransactionById returns null for non-existent id', () async {
      await seedPrerequisites();
      final row = await dao.getTransactionById('nonexistent');
      expect(row, isNull);
    });
  });

  group('watchAllTransactions', () {
    test('emits non-deleted transactions ordered by date desc', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(
        id: 'txn_old',
        transactionDate: DateTime(2025, 1, 1),
      ));
      await dao.insertTransaction(makeEntry(
        id: 'txn_new',
        transactionDate: DateTime(2025, 3, 1),
      ));

      final result = await dao.watchAllTransactions().first;
      expect(result, hasLength(2));
      // Newest first
      expect(result.first.id, 'txn_new');
      expect(result.last.id, 'txn_old');
    });

    test('does not include soft-deleted transactions', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(id: 'txn_active'));
      await dao.insertTransaction(makeEntry(id: 'txn_deleted', isDeleted: true));

      final result = await dao.watchAllTransactions().first;
      expect(result, hasLength(1));
      expect(result.first.id, 'txn_active');
    });
  });

  group('watchTransactionsByDateRange', () {
    test('filters to transactions within date range', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(
        id: 'txn_in',
        transactionDate: DateTime(2025, 3, 15),
      ));
      await dao.insertTransaction(makeEntry(
        id: 'txn_out',
        transactionDate: DateTime(2025, 1, 1),
      ));

      final result = await dao
          .watchTransactionsByDateRange(
            DateTime(2025, 3, 1),
            DateTime(2025, 3, 31),
          )
          .first;
      expect(result, hasLength(1));
      expect(result.first.id, 'txn_in');
    });
  });

  group('watchTransactionsByCategory', () {
    test('returns only transactions with matching categoryId', () async {
      await seedPrerequisites();
      // Add a second category
      await db.into(db.categoriesTable).insert(CategoriesTableCompanion.insert(
            id: const Value('cat_chai'),
            name: 'Chai',
            nameHi: 'चाय',
            icon: 'local_cafe',
            color: 0xFF795548,
            type: const Value(TransactionType.expense),
          ));

      await dao.insertTransaction(makeEntry(id: 'txn_grocery'));
      await dao.insertTransaction(TransactionsTableCompanion(
        id: const Value('txn_chai'),
        amount: const Value(50),
        type: const Value(1),
        categoryId: const Value('cat_chai'),
        accountId: const Value('acc_cash'),
        transactionDate: Value(DateTime.now()),
        createdAt: Value(DateTime.now()),
        updatedAt: Value(DateTime.now()),
      ));

      final result =
          await dao.watchTransactionsByCategory('cat_groceries').first;
      expect(result, hasLength(1));
      expect(result.first.id, 'txn_grocery');
    });
  });

  group('searchTransactions', () {
    test('matches on note substring', () async {
      await seedPrerequisites();
      await dao.insertTransaction(
          makeEntry(id: 'txn_1', note: 'Weekly groceries'));
      await dao.insertTransaction(
          makeEntry(id: 'txn_2', note: 'Monthly rent'));

      final result = await dao.searchTransactions('groceries').first;
      expect(result, hasLength(1));
      expect(result.first.id, 'txn_1');
    });

    test('returns empty for no match', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(id: 'txn_1', note: 'food'));

      final result = await dao.searchTransactions('nonexistent').first;
      expect(result, isEmpty);
    });
  });

  group('getTotalByType', () {
    test('sums expense amounts within date range', () async {
      await seedPrerequisites();
      await dao.insertTransaction(makeEntry(
        id: 'txn_1',
        amount: 200,
        transactionDate: DateTime(2025, 3, 10),
      ));
      await dao.insertTransaction(makeEntry(
        id: 'txn_2',
        amount: 300,
        transactionDate: DateTime(2025, 3, 20),
      ));

      final total = await dao.getTotalByType(
        TransactionType.expense,
        DateTime(2025, 3, 1),
        DateTime(2025, 3, 31),
      );
      expect(total, 500.0);
    });

    test('returns 0.0 when no matching transactions', () async {
      await seedPrerequisites();

      final total = await dao.getTotalByType(
        TransactionType.income,
        DateTime(2025, 3, 1),
        DateTime(2025, 3, 31),
      );
      expect(total, 0.0);
    });
  });
}
