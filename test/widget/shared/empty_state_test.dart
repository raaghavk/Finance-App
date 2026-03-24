import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/shared/widgets/empty_state.dart';

import '../../helpers/widget_test_helpers.dart';

void main() {
  group('EmptyState', () {
    testWidgets('renders title text', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const EmptyState(title: 'No transactions'),
      ));
      expect(find.text('No transactions'), findsOneWidget);
    });

    testWidgets('renders subtitle when provided', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const EmptyState(
          title: 'No transactions',
          subtitle: 'Add your first expense',
        ),
      ));
      expect(find.text('Add your first expense'), findsOneWidget);
    });

    testWidgets('does not render subtitle when null', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const EmptyState(title: 'Empty'),
      ));
      // Only title should be present
      final textWidgets = find.byType(Text);
      expect(textWidgets, findsOneWidget);
    });

    testWidgets('shows icon when no lottieAsset', (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const EmptyState(title: 'Empty'),
      ));
      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
    });

    testWidgets('renders action button when actionLabel and onAction provided',
        (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        EmptyState(
          title: 'Empty',
          actionLabel: 'Add Now',
          onAction: () {},
        ),
      ));
      expect(find.text('Add Now'), findsOneWidget);
      expect(find.byType(FilledButton), findsOneWidget);
    });

    testWidgets('does not render action button when actionLabel is null',
        (tester) async {
      await tester.pumpWidget(wrapWithMaterialApp(
        const EmptyState(title: 'Empty'),
      ));
      expect(find.byType(FilledButton), findsNothing);
    });

    testWidgets('tapping action button calls onAction', (tester) async {
      var tapped = false;
      await tester.pumpWidget(wrapWithMaterialApp(
        EmptyState(
          title: 'Empty',
          actionLabel: 'Add Now',
          onAction: () => tapped = true,
        ),
      ));
      await tester.tap(find.text('Add Now'));
      expect(tapped, isTrue);
    });
  });
}
