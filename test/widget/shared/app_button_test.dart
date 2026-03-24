import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/shared/widgets/app_button.dart';

import '../../helpers/widget_test_helpers.dart';

void main() {
  group('AppButton', () {
    group('primary', () {
      testWidgets('renders label text', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(label: 'Save', onPressed: () {}),
        ));
        expect(find.text('Save'), findsOneWidget);
      });

      testWidgets('calls onPressed when tapped', (tester) async {
        var pressed = false;
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(label: 'Save', onPressed: () => pressed = true),
        ));
        await tester.tap(find.text('Save'));
        expect(pressed, isTrue);
      });

      testWidgets('renders as FilledButton', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(label: 'Save', onPressed: () {}),
        ));
        expect(find.byType(FilledButton), findsOneWidget);
      });

      testWidgets('renders icon when provided', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(
            label: 'Add',
            onPressed: () {},
            icon: Icons.add,
          ),
        ));
        expect(find.byIcon(Icons.add), findsOneWidget);
      });
    });

    group('secondary', () {
      testWidgets('renders as OutlinedButton', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.secondary(label: 'Cancel', onPressed: () {}),
        ));
        expect(find.byType(OutlinedButton), findsOneWidget);
      });
    });

    group('text', () {
      testWidgets('renders as TextButton', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.text(label: 'Skip', onPressed: () {}),
        ));
        expect(find.byType(TextButton), findsOneWidget);
      });
    });

    group('danger', () {
      testWidgets('renders as FilledButton', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.danger(label: 'Delete', onPressed: () {}),
        ));
        expect(find.byType(FilledButton), findsOneWidget);
      });
    });

    group('loading state', () {
      testWidgets('shows CircularProgressIndicator when isLoading=true',
          (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(
            label: 'Save',
            onPressed: () {},
            isLoading: true,
          ),
        ));
        expect(find.byType(CircularProgressIndicator), findsOneWidget);
      });

      testWidgets('does not show label text when loading', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(
            label: 'Save',
            onPressed: () {},
            isLoading: true,
          ),
        ));
        expect(find.text('Save'), findsNothing);
      });

      testWidgets('is not tappable when loading', (tester) async {
        var pressed = false;
        await tester.pumpWidget(wrapWithMaterialApp(
          AppButton.primary(
            label: 'Save',
            onPressed: () => pressed = true,
            isLoading: true,
          ),
        ));
        await tester.tap(find.byType(FilledButton));
        expect(pressed, isFalse);
      });
    });

    group('disabled state', () {
      testWidgets('disabled when onPressed is null', (tester) async {
        await tester.pumpWidget(wrapWithMaterialApp(
          const AppButton.primary(label: 'Save'),
        ));
        final button = tester.widget<FilledButton>(find.byType(FilledButton));
        expect(button.onPressed, isNull);
      });
    });
  });
}
