import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';

void main() {
  group('TransactionType', () {
    test('values contains income, expense, transfer', () {
      expect(TransactionType.values, hasLength(3));
      expect(TransactionType.values, contains(TransactionType.income));
      expect(TransactionType.values, contains(TransactionType.expense));
      expect(TransactionType.values, contains(TransactionType.transfer));
    });

    test('tryFromName("income") returns TransactionType.income', () {
      expect(TransactionType.tryFromName('income'), TransactionType.income);
    });

    test('tryFromName("expense") returns TransactionType.expense', () {
      expect(TransactionType.tryFromName('expense'), TransactionType.expense);
    });

    test('tryFromName("INCOME") returns null (case sensitive match on .name)', () {
      expect(TransactionType.tryFromName('INCOME'), isNull);
    });

    test('tryFromName("unknown") returns null', () {
      expect(TransactionType.tryFromName('unknown'), isNull);
    });

    test('label returns correct English label', () {
      expect(TransactionType.income.label, 'Income');
      expect(TransactionType.expense.label, 'Expense');
      expect(TransactionType.transfer.label, 'Transfer');
    });

    test('labelHi returns correct Hindi label', () {
      expect(TransactionType.income.labelHi, 'आय');
      expect(TransactionType.expense.labelHi, 'खर्च');
      expect(TransactionType.transfer.labelHi, 'ट्रांसफर');
    });
  });
}
