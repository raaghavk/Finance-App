/// Typography tokens for PaisaTrack.
///
/// Uses *Noto Sans* for Latin text and *Noto Sans Devanagari* for Hindi.
/// Provides a clean type scale tuned for a finance app: readable body text,
/// spacious headings, and a dedicated amount style with tabular figures.
library;

import 'package:flutter/material.dart';

abstract final class AppTypography {
  // ── Font Families ─────────────────────────────────────────────────────

  static const String fontFamily = 'NotoSans';
  static const List<String> fontFamilyFallback = ['NotoSansDevanagari'];

  // ══════════════════════════════════════════════════════════════════════════
  // DISPLAY — Balance amounts, hero numbers
  // ══════════════════════════════════════════════════════════════════════════

  static TextStyle displayLarge({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 34,
        fontWeight: FontWeight.w300,
        letterSpacing: -0.5,
        height: 1.18,
        color: color,
      );

  static TextStyle displayMedium({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 28,
        fontWeight: FontWeight.w300,
        letterSpacing: -0.25,
        height: 1.21,
        color: color,
      );

  static TextStyle displaySmall({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 24,
        fontWeight: FontWeight.w300,
        letterSpacing: 0,
        height: 1.25,
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // HEADLINE — Screen titles
  // ══════════════════════════════════════════════════════════════════════════

  static TextStyle headlineLarge({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 24,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        height: 1.33,
        color: color,
      );

  static TextStyle headlineMedium({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 22,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        height: 1.27,
        color: color,
      );

  static TextStyle headlineSmall({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 20,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        height: 1.30,
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // TITLE — Section headers, card titles
  // ══════════════════════════════════════════════════════════════════════════

  static TextStyle titleLarge({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 20,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        height: 1.30,
        color: color,
      );

  static TextStyle titleMedium({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 16,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        height: 1.50,
        color: color,
      );

  static TextStyle titleSmall({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // BODY — Content text
  // ══════════════════════════════════════════════════════════════════════════

  static TextStyle bodyLarge({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.50,
        color: color,
      );

  static TextStyle bodyMedium({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.43,
        color: color,
      );

  static TextStyle bodySmall({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.33,
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // LABEL — Chips, badges, buttons
  // ══════════════════════════════════════════════════════════════════════════

  static TextStyle labelLarge({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: color,
      );

  static TextStyle labelMedium({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.33,
        color: color,
      );

  static TextStyle labelSmall({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.45,
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // CAPTION — Timestamps, metadata
  // ══════════════════════════════════════════════════════════════════════════

  static TextStyle caption({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 11,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.45,
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // AMOUNT — Currency values with tabular figures
  // ══════════════════════════════════════════════════════════════════════════

  /// Large amount for balance cards, detail hero sections.
  static TextStyle amountLarge({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 34,
        fontWeight: FontWeight.w500,
        letterSpacing: -0.5,
        height: 1.18,
        fontFeatures: const [FontFeature.tabularFigures()],
        color: color,
      );

  /// Medium amount for list items, summaries.
  static TextStyle amountMedium({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 16,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        height: 1.50,
        fontFeatures: const [FontFeature.tabularFigures()],
        color: color,
      );

  /// Small amount for compact views, secondary amounts.
  static TextStyle amountSmall({Color? color}) => TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        height: 1.43,
        fontFeatures: const [FontFeature.tabularFigures()],
        color: color,
      );

  // ══════════════════════════════════════════════════════════════════════════
  // FULL TEXT THEME
  // ══════════════════════════════════════════════════════════════════════════

  /// Returns a complete [TextTheme] wired to PaisaTrack typography tokens.
  static TextTheme textTheme({Color? color}) => TextTheme(
        displayLarge: displayLarge(color: color),
        displayMedium: displayMedium(color: color),
        displaySmall: displaySmall(color: color),
        headlineLarge: headlineLarge(color: color),
        headlineMedium: headlineMedium(color: color),
        headlineSmall: headlineSmall(color: color),
        titleLarge: titleLarge(color: color),
        titleMedium: titleMedium(color: color),
        titleSmall: titleSmall(color: color),
        bodyLarge: bodyLarge(color: color),
        bodyMedium: bodyMedium(color: color),
        bodySmall: bodySmall(color: color),
        labelLarge: labelLarge(color: color),
        labelMedium: labelMedium(color: color),
        labelSmall: labelSmall(color: color),
      );
}
