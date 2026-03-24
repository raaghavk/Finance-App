import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/budget_progress.dart';

/// Contract for budget data access.
abstract class BudgetRepository {
  /// Stream of all active, non-deleted budgets.
  Stream<List<Budget>> watchActive();

  /// Fetch a single budget by [id]. Returns null if not found.
  Future<Budget?> getById(String id);

  /// Calculate the current progress for a budget.
  Future<BudgetProgress> getProgress(String budgetId);

  /// Insert a new budget.
  Future<void> add(Budget budget);

  /// Update an existing budget.
  Future<void> update(Budget budget);

  /// Soft-delete a budget by [id].
  Future<void> delete(String id);
}
