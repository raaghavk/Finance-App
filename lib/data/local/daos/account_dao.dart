import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/accounts_table.dart';
import 'package:paisa_track/data/local/database/tables/transactions_table.dart';

part 'account_dao.g.dart';

@DriftAccessor(tables: [AccountsTable, TransactionsTable])
class AccountDao extends DatabaseAccessor<AppDatabase>
    with _$AccountDaoMixin {
  AccountDao(super.db);

  // ── Streams ───────────────────────────────────────────────────────────

  /// Watch all non-deleted, active accounts ordered by [sortOrder].
  Stream<List<AccountsTableData>> watchActiveAccounts() {
    return (select(accountsTable)
          ..where((a) =>
              a.isActive.equals(true) & a.isDeleted.equals(false))
          ..orderBy([(a) => OrderingTerm.asc(a.sortOrder)]))
        .watch();
  }

  // ── Reads ─────────────────────────────────────────────────────────────

  /// Fetch a single account by [id].
  Future<AccountsTableData?> getAccountById(String id) {
    return (select(accountsTable)..where((a) => a.id.equals(id)))
        .getSingleOrNull();
  }

  /// Calculate the current balance for an account.
  ///
  /// Balance = initialBalance + Σ income − Σ expense
  ///         + Σ transfers-in − Σ transfers-out.
  Future<double> getAccountBalance(String id) async {
    // Fetch initial balance.
    final account = await getAccountById(id);
    if (account == null) return 0.0;

    final double initial = account.initialBalance;

    // Income & expense on this account.
    final incomeSum = transactionsTable.amount.sum();
    final incomeQuery = selectOnly(transactionsTable)
      ..addColumns([incomeSum])
      ..where(transactionsTable.accountId.equals(id) &
          transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(TransactionType.income));
    final incomeRow = await incomeQuery.getSingle();
    final double totalIncome = incomeRow.read(incomeSum) ?? 0.0;

    final expenseSum = transactionsTable.amount.sum();
    final expenseQuery = selectOnly(transactionsTable)
      ..addColumns([expenseSum])
      ..where(transactionsTable.accountId.equals(id) &
          transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(TransactionType.expense));
    final expenseRow = await expenseQuery.getSingle();
    final double totalExpense = expenseRow.read(expenseSum) ?? 0.0;

    // Transfers out (this account is source).
    final transferOutSum = transactionsTable.amount.sum();
    final transferOutQuery = selectOnly(transactionsTable)
      ..addColumns([transferOutSum])
      ..where(transactionsTable.accountId.equals(id) &
          transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(TransactionType.transfer));
    final transferOutRow = await transferOutQuery.getSingle();
    final double totalTransferOut =
        transferOutRow.read(transferOutSum) ?? 0.0;

    // Transfers in (this account is destination).
    final transferInSum = transactionsTable.amount.sum();
    final transferInQuery = selectOnly(transactionsTable)
      ..addColumns([transferInSum])
      ..where(transactionsTable.toAccountId.equals(id) &
          transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(TransactionType.transfer));
    final transferInRow = await transferInQuery.getSingle();
    final double totalTransferIn =
        transferInRow.read(transferInSum) ?? 0.0;

    return initial + totalIncome - totalExpense - totalTransferOut + totalTransferIn;
  }

  // ── Mutations ─────────────────────────────────────────────────────────

  /// Insert a new account.
  Future<void> insertAccount(AccountsTableCompanion entry) {
    return into(accountsTable).insert(entry);
  }

  /// Update an existing account.
  Future<void> updateAccount(AccountsTableCompanion entry) {
    return (update(accountsTable)
          ..where((a) => a.id.equals(entry.id.value)))
        .write(entry);
  }

  /// Soft-delete an account and flag for sync.
  Future<void> softDeleteAccount(String id) {
    return (update(accountsTable)..where((a) => a.id.equals(id))).write(
      AccountsTableCompanion(
        isDeleted: const Value(true),
        syncStatus: Value(SyncStatus.pending.index),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }
}
