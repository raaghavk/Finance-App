import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/daos/transaction_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/transactions_table.dart';
import 'package:paisa_track/domain/models/transaction.dart' as domain;
import 'package:paisa_track/domain/repositories/transaction_repository.dart';

/// Drift-backed implementation of [TransactionRepository].
class TransactionRepositoryImpl implements TransactionRepository {
  TransactionRepositoryImpl(this._dao);

  final TransactionDao _dao;

  // ── Mapping helpers ──────────────────────────────────────────────────

  domain.Transaction _toDomain(TransactionsTableData row) {
    return domain.Transaction(
      id: row.id,
      amount: row.amount,
      originalCurrency: row.originalCurrency,
      originalAmount: row.originalAmount,
      exchangeRate: row.exchangeRate,
      type: TransactionType.values[row.type],
      categoryId: row.categoryId,
      accountId: row.accountId,
      toAccountId: row.toAccountId,
      note: row.note,
      receiptImagePath: row.receiptImagePath,
      transactionDate: row.transactionDate,
      inputSource: InputSource.values.firstWhere(
        (e) => e.name == row.inputSource,
        orElse: () => InputSource.manual,
      ),
      recurringId: row.recurringId,
      syncStatus: SyncStatus.values[row.syncStatus],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isDeleted: row.isDeleted,
    );
  }

  TransactionsTableCompanion _toCompanion(domain.Transaction t) {
    return TransactionsTableCompanion(
      id: Value(t.id),
      amount: Value(t.amount),
      originalCurrency: Value(t.originalCurrency),
      originalAmount: Value(t.originalAmount),
      exchangeRate: Value(t.exchangeRate),
      type: Value(t.type.index),
      categoryId: Value(t.categoryId),
      accountId: Value(t.accountId),
      toAccountId: Value(t.toAccountId),
      note: Value(t.note),
      receiptImagePath: Value(t.receiptImagePath),
      transactionDate: Value(t.transactionDate),
      inputSource: Value(t.inputSource.name),
      recurringId: Value(t.recurringId),
      syncStatus: Value(t.syncStatus.index),
      createdAt: Value(t.createdAt),
      updatedAt: Value(t.updatedAt),
      isDeleted: Value(t.isDeleted),
    );
  }

  // ── Streams ──────────────────────────────────────────────────────────

  @override
  Stream<List<domain.Transaction>> watchAll() {
    return _dao
        .watchAllTransactions()
        .map((rows) => rows.map(_toDomain).toList());
  }

  @override
  Stream<List<domain.Transaction>> watchByDateRange(
    DateTime start,
    DateTime end,
  ) {
    return _dao
        .watchTransactionsByDateRange(start, end)
        .map((rows) => rows.map(_toDomain).toList());
  }

  @override
  Stream<List<domain.Transaction>> watchByCategory(String categoryId) {
    return _dao
        .watchTransactionsByCategory(categoryId)
        .map((rows) => rows.map(_toDomain).toList());
  }

  // ── Single reads ─────────────────────────────────────────────────────

  @override
  Future<domain.Transaction?> getById(String id) async {
    final row = await _dao.getTransactionById(id);
    return row == null ? null : _toDomain(row);
  }

  // ── Mutations ────────────────────────────────────────────────────────

  @override
  Future<void> add(domain.Transaction transaction) {
    return _dao.insertTransaction(_toCompanion(transaction));
  }

  @override
  Future<void> update(domain.Transaction transaction) {
    return _dao.updateTransaction(_toCompanion(transaction));
  }

  @override
  Future<void> delete(String id) {
    return _dao.softDeleteTransaction(id);
  }

  // ── Search ───────────────────────────────────────────────────────────

  @override
  Future<List<domain.Transaction>> search(String query) async {
    final rows = await _dao.searchTransactions(query).first;
    return rows.map(_toDomain).toList();
  }

  // ── Aggregates ───────────────────────────────────────────────────────

  @override
  Future<double> getTotalByType(
    TransactionType type, {
    required DateTime start,
    required DateTime end,
  }) {
    return _dao.getTotalByType(type, start, end);
  }

  @override
  Future<Map<String, double>> getSpendingByCategory({
    required DateTime start,
    required DateTime end,
  }) async {
    final rows = await _dao.getSpendingByCategory(start, end);
    return {for (final row in rows) row.categoryId: row.total};
  }
}
