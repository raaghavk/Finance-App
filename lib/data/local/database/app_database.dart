import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'package:paisa_track/data/local/database/tables/accounts_table.dart';
import 'package:paisa_track/data/local/database/tables/budget_categories_table.dart';
import 'package:paisa_track/data/local/database/tables/budgets_table.dart';
import 'package:paisa_track/data/local/database/tables/categories_table.dart';
import 'package:paisa_track/data/local/database/tables/exchange_rates_table.dart';
import 'package:paisa_track/data/local/database/tables/recurring_transactions_table.dart';
import 'package:paisa_track/data/local/database/tables/reminders_table.dart';
import 'package:paisa_track/data/local/database/tables/settings_table.dart';
import 'package:paisa_track/data/local/database/tables/sync_queue_table.dart';
import 'package:paisa_track/data/local/database/tables/transactions_table.dart';

import 'package:paisa_track/data/local/daos/account_dao.dart';
import 'package:paisa_track/data/local/daos/budget_dao.dart';
import 'package:paisa_track/data/local/daos/category_dao.dart';
import 'package:paisa_track/data/local/daos/reminder_dao.dart';
import 'package:paisa_track/data/local/daos/settings_dao.dart';
import 'package:paisa_track/data/local/daos/transaction_dao.dart';

import 'package:paisa_track/data/local/migrations/migration_strategy.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    TransactionsTable,
    CategoriesTable,
    AccountsTable,
    BudgetsTable,
    BudgetCategoriesTable,
    RemindersTable,
    RecurringTransactionsTable,
    ExchangeRatesTable,
    SyncQueueTable,
    SettingsTable,
  ],
  daos: [
    TransactionDao,
    CategoryDao,
    AccountDao,
    BudgetDao,
    ReminderDao,
    SettingsDao,
  ],
)
class AppDatabase extends _$AppDatabase {
  /// Creates a database backed by the given [executor].
  AppDatabase(super.e);

  /// Convenience factory that stores the database on disk using
  /// [path_provider] to resolve the application documents directory.
  factory AppDatabase.defaults() {
    return AppDatabase(_openConnection());
  }

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => buildMigrationStrategy(this);
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'paisa_track.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
