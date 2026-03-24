import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/tables/accounts_table.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';

/// Rules that automatically generate transactions on a schedule.
class RecurringTransactionsTable extends Table {
  @override
  String get tableName => 'recurring_transactions';

  /// Unique identifier (UUID v4).
  TextColumn get id => text()();

  /// Fixed amount for each generated transaction.
  RealColumn get amount => real()();

  /// Whether the recurring entry produces income, expense, or transfer.
  IntColumn get type => intEnum<TransactionType>()();

  /// Foreign key → [CategoriesTable.id].
  TextColumn get categoryId =>
      text().references(CategoriesTable, #id)();

  /// Foreign key → [AccountsTable.id].
  TextColumn get accountId =>
      text().references(AccountsTable, #id)();

  /// Description copied into each generated transaction.
  TextColumn get note => text().withDefault(const Constant(''))();

  /// Recurrence rule (e.g. "daily", "weekly", "monthly", RRULE string).
  TextColumn get recurrence => text()();

  /// When the rule first became active.
  DateTimeColumn get startDate => dateTime()();

  /// Next scheduled execution date.
  DateTimeColumn get nextDate => dateTime()();

  /// Optional end date after which no more transactions are generated.
  DateTimeColumn get endDate => dateTime().nullable()();

  /// Whether this rule is still running.
  BoolColumn get isActive =>
      boolean().withDefault(const Constant(true))();

  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
