import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/transaction.dart';

/// Contract for transaction data access.
abstract class TransactionRepository {
  /// Stream of all non-deleted transactions, ordered by date descending.
  Stream<List<Transaction>> watchAll();

  /// Stream of transactions within [start] to [end] inclusive.
  Stream<List<Transaction>> watchByDateRange(DateTime start, DateTime end);

  /// Stream of transactions for a specific [categoryId].
  Stream<List<Transaction>> watchByCategory(String categoryId);

  /// Fetch a single transaction by [id]. Returns null if not found.
  Future<Transaction?> getById(String id);

  /// Insert a new transaction.
  Future<void> add(Transaction transaction);

  /// Update an existing transaction.
  Future<void> update(Transaction transaction);

  /// Soft-delete a transaction by [id].
  Future<void> delete(String id);

  /// Full-text search across notes and category names.
  Future<List<Transaction>> search(String query);

  /// Get the total amount for a given [type] within a date range.
  Future<double> getTotalByType(
    TransactionType type, {
    required DateTime start,
    required DateTime end,
  });

  /// Get a map of category ID -> total spent within a date range.
  Future<Map<String, double>> getSpendingByCategory({
    required DateTime start,
    required DateTime end,
  });
}
