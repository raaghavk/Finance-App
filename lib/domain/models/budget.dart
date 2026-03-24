import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/budget_mode.dart';
import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/core/enums/sync_status.dart';

part 'budget.freezed.dart';
part 'budget.g.dart';

/// A spending budget that tracks limits over a time period.
@freezed
class Budget with _$Budget {
  const factory Budget({
    /// Unique identifier (UUID v4).
    required String id,

    /// User-facing name for the budget.
    required String name,

    /// Maximum spending allowed during the period.
    required double limitAmount,

    /// How often the budget resets.
    required BudgetPeriod period,

    /// Start date of the current budget cycle.
    required DateTime startDate,

    /// End date of the current budget cycle.
    DateTime? endDate,

    /// Whether the budget tracks specific categories or overall spending.
    @Default(BudgetMode.category) BudgetMode mode,

    /// Whether the budget is currently active.
    @Default(true) bool isActive,

    /// List of category IDs this budget tracks (when mode is category).
    @Default([]) List<String> categoryIds,

    /// Cloud sync status.
    @Default(SyncStatus.pending) SyncStatus syncStatus,

    /// When the record was created locally.
    required DateTime createdAt,

    /// When the record was last updated.
    required DateTime updatedAt,

    /// Soft-delete flag.
    @Default(false) bool isDeleted,
  }) = _Budget;

  factory Budget.fromJson(Map<String, dynamic> json) =>
      _$BudgetFromJson(json);
}
