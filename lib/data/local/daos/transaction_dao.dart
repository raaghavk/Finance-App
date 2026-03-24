import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';
import 'package:paisa_track/data/local/database/tables/transactions_table.dart';

part 'transaction_dao.g.dart';

/// Holds aggregated spending data for a single category.
class CategorySpending {
  CategorySpending({
    required this.categoryId,
    required this.categoryName,
    required this.total,
  });

  final String categoryId;
  final String categoryName;
  final double total;
}

@DriftAccessor(tables: [TransactionsTable, CategoriesTable])
class TransactionDao extends DatabaseAccessor<AppDatabase>
    with _$TransactionDaoMixin {
  TransactionDao(super.db);

  // ── Streams ───────────────────────────────────────────────────────────

  /// Watch all non-deleted transactions ordered by date descending.
  Stream<List<TransactionsTableData>> watchAllTransactions() {
    return (select(transactionsTable)
          ..where((t) => t.isDeleted.equals(false))
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.transactionDate, mode: OrderingMode.desc),
          ]))
        .watch();
  }

  /// Watch transactions within [start] – [end] (inclusive).
  Stream<List<TransactionsTableData>> watchTransactionsByDateRange(
    DateTime start,
    DateTime end,
  ) {
    return (select(transactionsTable)
          ..where((t) =>
              t.isDeleted.equals(false) &
              t.transactionDate.isBiggerOrEqualValue(start) &
              t.transactionDate.isSmallerOrEqualValue(end))
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.transactionDate, mode: OrderingMode.desc),
          ]))
        .watch();
  }

  /// Watch transactions belonging to a specific category.
  Stream<List<TransactionsTableData>> watchTransactionsByCategory(
    String categoryId,
  ) {
    return (select(transactionsTable)
          ..where((t) =>
              t.isDeleted.equals(false) &
              t.categoryId.equals(categoryId))
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.transactionDate, mode: OrderingMode.desc),
          ]))
        .watch();
  }

  // ── Single reads ──────────────────────────────────────────────────────

  /// Fetch a single transaction by its [id], or `null` if not found.
  Future<TransactionsTableData?> getTransactionById(String id) {
    return (select(transactionsTable)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  // ── Mutations ─────────────────────────────────────────────────────────

  /// Insert a new transaction.
  Future<void> insertTransaction(TransactionsTableCompanion entry) {
    return into(transactionsTable).insert(entry);
  }

  /// Update an existing transaction.
  Future<void> updateTransaction(TransactionsTableCompanion entry) {
    return (update(transactionsTable)
          ..where((t) => t.id.equals(entry.id.value)))
        .write(entry);
  }

  /// Mark a transaction as deleted (soft-delete) and flag for sync.
  Future<void> softDeleteTransaction(String id) {
    return (update(transactionsTable)..where((t) => t.id.equals(id))).write(
      TransactionsTableCompanion(
        isDeleted: const Value(true),
        syncStatus: Value(SyncStatus.pending.index),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }

  // ── Search ────────────────────────────────────────────────────────────

  /// Full-text-ish search on the [note] column.
  Stream<List<TransactionsTableData>> searchTransactions(String query) {
    return (select(transactionsTable)
          ..where((t) =>
              t.isDeleted.equals(false) &
              t.note.like('%$query%'))
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.transactionDate, mode: OrderingMode.desc),
          ]))
        .watch();
  }

  // ── Aggregates ────────────────────────────────────────────────────────

  /// Sum of [amount] for a given [type] within a date range.
  Future<double> getTotalByType(
    TransactionType type,
    DateTime start,
    DateTime end,
  ) async {
    final sumExpr = transactionsTable.amount.sum();
    final query = selectOnly(transactionsTable)
      ..addColumns([sumExpr])
      ..where(transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(type) &
          transactionsTable.transactionDate.isBiggerOrEqualValue(start) &
          transactionsTable.transactionDate.isSmallerOrEqualValue(end));

    final row = await query.getSingle();
    return row.read(sumExpr) ?? 0.0;
  }

  /// Spending grouped by category within a date range (expense only).
  Future<List<CategorySpending>> getSpendingByCategory(
    DateTime start,
    DateTime end,
  ) async {
    final sumExpr = transactionsTable.amount.sum();

    final query = selectOnly(transactionsTable)
        .join([
      innerJoin(
        categoriesTable,
        categoriesTable.id.equalsExp(transactionsTable.categoryId),
      ),
    ])
      ..addColumns([
        transactionsTable.categoryId,
        categoriesTable.name,
        sumExpr,
      ])
      ..where(transactionsTable.isDeleted.equals(false) &
          transactionsTable.type.equalsValue(TransactionType.expense) &
          transactionsTable.transactionDate.isBiggerOrEqualValue(start) &
          transactionsTable.transactionDate.isSmallerOrEqualValue(end))
      ..groupBy([transactionsTable.categoryId]);

    final rows = await query.get();

    return rows.map((row) {
      return CategorySpending(
        categoryId: row.read(transactionsTable.categoryId)!,
        categoryName: row.read(categoriesTable.name)!,
        total: row.read(sumExpr) ?? 0.0,
      );
    }).toList();
  }
}
