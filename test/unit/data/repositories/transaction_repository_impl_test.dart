// These tests require `dart run build_runner build` to generate Drift types.
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/daos/transaction_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/repositories/transaction_repository_impl.dart';

class MockTransactionDao extends Mock implements TransactionDao {}

void main() {
  late MockTransactionDao mockDao;
  late TransactionRepositoryImpl repo;

  setUp(() {
    mockDao = MockTransactionDao();
    repo = TransactionRepositoryImpl(mockDao);
  });

  group('TransactionRepositoryImpl', () {
    group('watchAll', () {
      test('maps DAO stream to domain Transaction list', () {
        when(() => mockDao.watchAllTransactions())
            .thenAnswer((_) => Stream.value([]));

        final stream = repo.watchAll();
        expectLater(stream, emits(isEmpty));
      });
    });

    group('getById', () {
      test('returns null when DAO returns null', () async {
        when(() => mockDao.getTransactionById(any()))
            .thenAnswer((_) async => null);

        final result = await repo.getById('nonexistent');
        expect(result, isNull);
      });
    });

    group('delete', () {
      test('calls softDeleteTransaction on DAO', () async {
        when(() => mockDao.softDeleteTransaction(any()))
            .thenAnswer((_) async {});

        await repo.delete('txn_001');
        verify(() => mockDao.softDeleteTransaction('txn_001')).called(1);
      });
    });

    group('getTotalByType', () {
      test('delegates to DAO and returns result', () async {
        when(() => mockDao.getTotalByType(
              any(),
              any(),
              any(),
            )).thenAnswer((_) async => 5000.0);

        final total = await repo.getTotalByType(
          TransactionType.expense,
          start: DateTime(2025, 3, 1),
          end: DateTime(2025, 3, 31),
        );
        expect(total, 5000.0);
      });
    });

    group('getSpendingByCategory', () {
      test('maps CategorySpending list to Map', () async {
        when(() => mockDao.getSpendingByCategory(any(), any()))
            .thenAnswer((_) async => [
                  CategorySpending(
                    categoryId: 'cat_groceries',
                    categoryName: 'Groceries',
                    total: 3000.0,
                  ),
                  CategorySpending(
                    categoryId: 'cat_chai',
                    categoryName: 'Chai',
                    total: 500.0,
                  ),
                ]);

        final result = await repo.getSpendingByCategory(
          start: DateTime(2025, 3, 1),
          end: DateTime(2025, 3, 31),
        );
        expect(result, {'cat_groceries': 3000.0, 'cat_chai': 500.0});
      });
    });
  });
}
