import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/shared/widgets/amount_display.dart';

import '../../helpers/widget_test_helpers.dart';

void main() {
  group('AmountDisplay', () {
    testWidgets('renders currency symbol by default', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 100),
      ));
      expect(find.textContaining('₹'), findsOneWidget);
    });

    testWidgets('showCurrencySymbol=false omits symbol', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 100, showCurrencySymbol: false),
      ));
      expect(find.textContaining('₹'), findsNothing);
    });

    testWidgets('positive amount with sign=auto shows + prefix',
        (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 100, sign: AmountSign.auto),
      ));
      expect(find.textContaining('+'), findsOneWidget);
    });

    testWidgets('negative amount with sign=auto shows - prefix',
        (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: -100, sign: AmountSign.auto),
      ));
      expect(find.textContaining('-'), findsOneWidget);
    });

    testWidgets('zero amount with sign=auto shows no sign', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 0, sign: AmountSign.auto),
      ));
      final text = tester.widget<Text>(find.byType(Text).first);
      final str = text.data ?? '';
      expect(str.startsWith('+'), isFalse);
      expect(str.startsWith('-'), isFalse);
    });

    testWidgets('sign=none shows no sign prefix', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 100, sign: AmountSign.none),
      ));
      final text = tester.widget<Text>(find.byType(Text).first);
      final str = text.data ?? '';
      expect(str.startsWith('+'), isFalse);
    });

    testWidgets('Indian number formatting: 1234567 shows commas',
        (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 1234567, showDecimalsIfZero: false),
      ));
      expect(find.textContaining('12,34,567'), findsOneWidget);
    });

    testWidgets('showDecimalsIfZero=false hides .00', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(
          amount: 100,
          showDecimalsIfZero: false,
          sign: AmountSign.none,
        ),
      ));
      final text = tester.widget<Text>(find.byType(Text).first);
      expect(text.data, isNot(contains('.00')));
    });

    testWidgets('showDecimalsIfZero=true shows .00', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(
          amount: 100,
          showDecimalsIfZero: true,
          sign: AmountSign.none,
        ),
      ));
      expect(find.textContaining('.00'), findsOneWidget);
    });

    testWidgets('renders Text widget', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const AmountDisplay(amount: 500),
      ));
      expect(find.byType(Text), findsOneWidget);
    });
  });
}
