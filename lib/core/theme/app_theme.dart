/// Material 3 theme definitions for PaisaTrack.
library;

import 'package:flutter/material.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/theme/app_typography.dart';

abstract final class AppTheme {
  // ── Light Theme ───────────────────────────────────────────────────────

  static ThemeData light() {
    final colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.teal,
      onPrimary: Colors.white,
      primaryContainer: AppColors.tealLight.withValues(alpha: 0.3),
      onPrimaryContainer: AppColors.tealDark,
      secondary: AppColors.saffron,
      onSecondary: Colors.white,
      secondaryContainer: AppColors.saffronLight.withValues(alpha: 0.3),
      onSecondaryContainer: AppColors.saffronDark,
      tertiary: AppColors.transfer,
      onTertiary: Colors.white,
      error: AppColors.error,
      onError: AppColors.onError,
      errorContainer: AppColors.errorContainer,
      onErrorContainer: AppColors.onErrorContainer,
      surface: AppColors.lightSurface,
      onSurface: AppColors.lightOnSurface,
      surfaceContainerHighest: AppColors.lightSurfaceVariant,
      onSurfaceVariant: AppColors.lightOnSurfaceVariant,
      outline: AppColors.lightOutline,
      outlineVariant: AppColors.lightOutlineVariant,
    );

    final textTheme = AppTypography.textTheme(color: AppColors.lightOnSurface);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.lightBackground,
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 1,
        backgroundColor: AppColors.lightSurface,
        foregroundColor: AppColors.lightOnSurface,
        titleTextStyle: AppTypography.titleLarge(color: AppColors.lightOnSurface),
      ),
      cardTheme: CardThemeData(
        elevation: 0.5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: AppColors.lightSurface,
        surfaceTintColor: Colors.transparent,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.teal,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.lightSurface,
        selectedItemColor: AppColors.teal,
        unselectedItemColor: AppColors.lightOnSurfaceVariant,
        selectedLabelStyle: AppTypography.labelSmall(),
        unselectedLabelStyle: AppTypography.labelSmall(),
        elevation: 8,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: AppColors.tealLight.withValues(alpha: 0.3),
        backgroundColor: AppColors.lightSurface,
        elevation: 2,
        labelTextStyle: WidgetStatePropertyAll(AppTypography.labelSmall()),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurfaceVariant,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.teal, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),
        hintStyle: AppTypography.bodyMedium(color: AppColors.lightOnSurfaceVariant),
        labelStyle: AppTypography.bodyMedium(color: AppColors.lightOnSurfaceVariant),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.lightOutlineVariant,
        thickness: 1,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  // ── Dark Theme ────────────────────────────────────────────────────────

  static ThemeData dark() {
    final colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: AppColors.tealLight,
      onPrimary: AppColors.tealDark,
      primaryContainer: AppColors.tealDark,
      onPrimaryContainer: AppColors.tealLight,
      secondary: AppColors.saffronLight,
      onSecondary: AppColors.saffronDark,
      secondaryContainer: AppColors.saffronDark,
      onSecondaryContainer: AppColors.saffronLight,
      tertiary: AppColors.transferLight,
      onTertiary: Colors.white,
      error: AppColors.darkError,
      onError: AppColors.darkOnError,
      errorContainer: AppColors.darkErrorContainer,
      onErrorContainer: AppColors.darkOnErrorContainer,
      surface: AppColors.darkSurface,
      onSurface: AppColors.darkOnSurface,
      surfaceContainerHighest: AppColors.darkSurfaceVariant,
      onSurfaceVariant: AppColors.darkOnSurfaceVariant,
      outline: AppColors.darkOutline,
      outlineVariant: AppColors.darkOutlineVariant,
    );

    final textTheme = AppTypography.textTheme(color: AppColors.darkOnSurface);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.darkBackground,
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 1,
        backgroundColor: AppColors.darkSurface,
        foregroundColor: AppColors.darkOnSurface,
        titleTextStyle: AppTypography.titleLarge(color: AppColors.darkOnSurface),
      ),
      cardTheme: CardThemeData(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: AppColors.darkSurface,
        surfaceTintColor: Colors.transparent,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.tealLight,
        foregroundColor: AppColors.tealDark,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.darkSurface,
        selectedItemColor: AppColors.tealLight,
        unselectedItemColor: AppColors.darkOnSurfaceVariant,
        selectedLabelStyle: AppTypography.labelSmall(),
        unselectedLabelStyle: AppTypography.labelSmall(),
        elevation: 8,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: AppColors.tealDark.withValues(alpha: 0.5),
        backgroundColor: AppColors.darkSurface,
        elevation: 2,
        labelTextStyle: WidgetStatePropertyAll(AppTypography.labelSmall()),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurfaceVariant,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.tealLight, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.darkError, width: 1),
        ),
        hintStyle: AppTypography.bodyMedium(color: AppColors.darkOnSurfaceVariant),
        labelStyle: AppTypography.bodyMedium(color: AppColors.darkOnSurfaceVariant),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.darkOutlineVariant,
        thickness: 1,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
