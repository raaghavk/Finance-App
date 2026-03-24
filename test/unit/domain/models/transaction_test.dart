import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/transaction.dart';

void main() {
  final now = DateTime(2025, 3, 15, 10, 30);

  Transaction makeTestTransaction() => Transaction(
        id: 'txn_001',
        amount: 500.0,
        type: TransactionType.expense,
        categoryId: 'cat_groceries',
        accountId: 'acc_cash',
        transactionDate: now,
        createdAt: now,
        updatedAt: now,
      );

  group('Transaction', () {
    test('can be created with required fields', () {
      final tx = makeTestTransaction();
      expect(tx.id, 'txn_001');
      expect(tx.amount, 500.0);
      expect(tx.type, TransactionType.expense);
    });

    test('defaults are applied correctly', () {
      final tx = makeTestTransaction();
      expect(tx.originalCurrency, 'INR');
      expect(tx.note, '');
      expect(tx.isDeleted, false);
      expect(tx.inputSource, InputSource.manual);
      expect(tx.syncStatus, SyncStatus.pending);
    });

    test('copyWith creates modified copy', () {
      final tx = makeTestTransaction();
      final modified = tx.copyWith(amount: 999.0, note: 'Updated');
      expect(modified.amount, 999.0);
      expect(modified.note, 'Updated');
      // Original unchanged
      expect(tx.amount, 500.0);
      expect(tx.note, '');
    });

    test('equality by value', () {
      final tx1 = makeTestTransaction();
      final tx2 = makeTestTransaction();
      expect(tx1, equals(tx2));
    });

    test('toJson/fromJson round-trip preserves all fields', () {
      final tx = makeTestTransaction();
      final json = tx.toJson();
      final restored = Transaction.fromJson(json);
      expect(restored, equals(tx));
    });
  });
}
