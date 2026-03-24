/// Reusable button variants for PaisaTrack.
///
/// Provides primary (filled teal), secondary (outlined), text, and danger
/// variants. All support a loading state where a spinner replaces the label,
/// and a disabled state with muted styling.
library;

import 'package:flutter/material.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/theme/app_spacing.dart';
import 'package:paisa_track/core/theme/app_typography.dart';

enum _AppButtonVariant { primary, secondary, text, danger }

class AppButton extends StatelessWidget {
  const AppButton.primary({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isExpanded = false,
    this.size = AppButtonSize.medium,
  }) : _variant = _AppButtonVariant.primary;

  const AppButton.secondary({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isExpanded = false,
    this.size = AppButtonSize.medium,
  }) : _variant = _AppButtonVariant.secondary;

  const AppButton.text({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isExpanded = false,
    this.size = AppButtonSize.medium,
  }) : _variant = _AppButtonVariant.text;

  const AppButton.danger({
    super.key,
    required this.label,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.isExpanded = false,
    this.size = AppButtonSize.medium,
  }) : _variant = _AppButtonVariant.danger;

  /// The button label text.
  final String label;

  /// Called when the button is pressed. If null, the button is disabled.
  final VoidCallback? onPressed;

  /// Optional leading icon.
  final IconData? icon;

  /// When true, shows a circular progress indicator instead of the label.
  final bool isLoading;

  /// When true, the button stretches to fill available width.
  final bool isExpanded;

  /// Button size variant.
  final AppButtonSize size;

  final _AppButtonVariant _variant;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveOnPressed = isLoading ? null : onPressed;

    final height = switch (size) {
      AppButtonSize.small => 36.0,
      AppButtonSize.medium => 48.0,
      AppButtonSize.large => 56.0,
    };

    final padding = switch (size) {
      AppButtonSize.small => const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
      AppButtonSize.medium => AppSpacing.buttonPadding,
      AppButtonSize.large => const EdgeInsets.symmetric(
          horizontal: AppSpacing.xxl, vertical: AppSpacing.lg),
    };

    final textStyle = switch (size) {
      AppButtonSize.small => AppTypography.labelMedium(),
      AppButtonSize.medium => AppTypography.labelLarge(),
      AppButtonSize.large => AppTypography.titleSmall(),
    };

    final spinnerSize = switch (size) {
      AppButtonSize.small => 14.0,
      AppButtonSize.medium => 18.0,
      AppButtonSize.large => 22.0,
    };

    Widget buttonChild = _buildChild(
      context,
      textStyle: textStyle,
      spinnerSize: spinnerSize,
      isDark: isDark,
    );

    final shape = RoundedRectangleBorder(
      borderRadius: AppSpacing.borderRadiusButton,
    );

    final minimumSize = Size(isExpanded ? double.infinity : 0, height);

    Widget button = switch (_variant) {
      _AppButtonVariant.primary => FilledButton(
          onPressed: effectiveOnPressed,
          style: FilledButton.styleFrom(
            backgroundColor:
                isDark ? AppColors.primary300 : AppColors.primary,
            foregroundColor:
                isDark ? AppColors.primary900 : Colors.white,
            disabledBackgroundColor:
                isDark ? AppColors.darkOutlineVariant : AppColors.lightOutlineVariant,
            disabledForegroundColor:
                isDark ? AppColors.textHintDark : AppColors.textHint,
            padding: padding,
            shape: shape,
            textStyle: textStyle,
            minimumSize: minimumSize,
          ),
          child: buttonChild,
        ),
      _AppButtonVariant.secondary => OutlinedButton(
          onPressed: effectiveOnPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor:
                isDark ? AppColors.primary300 : AppColors.primary,
            disabledForegroundColor:
                isDark ? AppColors.textHintDark : AppColors.textHint,
            padding: padding,
            shape: shape,
            side: BorderSide(
              color: effectiveOnPressed != null
                  ? (isDark ? AppColors.primary300 : AppColors.primary)
                  : (isDark
                      ? AppColors.darkOutlineVariant
                      : AppColors.lightOutlineVariant),
              width: 1,
            ),
            textStyle: textStyle,
            minimumSize: minimumSize,
          ),
          child: buttonChild,
        ),
      _AppButtonVariant.text => TextButton(
          onPressed: effectiveOnPressed,
          style: TextButton.styleFrom(
            foregroundColor:
                isDark ? AppColors.primary300 : AppColors.primary,
            disabledForegroundColor:
                isDark ? AppColors.textHintDark : AppColors.textHint,
            padding: padding,
            shape: shape,
            textStyle: textStyle,
            minimumSize: minimumSize,
          ),
          child: buttonChild,
        ),
      _AppButtonVariant.danger => FilledButton(
          onPressed: effectiveOnPressed,
          style: FilledButton.styleFrom(
            backgroundColor:
                isDark ? AppColors.expense : AppColors.expense,
            foregroundColor: Colors.white,
            disabledBackgroundColor:
                isDark ? AppColors.darkOutlineVariant : AppColors.lightOutlineVariant,
            disabledForegroundColor:
                isDark ? AppColors.textHintDark : AppColors.textHint,
            padding: padding,
            shape: shape,
            textStyle: textStyle,
            minimumSize: minimumSize,
          ),
          child: buttonChild,
        ),
    };

    return button;
  }

  Widget _buildChild(
    BuildContext context, {
    required TextStyle textStyle,
    required double spinnerSize,
    required bool isDark,
  }) {
    if (isLoading) {
      final spinnerColor = switch (_variant) {
        _AppButtonVariant.primary =>
          isDark ? AppColors.primary900 : Colors.white,
        _AppButtonVariant.secondary =>
          isDark ? AppColors.primary300 : AppColors.primary,
        _AppButtonVariant.text =>
          isDark ? AppColors.primary300 : AppColors.primary,
        _AppButtonVariant.danger => Colors.white,
      };

      return SizedBox(
        width: spinnerSize,
        height: spinnerSize,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(spinnerColor),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: spinnerSize + 2),
          const SizedBox(width: AppSpacing.sm),
          Text(label),
        ],
      );
    }

    return Text(label);
  }
}

enum AppButtonSize { small, medium, large }
