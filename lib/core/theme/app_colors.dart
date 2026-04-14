/// Comprehensive colour palette for PaisaTrack.
///
/// Provides brand colours with full shade ranges, semantic transaction colours,
/// surface tokens, gradients, chart colours, and status colours for both
/// light and dark themes.
library;

import 'package:flutter/material.dart';

abstract final class AppColors {
  // ══════════════════════════════════════════════════════════════════════════
  // PRIMARY PALETTE — Deep Teal
  // ══════════════════════════════════════════════════════════════════════════

  static const Color primary = Color(0xFF00897B);

  static const Color primary50 = Color(0xFFE0F2F1);
  static const Color primary100 = Color(0xFFB2DFDB);
  static const Color primary200 = Color(0xFF80CBC4);
  static const Color primary300 = Color(0xFF4DB6AC);
  static const Color primary400 = Color(0xFF26A69A);
  static const Color primary500 = Color(0xFF009688);
  static const Color primary600 = Color(0xFF00897B);
  static const Color primary700 = Color(0xFF00796B);
  static const Color primary800 = Color(0xFF00695C);
  static const Color primary900 = Color(0xFF004D40);

  // ══════════════════════════════════════════════════════════════════════════
  // SECONDARY PALETTE — Warm Saffron / Orange
  // ══════════════════════════════════════════════════════════════════════════

  static const Color secondary = Color(0xFFFF6B35);

  static const Color secondary50 = Color(0xFFFFF3E0);
  static const Color secondary100 = Color(0xFFFFE0B2);
  static const Color secondary200 = Color(0xFFFFCC80);
  static const Color secondary300 = Color(0xFFFFB74D);
  static const Color secondary400 = Color(0xFFFFA726);
  static const Color secondary500 = Color(0xFFFF9800);
  static const Color secondary600 = Color(0xFFFF6B35);
  static const Color secondary700 = Color(0xFFF4511E);
  static const Color secondary800 = Color(0xFFE64A19);
  static const Color secondary900 = Color(0xFFBF360C);

  // ══════════════════════════════════════════════════════════════════════════
  // TERTIARY / ACCENT — Gold
  // ══════════════════════════════════════════════════════════════════════════

  static const Color tertiary = Color(0xFFFFB74D);
  static const Color tertiaryLight = Color(0xFFFFE0B2);
  static const Color tertiaryDark = Color(0xFFF57C00);

  // ══════════════════════════════════════════════════════════════════════════
  // SEMANTIC — Transaction Colours
  // ══════════════════════════════════════════════════════════════════════════

  static const Color income = Color(0xFF4CAF50);
  static const Color incomeLight = Color(0xFFE8F5E9);
  static const Color incomeDark = Color(0xFF2E7D32);

  static const Color expense = Color(0xFFEF5350);
  static const Color expenseLight = Color(0xFFFFEBEE);
  static const Color expenseDark = Color(0xFFC62828);

  static const Color transfer = Color(0xFF42A5F5);
  static const Color transferLight = Color(0xFFE3F2FD);
  static const Color transferDark = Color(0xFF1565C0);

  // ══════════════════════════════════════════════════════════════════════════
  // NEUTRAL GRAYS — Text Hierarchy
  // ══════════════════════════════════════════════════════════════════════════

  static const Color textPrimary = Color(0xFF212121); // gray 900
  static const Color textSecondary = Color(0xFF757575); // gray 600
  static const Color textHint = Color(0xFFBDBDBD); // gray 400
  static const Color textDisabled = Color(0xFFE0E0E0); // gray 300

  static const Color textPrimaryDark = Color(0xFFF5F5F5); // gray 100
  static const Color textSecondaryDark = Color(0xFFBDBDBD); // gray 400
  static const Color textHintDark = Color(0xFF757575); // gray 600
  static const Color textDisabledDark = Color(0xFF616161); // gray 700

  // ══════════════════════════════════════════════════════════════════════════
  // LIGHT THEME SURFACES
  // ══════════════════════════════════════════════════════════════════════════

  static const Color lightBackground = Color(0xFFFAFAFA);
  static const Color lightSurface = Color(0xFFFFFFFF);
  static const Color lightSurfaceVariant = Color(0xFFF5F5F5);
  static const Color lightSurfaceContainer = Color(0xFFF0F0F0);
  static const Color lightOnBackground = Color(0xFF212121);
  static const Color lightOnSurface = Color(0xFF212121);
  static const Color lightOnSurfaceVariant = Color(0xFF757575);
  static const Color lightOutline = Color(0xFFBDBDBD);
  static const Color lightOutlineVariant = Color(0xFFE0E0E0);
  static const Color lightDivider = Color(0xFFF0F0F0);

  // ══════════════════════════════════════════════════════════════════════════
  // DARK THEME SURFACES — Near-black, CRED-inspired premium dark
  // ══════════════════════════════════════════════════════════════════════════

