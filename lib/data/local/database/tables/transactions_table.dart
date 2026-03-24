import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/tables/accounts_table.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';

/// Stores every financial transaction the user records.
class TransactionsTable extends Table {
  @override
  String get tableName => 'transactions';

  /// Unique identifier (UUID v4).
  TextColumn get id => text()();

  /// Transaction amount in the primary (display) currency.
  RealColumn get amount => real()();

  /// ISO 4217 code of the currency the user originally entered.
  TextColumn get originalCurrency => text().withDefault(const Constant('INR'))();

  /// Amount in the original currency before conversion. Null when no
  /// conversion was needed.
  RealColumn get originalAmount => real().nullable()();

  /// Exchange rate used for conversion (original → primary). Null when
  /// no conversion was needed.
  RealColumn get exchangeRate => real().nullable()();

  /// Whether this is income, expense, or a transfer.
  IntColumn get type => intEnum<TransactionType>()();

  /// Foreign key → [CategoriesTable.id].
  TextColumn get categoryId =>
      text().references(CategoriesTable, #id)();

  /// Foreign key → [AccountsTable.id] (source account).
  TextColumn get accountId =>
      text().references(AccountsTable, #id)();

  /// Destination account for transfers. Null for income / expense.
  TextColumn get toAccountId =>
      text().nullable().references(AccountsTable, #id)();

  /// User-provided note or description.
  TextColumn get note => text().withDefault(const Constant(''))();

  /// Local file path of an attached receipt image.
  TextColumn get receiptImagePath => text().nullable()();

  /// When the transaction actually occurred.
  DateTimeColumn get transactionDate => dateTime()();

  /// How the transaction was entered: manual, voice, chat, ocr, sms.
  TextColumn get inputSource =>
      text().withDefault(const Constant('manual'))();

  /// If generated from a recurring rule, references its id.
  TextColumn get recurringId => text().nullable()();

  /// Cloud sync status.
  IntColumn get syncStatus =>
      intEnum<SyncStatus>().withDefault(const Constant(0))();

  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  DateTimeColumn get updatedAt =>
      dateTime().withDefault(currentDateAndTime)();

  /// Soft-delete flag.
  BoolColumn get isDeleted =>
      boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {id};
}
