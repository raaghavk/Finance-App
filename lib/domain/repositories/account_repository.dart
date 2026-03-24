import 'package:paisa_track/domain/models/account.dart';

/// Contract for account data access.
abstract class AccountRepository {
  /// Stream of all active, non-deleted accounts.
  Stream<List<Account>> watchActive();

  /// Fetch a single account by [id]. Returns null if not found.
  Future<Account?> getById(String id);

  /// Get the current balance for an account by [id].
  Future<double> getBalance(String id);

  /// Insert a new account.
  Future<void> add(Account account);

  /// Update an existing account.
  Future<void> update(Account account);

  /// Soft-delete an account by [id].
  Future<void> delete(String id);
}
