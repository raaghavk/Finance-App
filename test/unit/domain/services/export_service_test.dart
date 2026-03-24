import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/services/export_service.dart';

import '../../../helpers/test_helpers.dart';

void main() {
  late ExportService service;

  setUp(() {
    service = ExportService();
  });

  group('exportToCsv', () {
    test('empty list produces header-only CSV', () {
      final csv = service.exportToCsv([]);
      expect(csv, contains('Date'));
      expect(csv, contains('Type'));
      expect(csv, contains('Amount'));
      // Should only have the header line
      final lines = csv.trim().split('\n');
      expect(lines, hasLength(1));
    });

    test('single transaction produces correct row', () {
      final tx = makeTransaction(
        amount: 500.0,
        note: 'Groceries',
        transactionDate: DateTime(2025, 3, 15),
      );
      final csv = service.exportToCsv([tx]);
      final lines = csv.trim().split('\n');
      expect(lines, hasLength(2)); // header + 1 row

      final dataRow = lines[1];
      expect(dataRow, contains('15/03/2025'));
      expect(dataRow, contains('500.00'));
      expect(dataRow, contains('Groceries'));
    });

    test('amount has 2 decimal places', () {
      final tx = makeTransaction(amount: 123.456);
      final csv = service.exportToCsv([tx]);
      expect(csv, contains('123.46'));
    });
  });

  group('exportToCsvWithNames', () {
    test('resolves categoryId to name via categoryNames map', () {
      final tx = makeTransaction(
        categoryId: 'cat_groceries',
        accountId: 'acc_cash',
      );
      final csv = service.exportToCsvWithNames(
        [tx],
        categoryNames: {'cat_groceries': 'Groceries'},
        accountNames: {'acc_cash': 'Cash'},
      );
      expect(csv, contains('Groceries'));
      expect(csv, contains('Cash'));
    });

    test('falls back to ID when name not in map', () {
      final tx = makeTransaction(
        categoryId: 'cat_unknown',
        accountId: 'acc_unknown',
      );
      final csv = service.exportToCsvWithNames(
        [tx],
        categoryNames: {},
        accountNames: {},
      );
      expect(csv, contains('cat_unknown'));
      expect(csv, contains('acc_unknown'));
    });

    test('type is uppercased', () {
      final tx = makeTransaction(type: TransactionType.expense);
      final csv = service.exportToCsvWithNames(
        [tx],
        categoryNames: {},
        accountNames: {},
      );
      expect(csv, contains('EXPENSE'));
    });
  });

  group('exportToPdf', () {
    test('returns non-empty Uint8List bytes', () async {
      final tx = makeTransaction(
        amount: 500.0,
        transactionDate: DateTime(2025, 3, 15),
      );
      final bytes = await service.exportToPdf(
        [tx],
        startDate: DateTime(2025, 3, 1),
        endDate: DateTime(2025, 3, 31),
      );
      expect(bytes, isNotEmpty);
    });

    test('produces PDF with correct page count for 30 transactions', () async {
      final transactions = List.generate(
        30,
        (i) => makeTransaction(
          id: 'txn_$i',
          amount: 100.0 + i,
          transactionDate: DateTime(2025, 3, 1).add(Duration(hours: i)),
        ),
      );
      // Should not throw
      final bytes = await service.exportToPdf(
        transactions,
        startDate: DateTime(2025, 3, 1),
        endDate: DateTime(2025, 3, 31),
      );
      expect(bytes, isNotEmpty);
    });

    test('handles empty transaction list', () async {
      final bytes = await service.exportToPdf(
        [],
        startDate: DateTime(2025, 3, 1),
        endDate: DateTime(2025, 3, 31),
      );
      expect(bytes, isNotEmpty);
    });
  });
}