  static const Color darkBackground = Color(0xFF0B0B0F);
  static const Color darkSurface = Color(0xFF141418);
  static const Color darkSurfaceVariant = Color(0xFF1C1C22);
  static const Color darkSurfaceContainer = Color(0xFF18181E);
  static const Color darkOnBackground = Color(0xFFF5F5F5);
  static const Color darkOnSurface = Color(0xFFF5F5F5);
  static const Color darkOnSurfaceVariant = Color(0xFF8E8E93);
  static const Color darkOutline = Color(0xFF3A3A42);
  static const Color darkOutlineVariant = Color(0xFF2A2A32);
  static const Color darkDivider = Color(0xFF1C1C22);

  // ══════════════════════════════════════════════════════════════════════════
  // ERROR / STATUS
  // ══════════════════════════════════════════════════════════════════════════

  static const Color error = Color(0xFFD32F2F);
  static const Color errorLight = Color(0xFFFFCDD2);
  static const Color onError = Color(0xFFFFFFFF);
  static const Color errorContainer = Color(0xFFF9DEDC);
  static const Color onErrorContainer = Color(0xFF410E0B);

  static const Color darkError = Color(0xFFEF9A9A);
  static const Color darkOnError = Color(0xFF601410);
  static const Color darkErrorContainer = Color(0xFF8C1D18);
  static const Color darkOnErrorContainer = Color(0xFFF9DEDC);

  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFFE8F5E9);
  static const Color warning = Color(0xFFFFA726);
  static const Color warningLight = Color(0xFFFFF3E0);
  static const Color info = Color(0xFF42A5F5);
  static const Color infoLight = Color(0xFFE3F2FD);

  // ══════════════════════════════════════════════════════════════════════════
  // GRADIENTS
  // ══════════════════════════════════════════════════════════════════════════

  /// Primary gradient for balance cards.
  static const LinearGradient balanceCardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF00897B),
      Color(0xFF00695C),
    ],
  );

  /// Dark mode balance card gradient — deeper, more premium.
  static const LinearGradient balanceCardGradientDark = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF0D2924),
      Color(0xFF0B0B0F),
    ],
  );

  /// Premium / pro section gradient.
  static const LinearGradient premiumGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFFFF6B35),
      Color(0xFFFFB74D),
    ],
  );

  /// Subtle surface gradient for hero sections.
  static const LinearGradient surfaceGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFFE0F2F1),
      Color(0xFFFAFAFA),
    ],
  );

  static const LinearGradient surfaceGradientDark = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFF1A2E2B),
      Color(0xFF121212),
    ],
  );

  // ══════════════════════════════════════════════════════════════════════════
  // CHART COLOURS — 10 distinct, harmonious colours
  // ══════════════════════════════════════════════════════════════════════════

  static const List<Color> chartColors = [
    Color(0xFF00897B), // teal (primary)
    Color(0xFFFF6B35), // saffron (secondary)
    Color(0xFFFFB74D), // gold (tertiary)
    Color(0xFF42A5F5), // blue
    Color(0xFFAB47BC), // purple
    Color(0xFFEC407A), // pink
    Color(0xFF66BB6A), // green
    Color(0xFF5C6BC0), // indigo
    Color(0xFF26C6DA), // cyan
    Color(0xFF8D6E63), // brown
  ];

  static const List<Color> chartColorsDark = [
    Color(0xFF4DB6AC), // teal light
    Color(0xFFFF9A6C), // saffron light
    Color(0xFFFFE0B2), // gold light
    Color(0xFF90CAF9), // blue light
    Color(0xFFCE93D8), // purple light
    Color(0xFFF48FB1), // pink light
    Color(0xFFA5D6A7), // green light
    Color(0xFF9FA8DA), // indigo light
    Color(0xFF80DEEA), // cyan light
    Color(0xFFBCAAA4), // brown light
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // BORDER / CARD BORDER
  // ══════════════════════════════════════════════════════════════════════════

  static const Color cardBorderLight = Color(0x1A000000); // black 10%
  static const Color cardBorderDark = Color(0x1AFFFFFF); // white 10%

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  /// Returns the appropriate chart color list for the given [brightness].
  static List<Color> chartColorsFor(Brightness brightness) {
    return brightness == Brightness.dark ? chartColorsDark : chartColors;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LEGACY ALIASES — Backward compatibility with existing code
  // ══════════════════════════════════════════════════════════════════════════

  /// Alias for [primary].
  static const Color teal = primary;

  /// Alias for [primary300].
  static const Color tealLight = primary300;

  /// Alias for [primary900].
  static const Color tealDark = primary900;

  /// Alias for [secondary].
  static const Color saffron = secondary;

  /// Alias for [secondary200].
  static const Color saffronLight = secondary200;

  /// Alias for [secondary900].
  static const Color saffronDark = secondary900;
}
