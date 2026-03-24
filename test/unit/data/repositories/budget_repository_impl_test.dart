// These tests require `dart run build_runner build` to generate Drift types.
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:paisa_track/data/local/daos/budget_dao.dart';
import 'package:paisa_track/data/repositories/budget_repository_impl.dart';

class MockBudgetDao extends Mock implements BudgetDao {}

void main() {
  late MockBudgetDao mockDao;
  late BudgetRepositoryImpl repo;

  setUp(() {
    mockDao = MockBudgetDao();
    repo = BudgetRepositoryImpl(budgetDao: mockDao);
  });

  group('BudgetRepositoryImpl', () {
    group('getById', () {
      test('returns null when budget not found', () async {
        when(() => mockDao.getBudgetWithCategories(any()))
            .thenAnswer((_) async => null);

        final result = await repo.getById('nonexistent');
        expect(result, isNull);
      });
    });

    group('getProgress', () {
      test('throws StateError when budget not found', () async {
        when(() => mockDao.getBudgetWithCategories(any()))
            .thenAnswer((_) async => null);

        expect(
          () => repo.getProgress('nonexistent'),
          throwsStateError,
        );
      });
    });

    group('delete', () {
      test('calls softDeleteBudget on DAO', () async {
        when(() => mockDao.softDeleteBudget(any()))
            .thenAnswer((_) async {});

        await repo.delete('budget_001');
        verify(() => mockDao.softDeleteBudget('budget_001')).called(1);
      });
    });
  });
}
