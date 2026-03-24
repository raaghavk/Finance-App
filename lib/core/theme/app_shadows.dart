/// Subtle shadow definitions for PaisaTrack.
///
/// Provides three levels of shadow intensity, all designed to be barely
/// perceptible in light mode and invisible in dark mode (where surface
/// color differentiation handles depth instead).
library;

import 'package:flutter/material.dart';

abstract final class AppShadows {
  // ══════════════════════════════════════════════════════════════════════════
  // LIGHT MODE SHADOWS
  // ══════════════════════════════════════════════════════════════════════════

  /// Very subtle — for cards resting on the surface.
  static const List<BoxShadow> shadowSm = [
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  /// Slightly more prominent — for floating elements like dropdowns, popovers.
  static const List<BoxShadow> shadowMd = [
    BoxShadow(
      color: Color(0x0F000000),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x08000000),
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
  ];

  /// Prominent — for modals, FABs, bottom sheets.
  static const List<BoxShadow> shadowLg = [
    BoxShadow(
      color: Color(0x14000000),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color(0x0A000000),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // DARK MODE SHADOWS — Very subtle or none
  // ══════════════════════════════════════════════════════════════════════════

  /// Minimal glow for dark mode cards.
  static const List<BoxShadow> shadowSmDark = [
    BoxShadow(
      color: Color(0x20000000),
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
  ];

  /// Slightly more visible for floating elements in dark mode.
  static const List<BoxShadow> shadowMdDark = [
    BoxShadow(
      color: Color(0x30000000),
      blurRadius: 12,
      offset: Offset(0, 4),
    ),
  ];

  /// Prominent shadow for modals in dark mode.
  static const List<BoxShadow> shadowLgDark = [
    BoxShadow(
      color: Color(0x40000000),
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  /// Returns the small shadow list appropriate for the current [brightness].
  static List<BoxShadow> sm(Brightness brightness) =>
      brightness == Brightness.dark ? shadowSmDark : shadowSm;

  /// Returns the medium shadow list appropriate for the current [brightness].
  static List<BoxShadow> md(Brightness brightness) =>
      brightness == Brightness.dark ? shadowMdDark : shadowMd;

  /// Returns the large shadow list appropriate for the current [brightness].
  static List<BoxShadow> lg(Brightness brightness) =>
      brightness == Brightness.dark ? shadowLgDark : shadowLg;

  /// No shadow — useful for conditional shadow assignment.
  static const List<BoxShadow> none = [];
}
