/// Colour palette for PaisaTrack.
///
/// Provides saffron/teal brand colours, semantic transaction colours,
/// and surface/background tokens for both light and dark themes.
library;

import 'dart:ui';

abstract final class AppColors {
  // ── Brand Colours ─────────────────────────────────────────────────────

  static const Color saffron = Color(0xFFFF6B35);
  static const Color saffronLight = Color(0xFFFF9A6C);
  static const Color saffronDark = Color(0xFFC43E06);

  static const Color teal = Color(0xFF00897B);
  static const Color tealLight = Color(0xFF4DB6AC);
  static const Color tealDark = Color(0xFF005B4F);

  // ── Semantic / Transaction Colours ────────────────────────────────────

  static const Color income = Color(0xFF2E7D32); // green
  static const Color incomeLight = Color(0xFF66BB6A);

  static const Color expense = Color(0xFFD32F2F); // red / saffron-toned
  static const Color expenseLight = Color(0xFFEF5350);

  static const Color transfer = Color(0xFF1565C0); // blue
  static const Color transferLight = Color(0xFF42A5F5);

  // ── Light Theme Surfaces ──────────────────────────────────────────────

  static const Color lightBackground = Color(0xFFFFFBFE);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceVariant = Color(0xFFF5F5F5);
  static const Color lightOnBackground = Color(0xFF1C1B1F);
  static const Color lightOnSurface = Color(0xFF1C1B1F);
  static const Color lightOnSurfaceVariant = Color(0xFF49454F);
  static const Color lightOutline = Color(0xFF79747E);
  static const Color lightOutlineVariant = Color(0xFFCAC4D0);

  // ── Dark Theme Surfaces ───────────────────────────────────────────────

  static const Color darkBackground = Color(0xFF1C1B1F);
  static const Color darkSurface = Color(0xFF2B2930);
  static const Color darkSurfaceVariant = Color(0xFF343239);
  static const Color darkOnBackground = Color(0xFFE6E1E5);
  static const Color darkOnSurface = Color(0xFFE6E1E5);
  static const Color darkOnSurfaceVariant = Color(0xFFCAC4D0);
  static const Color darkOutline = Color(0xFF938F99);
  static const Color darkOutlineVariant = Color(0xFF49454F);

  // ── Error ─────────────────────────────────────────────────────────────

  static const Color error = Color(0xFFB3261E);
  static const Color errorLight = Color(0xFFF2B8B5);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color errorContainer = Color(0xFFF9DEDC);
  static const Color onErrorContainer = Color(0xFF410E0B);

  // ── Dark Error ────────────────────────────────────────────────────────

  static const Color darkError = Color(0xFFF2B8B5);
  static const Color darkOnError = Color(0xFF601410);
  static const Color darkErrorContainer = Color(0xFF8C1D18);
  static const Color darkOnErrorContainer = Color(0xFFF9DEDC);
}
