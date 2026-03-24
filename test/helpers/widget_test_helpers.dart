import 'package:flutter/material.dart';
import 'package:paisa_track/core/theme/app_theme.dart';

/// Wraps [child] in a [MaterialApp] with the app theme for widget testing.
Widget wrapWithMaterialApp(
  Widget child, {
  Brightness brightness = Brightness.light,
}) {
  return MaterialApp(
    theme: brightness == Brightness.light ? AppTheme.light : AppTheme.dark,
    home: Scaffold(body: child),
  );
}
