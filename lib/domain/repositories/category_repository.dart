import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/category.dart';

/// Contract for category data access.
abstract class CategoryRepository {
  /// Stream of all active (non-hidden) categories.
  Stream<List<Category>> watchActive();

  /// Stream of active categories filtered by [type].
  Stream<List<Category>> watchByType(TransactionType type);

  /// Get all default (built-in) categories.
  Future<List<Category>> getDefaults();

  /// Insert a new category.
  Future<void> add(Category category);

  /// Update an existing category.
  Future<void> update(Category category);

  /// Delete a category by [id]. Built-in categories are deactivated instead.
  Future<void> delete(String id);
}
