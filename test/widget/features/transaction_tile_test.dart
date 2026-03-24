import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/transaction_tile.dart';

import '../../helpers/test_helpers.dart';
import '../../helpers/widget_test_helpers.dart';

void main() {
  group('TransactionTile', () {
    testWidgets('renders amount with ₹ symbol', (tester) async {
      final tx = makeTransaction(amount: 500);
      await tester.pumpWidget(wrapWithMaterialApp(
        TransactionTile(transaction: tx),
      ));
      expect(find.textContaining('₹'), findsOneWidget);
      expect(find.textContaining('500'), findsOneWidget);
    });

    testWidgets('renders note text', (tester) async {
      final tx = makeTransaction(note: 'Weekly groceries');
      await tester.pumpWidget(wrapWithMaterialApp(
        TransactionTile(transaction: tx),
      ));
      expect(find.text('Weekly groceries'), findsOneWidget);
    });

    testWidgets('expense amount shows - prefix', (tester) async {
      final tx = makeTransaction(
        type: TransactionType.expense,
        amount: 200,
      );
      await tester.pumpWidget(wrapWithMaterialApp(
        TransactionTile(transaction: tx),
      ));
      expect(find.textContaining('-₹'), findsOneWidget);
    });

    testWidgets('income amount shows + prefix', (tester) async {
      final tx = makeTransaction(
        type: TransactionType.income,
        amount: 50000,
        categoryId: 'cat_salary',
      );
      await tester.pumpWidget(wrapWithMaterialApp(
        TransactionTile(transaction: tx),
      ));
      expect(find.textContaining('+₹'), findsOneWidget);
    });

    testWidgets('tapping the tile calls onTap', (tester) async {
      var tapped = false;
      final tx = makeTransaction();
      await tester.pumpWidget(wrapWithMaterialApp(
        TransactionTile(
          transaction: tx,
          onTap: () => tapped = true,
        ),
      ));
      await tester.tap(find.byType(ListTile));
      expect(tapped, isTrue);
    });

    testWidgets('renders as ListTile', (tester) async {
      final tx = makeTransaction();
      await tester.pumpWidget(wrapWithMaterialApp(
        TransactionTile(transaction: tx),
      ));
      expect(find.byType(ListTile), findsOneWidget);
    });
  });

  group('TransactionTile.formatIndianAmount', () {
    test('formats 500 as 500.00', () {
      expect(TransactionTile.formatIndianAmount(500), '500.00');
    });

    test('formats 1234567 with Indian commas', () {
      expect(TransactionTile.formatIndianAmount(1234567), '12,34,567.00');
    });

    test('formats 1000 as 1,000.00', () {
      expect(TransactionTile.formatIndianAmount(1000), '1,000.00');
    });

    test('formats 100000 (1 lakh) as 1,00,000.00', () {
      expect(TransactionTile.formatIndianAmount(100000), '1,00,000.00');
    });
  });
}
