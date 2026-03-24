/// Chip variants for PaisaTrack.
///
/// Provides category chips (icon + text with tinted background), filter chips
/// (toggleable outlined), status chips (semantic: income/expense/transfer),
/// and compact badges (PRO, NEW, counts).
library;

import 'package:flutter/material.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/theme/app_spacing.dart';
import 'package:paisa_track/core/theme/app_typography.dart';

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORY CHIP — Icon + text, tinted background
// ══════════════════════════════════════════════════════════════════════════════

class CategoryChip extends StatelessWidget {
  const CategoryChip({
    super.key,
    required this.label,
    this.icon,
    this.color,
    this.onTap,
  });

  /// Display text.
  final String label;

  /// Optional leading icon.
  final IconData? icon;

  /// Background tint and icon/text colour. Defaults to primary teal.
  final Color? color;

  /// Called when tapped.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = color ??
        (isDark ? AppColors.primary300 : AppColors.primary);
    final bgColor = baseColor.withValues(alpha: isDark ? 0.15 : 0.10);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppSpacing.borderRadiusChip,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: AppSpacing.borderRadiusChip,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 16, color: baseColor),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: AppTypography.labelMedium(color: baseColor),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILTER CHIP — Outlined, toggleable selected state
// ══════════════════════════════════════════════════════════════════════════════

class AppFilterChip extends StatelessWidget {
  const AppFilterChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onSelected,
    this.icon,
  });

  /// Display text.
  final String label;

  /// Whether the chip is currently selected.
  final bool isSelected;

  /// Called when the chip's selection state changes.
  final ValueChanged<bool> onSelected;

  /// Optional leading icon.
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppColors.primary300 : AppColors.primary;
    final surfaceColor =
        isDark ? AppColors.darkSurface : AppColors.lightSurface;
    final borderColor =
        isDark ? AppColors.darkOutlineVariant : AppColors.lightOutlineVariant;
    final textColor = isDark
        ? AppColors.darkOnSurfaceVariant
        : AppColors.lightOnSurfaceVariant;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onSelected(!isSelected),
        borderRadius: AppSpacing.borderRadiusChip,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOutCubic,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            color: isSelected
                ? primaryColor.withValues(alpha: isDark ? 0.15 : 0.10)
                : surfaceColor,
            borderRadius: AppSpacing.borderRadiusChip,
            border: Border.all(
              color: isSelected ? primaryColor : borderColor,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  size: 16,
                  color: isSelected ? primaryColor : textColor,
                ),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: AppTypography.labelMedium(
                  color: isSelected ? primaryColor : textColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// STATUS CHIP — Filled with semantic colour (income / expense / transfer)
// ══════════════════════════════════════════════════════════════════════════════

enum TransactionType { income, expense, transfer }

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.type,
    this.label,
  });

  /// Determines colour and default label.
  final TransactionType type;

  /// Override the default label derived from [type].
  final String? label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final (Color fg, Color bg, String defaultLabel) = switch (type) {
      TransactionType.income => (
          isDark ? AppColors.income : AppColors.incomeDark,
          isDark ? AppColors.income.withValues(alpha: 0.15) : AppColors.incomeLight,
          'Income',
        ),
      TransactionType.expense => (
          isDark ? AppColors.expense : AppColors.expenseDark,
          isDark ? AppColors.expense.withValues(alpha: 0.15) : AppColors.expenseLight,
          'Expense',
        ),
      TransactionType.transfer => (
          isDark ? AppColors.transfer : AppColors.transferDark,
          isDark ? AppColors.transfer.withValues(alpha: 0.15) : AppColors.transferLight,
          'Transfer',
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppSpacing.borderRadiusChip,
      ),
      child: Text(
        label ?? defaultLabel,
        style: AppTypography.labelSmall(color: fg),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BADGE — Small pill for "PRO", "NEW", counts
// ══════════════════════════════════════════════════════════════════════════════

class AppBadge extends StatelessWidget {
  const AppBadge({
    super.key,
    required this.label,
    this.color,
    this.textColor,
  });

  /// Short text: "PRO", "NEW", "3", etc.
  final String label;

  /// Badge background colour. Defaults to secondary (saffron).
  final Color? color;

  /// Badge text colour. Defaults to white.
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppColors.secondary;
    final fgColor = textColor ?? Colors.white;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: AppTypography.labelSmall(color: fgColor).copyWith(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          height: 1.4,
        ),
      ),
    );
  }
}
