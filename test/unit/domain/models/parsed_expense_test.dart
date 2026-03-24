import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';

void main() {
  group('ParsedExpense', () {
    test('can be created with required source and null optionals', () {
      const expense = ParsedExpense(source: 'voice');
      expect(expense.source, 'voice');
      expect(expense.amount, isNull);
      expect(expense.categoryId, isNull);
      expect(expense.date, isNull);
      expect(expense.note, isNull);
    });

    test('defaults: confidence is 0.0, rawText is ""', () {
      const expense = ParsedExpense(source: 'chat');
      expect(expense.confidence, 0.0);
      expect(expense.rawText, '');
    });

    test('copyWith creates modified copy', () {
      const expense = ParsedExpense(source: 'voice');
      final modified = expense.copyWith(amount: 100.0, confidence: 0.8);
      expect(modified.amount, 100.0);
      expect(modified.confidence, 0.8);
      expect(expense.amount, isNull);
    });

    test('equality by value', () {
      const e1 = ParsedExpense(source: 'voice', amount: 50.0);
      const e2 = ParsedExpense(source: 'voice', amount: 50.0);
      expect(e1, equals(e2));
    });

    test('toJson/fromJson round-trip preserves all fields', () {
      final expense = ParsedExpense(
        source: 'voice',
        amount: 100.0,
        currency: 'INR',
        categoryId: 'cat_groceries',
        categoryName: 'Groceries',
        note: 'test note',
        date: DateTime(2025, 3, 15),
        confidence: 0.9,
        rawText: 'original text',
      );
      final json = expense.toJson();
      final restored = ParsedExpense.fromJson(json);
      expect(restored, equals(expense));
    });
  });
}
