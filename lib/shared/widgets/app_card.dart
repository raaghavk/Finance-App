/// Reusable minimalist card for PaisaTrack.
///
/// Clean surface with no elevation and a subtle border, consistent with
/// the design system. Supports optional tap interaction, header with
/// title + action, and adapts to light/dark mode.
library;

import 'package:flutter/material.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/theme/app_shadows.dart';
import 'package:paisa_track/core/theme/app_spacing.dart';
import 'package:paisa_track/core/theme/app_typography.dart';

class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
    this.title,
    this.action,
    this.backgroundColor,
    this.borderColor,
    this.showShadow = false,
  });

  /// The card's main content.
  final Widget child;

  /// Called when the card is tapped. If null, the card is not interactive.
  final VoidCallback? onTap;

  /// Internal padding. Defaults to [AppSpacing.cardPadding].
  final EdgeInsetsGeometry? padding;

  /// External margin. Defaults to no margin.
  final EdgeInsetsGeometry? margin;

  /// Optional header title displayed above the content.
  final String? title;

  /// Optional action widget displayed at the trailing end of the header.
  final Widget? action;

  /// Override background color. Defaults to theme surface color.
  final Color? backgroundColor;

  /// Override border color. Defaults to the theme-aware card border.
  final Color? borderColor;

  /// Whether to show a subtle shadow (light mode only).
  final bool showShadow;

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;

    final bgColor = backgroundColor ??
        (isDark ? AppColors.darkSurface : AppColors.lightSurface);
    final border = borderColor ??
        (isDark ? AppColors.cardBorderDark : AppColors.cardBorderLight);

    final hasHeader = title != null || action != null;

    final cardContent = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (hasHeader) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (title != null)
                Expanded(
                  child: Text(
                    title!,
                    style: AppTypography.titleSmall(
                      color: isDark
                          ? AppColors.darkOnSurface
                          : AppColors.lightOnSurface,
                    ),
                  ),
                ),
              if (action != null) action!,
            ],
          ),
          const SizedBox(height: AppSpacing.md),
        ],
        child,
      ],
    );

    final decoration = BoxDecoration(
      color: bgColor,
      borderRadius: AppSpacing.borderRadiusCard,
      border: Border.all(color: border, width: 1),
      boxShadow: showShadow ? AppShadows.sm(brightness) : AppShadows.none,
    );

    final content = Container(
      margin: margin,
      decoration: decoration,
      padding: padding ?? AppSpacing.cardPadding,
      child: cardContent,
    );

    if (onTap == null) return content;

    return Padding(
      padding: margin ?? EdgeInsets.zero,
      child: Material(
        color: Colors.transparent,
        borderRadius: AppSpacing.borderRadiusCard,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppSpacing.borderRadiusCard,
          splashColor: (isDark ? AppColors.primary300 : AppColors.primary)
              .withValues(alpha: 0.08),
          highlightColor: (isDark ? AppColors.primary300 : AppColors.primary)
              .withValues(alpha: 0.04),
          child: Container(
            decoration: decoration,
            padding: padding ?? AppSpacing.cardPadding,
            child: cardContent,
          ),
        ),
      ),
    );
  }
}
