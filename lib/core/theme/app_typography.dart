/// Typography tokens for PaisaTrack.
///
/// Uses *Noto Sans* for Latin text and *Noto Sans Devanagari* for Hindi.
library;

import 'package:flutter/material.dart';

abstract final class AppTypography {
  // ── Font Families ─────────────────────────────────────────────────────

  static const String _fontFamily = 'NotoSans';
  static const List<String> _fontFamilyFallback = ['NotoSansDevanagari'];

  // ── Headlines ─────────────────────────────────────────────────────────

  static TextStyle headlineLarge({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 32,
        fontWeight: FontWeight.w700,
        letterSpacing: 0,
        height: 1.25,
        color: color,
      );

  static TextStyle headlineMedium({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 28,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.29,
        color: color,
      );

  static TextStyle headlineSmall({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 24,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.33,
        color: color,
      );

  // ── Titles ────────────────────────────────────────────────────────────

  static TextStyle titleLarge({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 22,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.27,
        color: color,
      );

  static TextStyle titleMedium({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 16,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        height: 1.5,
        color: color,
      );

  static TextStyle titleSmall({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: color,
      );

  // ── Body ──────────────────────────────────────────────────────────────

  static TextStyle bodyLarge({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
        height: 1.5,
        color: color,
      );

  static TextStyle bodyMedium({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.43,
        color: color,
      );

  static TextStyle bodySmall({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.33,
        color: color,
      );

  // ── Labels ────────────────────────────────────────────────────────────

  static TextStyle labelLarge({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: color,
      );

  static TextStyle labelMedium({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.33,
        color: color,
      );

  static TextStyle labelSmall({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.45,
        color: color,
      );

  // ── Captions ──────────────────────────────────────────────────────────

  static TextStyle captionLarge({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.33,
        color: color,
      );

  static TextStyle captionSmall({Color? color}) => TextStyle(
        fontFamily: _fontFamily,
        fontFamilyFallback: _fontFamilyFallback,
        fontSize: 10,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.4,
        color: color,
      );

  // ── Full TextTheme ────────────────────────────────────────────────────

  /// Returns a complete [TextTheme] wired to our typography tokens.
  static TextTheme textTheme({Color? color}) => TextTheme(
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
