/// Material 3 theme definitions for PaisaTrack.
///
/// Provides polished light and dark themes with a minimalist, fintech-inspired
/// design language. Zero card elevation with subtle borders, spacious layouts,
/// and smooth transitions on all interactive elements.
library;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/theme/app_spacing.dart';
import 'package:paisa_track/core/theme/app_typography.dart';

abstract final class AppTheme {
  // ══════════════════════════════════════════════════════════════════════════
  // LIGHT THEME
  // ══════════════════════════════════════════════════════════════════════════

  static ThemeData get light {
    final colorScheme = ColorScheme(
      brightness: Brightness.light,
      // Primary — deep teal
      primary: AppColors.primary,
      onPrimary: Colors.white,
      primaryContainer: AppColors.primary100,
      onPrimaryContainer: AppColors.primary900,
      // Secondary — warm saffron
      secondary: AppColors.secondary,
      onSecondary: Colors.white,
      secondaryContainer: AppColors.secondary100,
      onSecondaryContainer: AppColors.secondary900,
      // Tertiary — gold
      tertiary: AppColors.tertiary,
      onTertiary: Colors.white,
      tertiaryContainer: AppColors.tertiaryLight,
      onTertiaryContainer: AppColors.tertiaryDark,
      // Error
      error: AppColors.error,
      onError: AppColors.onError,
      errorContainer: AppColors.errorContainer,
      onErrorContainer: AppColors.onErrorContainer,
      // Surfaces
      surface: AppColors.lightSurface,
      onSurface: AppColors.lightOnSurface,
      surfaceContainerHighest: AppColors.lightSurfaceVariant,
      onSurfaceVariant: AppColors.lightOnSurfaceVariant,
      // Outlines
      outline: AppColors.lightOutline,
      outlineVariant: AppColors.lightOutlineVariant,
      // Misc
      inverseSurface: AppColors.darkSurface,
      onInverseSurface: AppColors.darkOnSurface,
      inversePrimary: AppColors.primary200,
      shadow: const Color(0x1A000000),
      scrim: const Color(0x33000000),
    );

    final textTheme =
        AppTypography.textTheme(color: AppColors.lightOnSurface);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.lightBackground,
      splashFactory: InkSparkle.splashFactory,

      // ── App Bar ───────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.lightOnSurface,
        titleTextStyle:
            AppTypography.headlineMedium(color: AppColors.lightOnSurface),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),

