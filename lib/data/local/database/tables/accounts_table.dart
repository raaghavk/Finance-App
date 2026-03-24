import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';

/// User's financial accounts (cash wallet, bank accounts, credit cards, etc.).
class AccountsTable extends Table {
  @override
  String get tableName => 'accounts';

  /// Unique identifier (UUID v4).
  TextColumn get id => text()();

  /// Display name (e.g. "SBI Savings", "Paytm Wallet").
  TextColumn get name => text()();

  /// Account kind: cash, bank, wallet, credit_card, investment.
  TextColumn get type => text()();

  /// Opening balance when the account was added.
  RealColumn get initialBalance =>
      real().withDefault(const Constant(0))();

  /// ISO 4217 currency code.
  TextColumn get currency =>
      text().withDefault(const Constant('INR'))();

  /// Material icon name or codepoint.
  TextColumn get icon => text().nullable()();

  /// ARGB colour value used in the UI.
  IntColumn get color => integer().nullable()();

  /// Whether the account appears in pickers and dashboards.
  BoolColumn get isActive =>
      boolean().withDefault(const Constant(true))();

  /// User-defined ordering weight.
  IntColumn get sortOrder =>
      integer().withDefault(const Constant(0))();

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
