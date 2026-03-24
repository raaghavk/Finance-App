import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/services/budget_analysis_service.dart';

import '../../../helpers/test_helpers.dart';

void main() {
  late BudgetAnalysisService service;

  setUp(() {
    service = BudgetAnalysisService();
  });

  group('suggestBudgets', () {
    test('empty transaction list returns empty suggestions', () {
      final suggestions = service.suggestBudgets([]);
      expect(suggestions, isEmpty);
    });

    test('only income transactions returns empty', () {
      final transactions = makeTransactionList(
        5,
        type: TransactionType.income,
        categoryId: 'cat_salary',
      );
      final suggestions = service.suggestBudgets(transactions);
      expect(suggestions, isEmpty);
    });

    test('deleted transactions are excluded', () {
      final transactions = List.generate(
        5,
        (i) => makeTransaction(
          id: 'txn_$i',
          amount: 100,
          categoryId: 'cat_groceries',
          isDeleted: true,
        ),
      );
      final suggestions = service.suggestBudgets(transactions);
      expect(suggestions, isEmpty);
    });

    test('categories with fewer than minimumTransactions are excluded', () {
      final transactions = [
        makeTransaction(id: 'txn_1', categoryId: 'cat_groceries', amount: 100),
        makeTransaction(id: 'txn_2', categoryId: 'cat_groceries', amount: 200),
        // Only 2 transactions — below default threshold of 3
      ];
      final suggestions = service.suggestBudgets(transactions);
      expect(suggestions, isEmpty);
    });

    test('single category with enough transactions produces suggestion', () {
      final baseDate = DateTime(2025, 3, 15);
      final transactions = [
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 1500,
          transactionDate: DateTime(2025, 2, 10),
        ),
        makeTransaction(
          id: 'txn_3',
          categoryId: 'cat_groceries',
          amount: 2000,
          transactionDate: baseDate,
        ),
      ];

      final suggestions = service.suggestBudgets(transactions);
      expect(suggestions, hasLength(1));
      expect(suggestions.first.categoryId, 'cat_groceries');
      expect(suggestions.first.totalSpent, 4500.0);
      expect(suggestions.first.transactionCount, 3);
    });

    test('monthly average is totalSpent / monthSpan', () {
      final transactions = [
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 2, 10),
        ),
        makeTransaction(
          id: 'txn_3',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 3, 10),
        ),
      ];

      final suggestions = service.suggestBudgets(transactions);
      // monthSpan: Jan to Mar = 3 months, total = 3000, avg = 1000
      expect(suggestions.first.monthlyAverage, 1000.0);
    });

    test('suggested limit includes 10% buffer rounded to nearest 100', () {
      final transactions = [
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 2, 10),
        ),
        makeTransaction(
          id: 'txn_3',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 3, 10),
        ),
      ];

      final suggestions = service.suggestBudgets(transactions);
      // avg=1000, +10% = 1100, ceil(1100/100)*100 = 1100
      expect(suggestions.first.suggestedLimit, 1100.0);
    });

    test('multiple categories sorted by monthlyAverage descending', () {
      final transactions = [
        // Groceries: 3 txns, higher spending
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 2000,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 2000,
          transactionDate: DateTime(2025, 2, 10),
        ),
        makeTransaction(
          id: 'txn_3',
          categoryId: 'cat_groceries',
          amount: 2000,
          transactionDate: DateTime(2025, 3, 10),
        ),
        // Chai: 3 txns, lower spending
        makeTransaction(
          id: 'txn_4',
          categoryId: 'cat_chai_snacks',
          amount: 100,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_5',
          categoryId: 'cat_chai_snacks',
          amount: 100,
          transactionDate: DateTime(2025, 2, 10),
        ),
        makeTransaction(
          id: 'txn_6',
          categoryId: 'cat_chai_snacks',
          amount: 100,
          transactionDate: DateTime(2025, 3, 10),
        ),
      ];

      final suggestions = service.suggestBudgets(transactions);
      expect(suggestions, hasLength(2));
      expect(suggestions[0].categoryId, 'cat_groceries');
      expect(suggestions[1].categoryId, 'cat_chai_snacks');
    });

    test('custom bufferPercentage is applied', () {
      final transactions = [
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 1, 20),
        ),
        makeTransaction(
          id: 'txn_3',
          categoryId: 'cat_groceries',
          amount: 1000,
          transactionDate: DateTime(2025, 1, 25),
        ),
      ];

      final suggestions = service.suggestBudgets(
        transactions,
        bufferPercentage: 0.20,
      );
      // monthSpan=1, avg=3000, +20% = 3600, ceil(3600/100)*100 = 3600
      expect(suggestions.first.suggestedLimit, 3600.0);
    });

    test('custom minimumTransactions threshold works', () {
      final transactions = [
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 500,
          transactionDate: DateTime(2025, 1, 10),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 500,
          transactionDate: DateTime(2025, 1, 20),
        ),
      ];

      // Default threshold (3) would exclude this
      expect(service.suggestBudgets(transactions), isEmpty);

      // Lower threshold (2) includes it
      final suggestions = service.suggestBudgets(
        transactions,
        minimumTransactions: 2,
      );
      expect(suggestions, hasLength(1));
    });

    test('same-month transactions have monthSpan = 1', () {
      final transactions = [
        makeTransaction(
          id: 'txn_1',
          categoryId: 'cat_groceries',
          amount: 500,
          transactionDate: DateTime(2025, 3, 1),
        ),
        makeTransaction(
          id: 'txn_2',
          categoryId: 'cat_groceries',
          amount: 500,
          transactionDate: DateTime(2025, 3, 15),
        ),
        makeTransaction(
          id: 'txn_3',
          categoryId: 'cat_groceries',
          amount: 500,
          transactionDate: DateTime(2025, 3, 28),
        ),
      ];

      final suggestions = service.suggestBudgets(transactions);
      expect(suggestions.first.monthSpan, 1);
    });
  });

  group('BudgetSuggestion', () {
    test('utilizationRate = monthlyAverage / suggestedLimit', () {
      const suggestion = BudgetSuggestion(
        categoryId: 'cat_groceries',
        monthlyAverage: 900.0,
        suggestedLimit: 1000.0,
        totalSpent: 2700.0,
        transactionCount: 3,
        monthSpan: 3,
        monthlySpending: {},
      );
      expect(suggestion.utilizationRate, 0.9);
    });
  });
}
