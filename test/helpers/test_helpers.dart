import 'package:mocktail/mocktail.dart';
import 'package:paisa_track/core/enums/budget_mode.dart';
import 'package:paisa_track/core/enums/budget_period.dart';
import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/repositories/budget_repository.dart';
import 'package:paisa_track/domain/repositories/transaction_repository.dart';

// ──────────────────────────────────────────────────────────────────────────────
// Mock classes
// ──────────────────────────────────────────────────────────────────────────────

class MockTransactionRepository extends Mock
    implements TransactionRepository {}

class MockBudgetRepository extends Mock implements BudgetRepository {}

// ──────────────────────────────────────────────────────────────────────────────
// Factory helpers
// ──────────────────────────────────────────────────────────────────────────────

/// Creates a [Transaction] with sensible defaults. Every field can be
/// overridden.
Transaction makeTransaction({
  String id = 'txn_001',
  double amount = 100.0,
  String originalCurrency = 'INR',
  double? originalAmount,
  double? exchangeRate,
  TransactionType type = TransactionType.expense,
  String categoryId = 'cat_groceries',
  String accountId = 'acc_cash',
  String? toAccountId,
  String note = '',
  String? receiptImagePath,
  DateTime? transactionDate,
  InputSource inputSource = InputSource.manual,
  String? recurringId,
  SyncStatus syncStatus = SyncStatus.pending,
  DateTime? createdAt,
  DateTime? updatedAt,
  bool isDeleted = false,
}) {
  final now = DateTime.now();
  return Transaction(
    id: id,
    amount: amount,
    originalCurrency: originalCurrency,
    originalAmount: originalAmount,
    exchangeRate: exchangeRate,
    type: type,
    categoryId: categoryId,
    accountId: accountId,
    toAccountId: toAccountId,
    note: note,
    receiptImagePath: receiptImagePath,
    transactionDate: transactionDate ?? now,
    inputSource: inputSource,
    recurringId: recurringId,
    syncStatus: syncStatus,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
    isDeleted: isDeleted,
  );
}

/// Creates a [Budget] with sensible defaults.
Budget makeBudget({
  String id = 'budget_001',
  String name = 'Groceries Budget',
  double limitAmount = 5000.0,
  BudgetPeriod period = BudgetPeriod.monthly,
  DateTime? startDate,
  DateTime? endDate,
  BudgetMode mode = BudgetMode.manual,
  bool isActive = true,
  List<String> categoryIds = const ['cat_groceries'],
  SyncStatus syncStatus = SyncStatus.pending,
  DateTime? createdAt,
  DateTime? updatedAt,
  bool isDeleted = false,
}) {
  final now = DateTime.now();
  return Budget(
    id: id,
    name: name,
    limitAmount: limitAmount,
    period: period,
    startDate: startDate ?? DateTime(now.year, now.month, 1),
    endDate: endDate,
    mode: mode,
    isActive: isActive,
    categoryIds: categoryIds,
    syncStatus: syncStatus,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
    isDeleted: isDeleted,
  );
}

/// Creates a list of [Transaction] objects for batch testing.
List<Transaction> makeTransactionList(
  int count, {
  String? categoryId,
  TransactionType? type,
  DateTime? baseDate,
  double? amount,
}) {
  final base = baseDate ?? DateTime.now();
  return List.generate(
    count,
    (i) => makeTransaction(
      id: 'txn_${i.toString().padLeft(3, '0')}',
      amount: amount ?? (100.0 + i * 10),
      categoryId: categoryId ?? 'cat_groceries',
      type: type ?? TransactionType.expense,
      transactionDate: base.subtract(Duration(days: i)),
    ),
  );
}
