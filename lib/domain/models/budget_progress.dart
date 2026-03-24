import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/domain/models/budget.dart';

part 'budget_progress.freezed.dart';
part 'budget_progress.g.dart';

/// Snapshot of how much of a budget has been consumed.
@freezed
class BudgetProgress with _$BudgetProgress {
  const factory BudgetProgress({
    /// The budget being tracked.
    required Budget budget,

    /// Total amount spent so far in this budget cycle.
    required double spent,

    /// Amount remaining before hitting the limit (can be negative).
    required double remaining,

    /// Percentage of the limit consumed (0.0 – 100.0+).
    required double percentage,

    /// Whether spending has exceeded the budget limit.
    required bool isOverBudget,
  }) = _BudgetProgress;

  factory BudgetProgress.fromJson(Map<String, dynamic> json) =>
      _$BudgetProgressFromJson(json);
}
