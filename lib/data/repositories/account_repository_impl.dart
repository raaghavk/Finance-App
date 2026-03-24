import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/account_type.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/data/local/daos/account_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/accounts_table.dart';
import 'package:paisa_track/domain/models/account.dart' as domain;
import 'package:paisa_track/domain/repositories/account_repository.dart';

/// Drift-backed implementation of [AccountRepository].
class AccountRepositoryImpl implements AccountRepository {
  AccountRepositoryImpl(this._dao);

  final AccountDao _dao;

  // ── Mapping helpers ──────────────────────────────────────────────────

  domain.Account _toDomain(AccountsTableData row, {double? balance}) {
    return domain.Account(
      id: row.id,
      name: row.name,
      type: AccountType.values.firstWhere(
        (e) => e.name == row.type,
        orElse: () => AccountType.other,
      ),
      initialBalance: row.initialBalance,
      currency: row.currency,
      icon: row.icon ?? 'account_balance_wallet',
      color: row.color ?? 0xFF4CAF50,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      currentBalance: balance ?? row.initialBalance,
      syncStatus: SyncStatus.values[row.syncStatus],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isDeleted: row.isDeleted,
    );
  }

  AccountsTableCompanion _toCompanion(domain.Account a) {
    return AccountsTableCompanion(
      id: Value(a.id),
      name: Value(a.name),
      type: Value(a.type.name),
      initialBalance: Value(a.initialBalance),
      currency: Value(a.currency),
      icon: Value(a.icon),
      color: Value(a.color),
      isActive: Value(a.isActive),
      sortOrder: Value(a.sortOrder),
      syncStatus: Value(a.syncStatus.index),
      createdAt: Value(a.createdAt),
      updatedAt: Value(a.updatedAt),
      isDeleted: Value(a.isDeleted),
    );
  }

  // ── Streams ──────────────────────────────────────────────────────────

  @override
  Stream<List<domain.Account>> watchActive() {
    return _dao.watchActiveAccounts().asyncMap((rows) async {
      final accounts = <domain.Account>[];
      for (final row in rows) {
        final balance = await _dao.getAccountBalance(row.id);
        accounts.add(_toDomain(row, balance: balance));
      }
      return accounts;
    });
  }

  // ── Single reads ─────────────────────────────────────────────────────

  @override
  Future<domain.Account?> getById(String id) async {
    final row = await _dao.getAccountById(id);
    if (row == null) return null;

    final balance = await _dao.getAccountBalance(id);
    return _toDomain(row, balance: balance);
  }

  @override
  Future<double> getBalance(String id) {
    return _dao.getAccountBalance(id);
  }

  // ── Mutations ────────────────────────────────────────────────────────

  @override
  Future<void> add(domain.Account account) {
    return _dao.insertAccount(_toCompanion(account));
  }

  @override
  Future<void> update(domain.Account account) {
    return _dao.updateAccount(_toCompanion(account));
  }

  @override
  Future<void> delete(String id) {
    return _dao.softDeleteAccount(id);
  }
}
