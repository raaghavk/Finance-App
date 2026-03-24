import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/constants/category_constants.dart';

void main() {
  group('CategoryConstants', () {
    test('defaultExpenseCategories has 31 entries', () {
      expect(CategoryConstants.defaultExpenseCategories.length, 31);
    });

    test('defaultIncomeCategories has 9 entries', () {
      expect(CategoryConstants.defaultIncomeCategories.length, 9);
    });

    test('allDefaultCategories is union of both', () {
      expect(
        CategoryConstants.allDefaultCategories.length,
        CategoryConstants.defaultExpenseCategories.length +
            CategoryConstants.defaultIncomeCategories.length,
      );
    });

    test('findById returns correct category', () {
      final first = CategoryConstants.defaultExpenseCategories.first;
      final found = CategoryConstants.findById(first.id);
      expect(found, isNotNull);
      expect(found!.name, first.name);
    });

    test('findById returns null for unknown id', () {
      expect(CategoryConstants.findById('nonexistent-id'), isNull);
    });

    test('all IDs are unique across both lists', () {
      final ids = CategoryConstants.allDefaultCategories.map((c) => c.id);
      expect(ids.toSet().length, ids.length);
    });

    test('all categories have non-empty name and nameHi', () {
      for (final cat in CategoryConstants.allDefaultCategories) {
        expect(cat.name, isNotEmpty, reason: 'Category ${cat.id} has empty name');
        expect(cat.nameHi, isNotEmpty, reason: 'Category ${cat.id} has empty nameHi');
      }
    });

    test('expense categories all have type "expense"', () {
      for (final cat in CategoryConstants.defaultExpenseCategories) {
        expect(cat.type, 'expense');
      }
    });

    test('income categories all have type "income"', () {
      for (final cat in CategoryConstants.defaultIncomeCategories) {
        expect(cat.type, 'income');
      }
    });
  });
}
