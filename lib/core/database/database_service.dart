import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/account_type.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/account.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/category.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

// Conditionally import sqflite only on non-web platforms.
import 'database_mobile.dart' if (dart.library.html) 'database_web.dart'
    as platform;

/// Abstract interface for the PaisaTrack database.
///
/// On mobile: backed by sqflite (SQLite).
/// On web: backed by in-memory Maps (session-only storage).
abstract class DatabaseService {
  static DatabaseService? _instance;

  static DatabaseService get instance {
    _instance ??= platform.createDatabaseService();
    return _instance!;
  }

  Future<void> initialize();

  // ── TRANSACTIONS ──────────────────────────────────────────────────────
  Future<List<Transaction>> getTransactions({
    DateTime? startDate,
    DateTime? endDate,
    String? accountId,
    String? categoryId,
  });
  Future<Transaction?> getTransaction(String id);
  Future<void> insertTransaction(Transaction t);
  Future<void> updateTransaction(Transaction t);
  Future<void> deleteTransaction(String id);

  // ── CATEGORIES ────────────────────────────────────────────────────────
  Future<List<Category>> getCategories({String? type});
  Future<Category?> getCategory(String id);
  Future<void> insertCategory(Category c);

  // ── ACCOUNTS ──────────────────────────────────────────────────────────
  Future<List<Account>> getAccounts();
  Future<Account?> getAccount(String id);
  Future<void> insertAccount(Account a);
  Future<void> updateAccount(Account a);
  Future<void> deleteAccount(String id);

  // ── BUDGETS ───────────────────────────────────────────────────────────
  Future<List<Budget>> getBudgets();
  Future<void> insertBudget(Budget b);
  Future<void> updateBudget(Budget b);
  Future<void> deleteBudget(String id);

  // ── SETTINGS ──────────────────────────────────────────────────────────
  Future<UserSettings> getSettings();
  Future<void> saveSetting(String key, String value);
  Future<void> saveSettings(UserSettings settings);

  // ── AGGREGATES ────────────────────────────────────────────────────────
  Future<Map<String, double>> getMonthlyTotals(DateTime month);
  Future<double> getTotalBalance();
}

/// Shared seeding logic used by both mobile and web implementations.
mixin DatabaseSeeder {
  List<Category> seedCategories() {
    return CategoryConstants.allDefaultCategories
        .map((cat) => Category(
              id: cat.id,
              name: cat.name,
              nameHi: cat.nameHi,
              icon: cat.iconName,
              color: cat.color,
              type: cat.type == 'income'
                  ? TransactionType.income
                  : TransactionType.expense,
              isDefault: true,
              isActive: true,
            ))
        .toList();
  }

  List<Account> seedAccounts() {
    final now = DateTime.now();
    return [
      Account(
        id: 'default-cash-account',
        name: 'Cash',
        type: AccountType.cash,
        createdAt: now,
      ),
      Account(
        id: 'default-savings-account',
        name: 'Bank Account',
        type: AccountType.savings,
        icon: 'account_balance',
        color: 0xFF1976D2,
        sortOrder: 1,
        createdAt: now,
      ),
    ];
  }
}
