import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/shared/widgets/rupee_text.dart';

import '../../helpers/widget_test_helpers.dart';

void main() {
  group('RupeeText', () {
    testWidgets('renders amount with ₹ prefix', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(1000),
      ));
      expect(find.textContaining('₹'), findsOneWidget);
    });

    testWidgets('formats using Indian numbering system', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(123456.78),
      ));
      expect(find.textContaining('1,23,456.78'), findsOneWidget);
    });

    testWidgets('compact=true abbreviates lakhs', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(150000, compact: true),
      ));
      expect(find.textContaining('1.5 L'), findsOneWidget);
    });

    testWidgets('compact=true abbreviates crores', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(20000000, compact: true),
      ));
      expect(find.textContaining('2 Cr'), findsOneWidget);
    });

    testWidgets('compact=true abbreviates thousands', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(5000, compact: true),
      ));
      expect(find.textContaining('5 K'), findsOneWidget);
    });

    testWidgets('negative amount shows minus sign', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(-500),
      ));
      expect(find.textContaining('-'), findsOneWidget);
    });

    testWidgets('applies custom style', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const RupeeText(
          100,
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ));
      final text = tester.widget<Text>(find.byType(Text).first);
      expect(text.style?.fontSize, 24);
      expect(text.style?.fontWeight, FontWeight.bold);
    });
  });
}