      // ── Card ──────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusCard,
          side: const BorderSide(
            color: AppColors.cardBorderLight,
            width: 1,
          ),
        ),
        color: AppColors.lightSurface,
        surfaceTintColor: Colors.transparent,
        margin: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: 6,
        ),
      ),

      // ── FAB ───────────────────────────────────────────────────────────
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 2,
        focusElevation: 4,
        hoverElevation: 4,
        highlightElevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        ),
        sizeConstraints: const BoxConstraints.tightFor(
          width: 56,
          height: 56,
        ),
      ),

      // ── Bottom Navigation ─────────────────────────────────────────────
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.lightSurface,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.lightOnSurfaceVariant,
        selectedLabelStyle: AppTypography.labelSmall(),
        unselectedLabelStyle: AppTypography.labelSmall(),
        elevation: 0,
        selectedIconTheme: const IconThemeData(size: 24),
        unselectedIconTheme: const IconThemeData(size: 24),
      ),

      // ── Navigation Bar (Material 3) ──────────────────────────────────
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: AppColors.primary100,
        backgroundColor: AppColors.lightSurface,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        height: 64,
        labelTextStyle: WidgetStatePropertyAll(
          AppTypography.labelSmall(color: AppColors.lightOnSurface),
        ),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(
              color: AppColors.primary,
              size: 24,
            );
          }
          return IconThemeData(
            color: AppColors.lightOnSurfaceVariant,
            size: 24,
          );
        }),
      ),

      // ── Input Decoration ──────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightSurfaceVariant.withValues(alpha: 0.5),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.lightOutlineVariant,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.lightOutlineVariant,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.primary,
            width: 1.5,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.error,
            width: 1,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.error,
            width: 1.5,
          ),
        ),
        hintStyle: AppTypography.bodyMedium(
          color: AppColors.textHint,
        ),
        labelStyle: AppTypography.bodyMedium(
          color: AppColors.textSecondary,
        ),
        floatingLabelStyle: AppTypography.labelMedium(
          color: AppColors.primary,
        ),
      ),

      // ── Buttons ───────────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.lightOutlineVariant,
          disabledForegroundColor: AppColors.textHint,
          padding: AppSpacing.buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 48),
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.lightOutlineVariant,
          disabledForegroundColor: AppColors.textHint,
          padding: AppSpacing.buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 48),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          disabledForegroundColor: AppColors.textHint,
          padding: AppSpacing.buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          side: const BorderSide(color: AppColors.primary, width: 1),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 48),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          disabledForegroundColor: AppColors.textHint,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.sm,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 40),
        ),
      ),

      // ── Chips ─────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusChip,
        ),
        side: BorderSide.none,
        backgroundColor: AppColors.lightSurfaceVariant,
        selectedColor: AppColors.primary100,
        labelStyle: AppTypography.labelMedium(),
        padding: AppSpacing.chipPadding,
      ),

      // ── Divider ───────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: AppColors.lightDivider,
        thickness: 1,
        space: 1,
      ),

      // ── List Tile ─────────────────────────────────────────────────────
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xs,
        ),
        dense: false,
        visualDensity: VisualDensity.comfortable,
        titleTextStyle:
            AppTypography.titleSmall(color: AppColors.lightOnSurface),
        subtitleTextStyle:
            AppTypography.bodySmall(color: AppColors.textSecondary),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusButton,
        ),
      ),

      // ── Bottom Sheet ──────────────────────────────────────────────────
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.lightSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppSpacing.radiusBottomSheet),
          ),
        ),
        dragHandleColor: AppColors.lightOutlineVariant,
        dragHandleSize: Size(40, 4),
        showDragHandle: true,
      ),

      // ── Dialog ────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.lightSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius:
              BorderRadius.circular(AppSpacing.radiusDialog),
        ),
        titleTextStyle:
            AppTypography.titleLarge(color: AppColors.lightOnSurface),
        contentTextStyle:
            AppTypography.bodyMedium(color: AppColors.textSecondary),
      ),

      // ── Snackbar ──────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.darkSurface,
        contentTextStyle:
            AppTypography.bodyMedium(color: AppColors.darkOnSurface),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusButton,
        ),
        elevation: 0,
        insetPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
      ),

      // ── Tab Bar ───────────────────────────────────────────────────────
      tabBarTheme: TabBarThemeData(
        indicatorColor: AppColors.primary,
        labelColor: AppColors.primary,
        unselectedLabelColor: AppColors.textSecondary,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: AppTypography.labelLarge(),
        unselectedLabelStyle: AppTypography.labelLarge(),
        dividerColor: Colors.transparent,
      ),

      // ── Switch / Checkbox / Radio ─────────────────────────────────────
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary;
          }
          return AppColors.lightOutline;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary200;
          }
          return AppColors.lightSurfaceVariant;
        }),
      ),

      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary;
          }
          return Colors.transparent;
        }),
        checkColor: const WidgetStatePropertyAll(Colors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),

      // ── Progress Indicator ────────────────────────────────────────────
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.primary100,
        circularTrackColor: AppColors.primary100,
      ),

      // ── Tooltip ───────────────────────────────────────────────────────
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: AppSpacing.borderRadiusButton,
        ),
        textStyle: AppTypography.bodySmall(color: AppColors.darkOnSurface),
      ),

      // ── Page Transitions ──────────────────────────────────────────────
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),

      // ── Visual Density ────────────────────────────────────────────────
      visualDensity: VisualDensity.comfortable,
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DARK THEME
  // ══════════════════════════════════════════════════════════════════════════

  static ThemeData get dark {
    final colorScheme = ColorScheme(
      brightness: Brightness.dark,
      // Primary — lighter teal for dark backgrounds
      primary: AppColors.primary300,
      onPrimary: AppColors.primary900,
      primaryContainer: AppColors.primary800,
      onPrimaryContainer: AppColors.primary100,
      // Secondary — lighter saffron
      secondary: AppColors.secondary300,
      onSecondary: AppColors.secondary900,
      secondaryContainer: AppColors.secondary800,
      onSecondaryContainer: AppColors.secondary100,
      // Tertiary — gold
      tertiary: AppColors.tertiary,
      onTertiary: Colors.black,
      tertiaryContainer: AppColors.tertiaryDark,
      onTertiaryContainer: AppColors.tertiaryLight,
      // Error
      error: AppColors.darkError,
      onError: AppColors.darkOnError,
      errorContainer: AppColors.darkErrorContainer,
      onErrorContainer: AppColors.darkOnErrorContainer,
      // Surfaces
      surface: AppColors.darkSurface,
      onSurface: AppColors.darkOnSurface,
      surfaceContainerHighest: AppColors.darkSurfaceVariant,
      onSurfaceVariant: AppColors.darkOnSurfaceVariant,
      // Outlines
      outline: AppColors.darkOutline,
      outlineVariant: AppColors.darkOutlineVariant,
      // Misc
      inverseSurface: AppColors.lightSurface,
      onInverseSurface: AppColors.lightOnSurface,
      inversePrimary: AppColors.primary700,
      shadow: const Color(0x40000000),
      scrim: const Color(0x66000000),
    );

    final textTheme =
        AppTypography.textTheme(color: AppColors.darkOnSurface);

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.darkBackground,
      splashFactory: InkSparkle.splashFactory,

      // ── App Bar ───────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.darkOnSurface,
        titleTextStyle:
            AppTypography.headlineMedium(color: AppColors.darkOnSurface),
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),

      // ── Card ──────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusCard,
          side: const BorderSide(
            color: AppColors.cardBorderDark,
            width: 1,
          ),
        ),
        color: AppColors.darkSurface,
        surfaceTintColor: Colors.transparent,
        margin: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: 6,
        ),
      ),

      // ── FAB ───────────────────────────────────────────────────────────
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary300,
        foregroundColor: AppColors.primary900,
        elevation: 2,
        focusElevation: 4,
        hoverElevation: 4,
        highlightElevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusCard),
        ),
        sizeConstraints: const BoxConstraints.tightFor(
          width: 56,
          height: 56,
        ),
      ),

      // ── Bottom Navigation ─────────────────────────────────────────────
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.darkSurface,
        selectedItemColor: AppColors.primary300,
        unselectedItemColor: AppColors.darkOnSurfaceVariant,
        selectedLabelStyle: AppTypography.labelSmall(),
        unselectedLabelStyle: AppTypography.labelSmall(),
        elevation: 0,
        selectedIconTheme: const IconThemeData(size: 24),
        unselectedIconTheme: const IconThemeData(size: 24),
      ),

      // ── Navigation Bar (Material 3) ──────────────────────────────────
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: AppColors.primary900,
        backgroundColor: AppColors.darkSurface,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        height: 64,
        labelTextStyle: WidgetStatePropertyAll(
          AppTypography.labelSmall(color: AppColors.darkOnSurface),
        ),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(
              color: AppColors.primary300,
              size: 24,
            );
          }
          return IconThemeData(
            color: AppColors.darkOnSurfaceVariant,
            size: 24,
          );
        }),
      ),

      // ── Input Decoration ──────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSurfaceVariant.withValues(alpha: 0.5),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.darkOutlineVariant,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.darkOutlineVariant,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.primary300,
            width: 1.5,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.darkError,
            width: 1,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: AppSpacing.borderRadiusButton,
          borderSide: const BorderSide(
            color: AppColors.darkError,
            width: 1.5,
          ),
        ),
        hintStyle: AppTypography.bodyMedium(
          color: AppColors.textHintDark,
        ),
        labelStyle: AppTypography.bodyMedium(
          color: AppColors.textSecondaryDark,
        ),
        floatingLabelStyle: AppTypography.labelMedium(
          color: AppColors.primary300,
        ),
      ),

      // ── Buttons ───────────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.primary300,
          foregroundColor: AppColors.primary900,
          disabledBackgroundColor: AppColors.darkOutlineVariant,
          disabledForegroundColor: AppColors.textHintDark,
          padding: AppSpacing.buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 48),
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary300,
          foregroundColor: AppColors.primary900,
          disabledBackgroundColor: AppColors.darkOutlineVariant,
          disabledForegroundColor: AppColors.textHintDark,
          padding: AppSpacing.buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 48),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary300,
          disabledForegroundColor: AppColors.textHintDark,
          padding: AppSpacing.buttonPadding,
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          side: const BorderSide(color: AppColors.primary300, width: 1),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 48),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary300,
          disabledForegroundColor: AppColors.textHintDark,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.sm,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: AppSpacing.borderRadiusButton,
          ),
          textStyle: AppTypography.labelLarge(),
          minimumSize: const Size(0, 40),
        ),
      ),

      // ── Chips ─────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusChip,
        ),
        side: BorderSide.none,
        backgroundColor: AppColors.darkSurfaceVariant,
        selectedColor: AppColors.primary900,
        labelStyle: AppTypography.labelMedium(),
        padding: AppSpacing.chipPadding,
      ),

      // ── Divider ───────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: AppColors.darkDivider,
        thickness: 1,
        space: 1,
      ),

      // ── List Tile ─────────────────────────────────────────────────────
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xs,
        ),
        dense: false,
        visualDensity: VisualDensity.comfortable,
        titleTextStyle:
            AppTypography.titleSmall(color: AppColors.darkOnSurface),
        subtitleTextStyle:
            AppTypography.bodySmall(color: AppColors.textSecondaryDark),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusButton,
        ),
      ),

      // ── Bottom Sheet ──────────────────────────────────────────────────
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.darkSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppSpacing.radiusBottomSheet),
          ),
        ),
        dragHandleColor: AppColors.darkOutline,
        dragHandleSize: Size(40, 4),
        showDragHandle: true,
      ),

      // ── Dialog ────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.darkSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius:
              BorderRadius.circular(AppSpacing.radiusDialog),
        ),
        titleTextStyle:
            AppTypography.titleLarge(color: AppColors.darkOnSurface),
        contentTextStyle:
            AppTypography.bodyMedium(color: AppColors.textSecondaryDark),
      ),

      // ── Snackbar ──────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.lightSurface,
        contentTextStyle:
            AppTypography.bodyMedium(color: AppColors.lightOnSurface),
        shape: RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusButton,
        ),
        elevation: 0,
        insetPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.sm,
        ),
      ),

      // ── Tab Bar ───────────────────────────────────────────────────────
      tabBarTheme: TabBarThemeData(
        indicatorColor: AppColors.primary300,
        labelColor: AppColors.primary300,
        unselectedLabelColor: AppColors.textSecondaryDark,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: AppTypography.labelLarge(),
        unselectedLabelStyle: AppTypography.labelLarge(),
        dividerColor: Colors.transparent,
      ),

      // ── Switch / Checkbox ─────────────────────────────────────────────
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary300;
          }
          return AppColors.darkOutline;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary800;
          }
          return AppColors.darkSurfaceVariant;
        }),
      ),

      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary300;
          }
          return Colors.transparent;
        }),
        checkColor:
            const WidgetStatePropertyAll(AppColors.primary900),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),

      // ── Progress Indicator ────────────────────────────────────────────
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary300,
        linearTrackColor: AppColors.primary900,
        circularTrackColor: AppColors.primary900,
      ),

      // ── Tooltip ───────────────────────────────────────────────────────
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: AppColors.lightSurface,
          borderRadius: AppSpacing.borderRadiusButton,
        ),
        textStyle:
            AppTypography.bodySmall(color: AppColors.lightOnSurface),
      ),

      // ── Page Transitions ──────────────────────────────────────────────
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),

      // ── Visual Density ────────────────────────────────────────────────
      visualDensity: VisualDensity.comfortable,
    );
  }
}
