import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/budget_mode.dart';
import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/domain/models/budget.dart';

void main() {
  final now = DateTime(2025, 3, 1);

  Budget makeTestBudget() => Budget(
        id: 'budget_001',
        name: 'Groceries',
        limitAmount: 5000.0,
        period: BudgetPeriod.monthly,
        startDate: now,
        createdAt: now,
        updatedAt: now,
      );

  group('Budget', () {
    test('can be created with required fields', () {
      final budget = makeTestBudget();
      expect(budget.id, 'budget_001');
      expect(budget.limitAmount, 5000.0);
      expect(budget.period, BudgetPeriod.monthly);
    });

    test('defaults are applied correctly', () {
      final budget = makeTestBudget();
      expect(budget.mode, BudgetMode.manual);
      expect(budget.isActive, true);
      expect(budget.categoryIds, isEmpty);
      expect(budget.syncStatus, SyncStatus.pending);
      expect(budget.isDeleted, false);
    });

    test('copyWith creates modified copy', () {
      final budget = makeTestBudget();
      final modified = budget.copyWith(limitAmount: 10000.0, name: 'Updated');
      expect(modified.limitAmount, 10000.0);
      expect(modified.name, 'Updated');
      expect(budget.limitAmount, 5000.0);
    });

    test('equality by value', () {
      final b1 = makeTestBudget();
      final b2 = makeTestBudget();
      expect(b1, equals(b2));
    });

    test('toJson/fromJson round-trip preserves all fields', () {
      final budget = makeTestBudget();
      final json = budget.toJson();
      final restored = Budget.fromJson(json);
      expect(restored, equals(budget));
    });
  });
}
