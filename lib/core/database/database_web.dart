import 'package:paisa_track/core/database/database_service.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/account.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/category.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

DatabaseService createDatabaseService() => WebDatabaseService();

/// In-memory database for web. Data persists during the session only.
class WebDatabaseService extends DatabaseService with DatabaseSeeder {
  final List<Transaction> _transactions = [];
  final List<Category> _categories = [];
  final List<Account> _accounts = [];
  final List<Budget> _budgets = [];
  final Map<String, String> _settings = {};
  bool _initialized = false;

  @override
  Future<void> initialize() async {
    if (_initialized) return;
    _categories.addAll(seedCategories());
    _accounts.addAll(seedAccounts());
    _initialized = true;
  }

  // ── TRANSACTIONS ──────────────────────────────────────────────────────

  @override
  Future<List<Transaction>> getTransactions({
    DateTime? startDate,
    DateTime? endDate,
    String? accountId,
    String? categoryId,
  }) async {
    await initialize();
    var result = _transactions.where((t) => !t.isDeleted);
    if (startDate != null) {
      result = result.where(
          (t) => !t.transactionDate.isBefore(startDate));
    }
    if (endDate != null) {
      result =
          result.where((t) => t.transactionDate.isBefore(endDate));
    }
    if (accountId != null) {
      result = result.where((t) => t.accountId == accountId);
    }
    if (categoryId != null) {
      result = result.where((t) => t.categoryId == categoryId);
    }
    final list = result.toList()
      ..sort((a, b) =>
          b.transactionDate.compareTo(a.transactionDate));
    return list;
  }

  @override
  Future<Transaction?> getTransaction(String id) async {
    await initialize();
    return _transactions.where((t) => t.id == id).firstOrNull;
  }

  @override
  Future<void> insertTransaction(Transaction t) async {
    await initialize();
    _transactions.removeWhere((x) => x.id == t.id);
    _transactions.add(t);
    _recalculateBalance(t.accountId);
  }

  @override
  Future<void> updateTransaction(Transaction t) async {
    await initialize();
    _transactions.removeWhere((x) => x.id == t.id);
    _transactions.add(t);
    _recalculateBalance(t.accountId);
  }

  @override
  Future<void> deleteTransaction(String id) async {
    await initialize();
    final idx = _transactions.indexWhere((t) => t.id == id);
    if (idx >= 0) {
      final t = _transactions[idx];
      _transactions[idx] = t.copyWith(isDeleted: true);
      _recalculateBalance(t.accountId);
    }
  }

  void _recalculateBalance(String accountId) {
    final idx = _accounts.indexWhere((a) => a.id == accountId);
    if (idx < 0) return;
    final account = _accounts[idx];
    double balance = account.initialBalance;
    for (final t in _transactions) {
      if (t.isDeleted || t.accountId != accountId) continue;
      if (t.type == TransactionType.income) {
        balance += t.amount;
      } else if (t.type == TransactionType.expense) {
        balance -= t.amount;
      }
    }
    _accounts[idx] = account.copyWith(currentBalance: balance);
  }

  // ── CATEGORIES ────────────────────────────────────────────────────────

  @override
  Future<List<Category>> getCategories({String? type}) async {
    await initialize();
    var result = _categories.where((c) => c.isActive);
    if (type != null) {
      result = result.where((c) => c.type.name == type);
    }
    return result.toList()
      ..sort((a, b) => a.name.compareTo(b.name));
  }

  @override
  Future<Category?> getCategory(String id) async {
    await initialize();
    return _categories.where((c) => c.id == id).firstOrNull;
  }

  @override
  Future<void> insertCategory(Category c) async {
    await initialize();
    _categories.removeWhere((x) => x.id == c.id);
    _categories.add(c);
  }

  // ── ACCOUNTS ──────────────────────────────────────────────────────────

  @override
  Future<List<Account>> getAccounts() async {
    await initialize();
    return _accounts
        .where((a) => !a.isDeleted && a.isActive)
        .toList()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
  }

  @override
  Future<Account?> getAccount(String id) async {
    await initialize();
    return _accounts.where((a) => a.id == id).firstOrNull;
  }

  @override
  Future<void> insertAccount(Account a) async {
    await initialize();
    _accounts.removeWhere((x) => x.id == a.id);
    _accounts.add(a);
  }

  @override
  Future<void> updateAccount(Account a) async {
    await initialize();
    _accounts.removeWhere((x) => x.id == a.id);
    _accounts.add(a);
  }

  @override
  Future<void> deleteAccount(String id) async {
    await initialize();
    final idx = _accounts.indexWhere((a) => a.id == id);
    if (idx >= 0) {
      _accounts[idx] = _accounts[idx].copyWith(isDeleted: true);
    }
  }

  // ── BUDGETS ───────────────────────────────────────────────────────────

  @override
  Future<List<Budget>> getBudgets() async {
    await initialize();
    return _budgets.where((b) => !b.isDeleted).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<void> insertBudget(Budget b) async {
    await initialize();
    _budgets.removeWhere((x) => x.id == b.id);
    _budgets.add(b);
  }

  @override
  Future<void> updateBudget(Budget b) async {
    await initialize();
    _budgets.removeWhere((x) => x.id == b.id);
    _budgets.add(b);
  }

  @override
  Future<void> deleteBudget(String id) async {
    await initialize();
    final idx = _budgets.indexWhere((b) => b.id == id);
    if (idx >= 0) {
      _budgets[idx] = _budgets[idx].copyWith(isDeleted: true);
    }
  }

  // ── SETTINGS ──────────────────────────────────────────────────────────

  @override
  Future<UserSettings> getSettings() async {
    await initialize();
    if (_settings.isEmpty) return const UserSettings();
    return UserSettings(
      currency: _settings['currency'] ?? 'INR',
      locale: _settings['locale'] ?? 'en',
      themeMode: _settings['theme_mode'] ?? 'system',
      notificationsEnabled:
          (_settings['notifications_enabled'] ?? '1') == '1',
      biometricEnabled:
          (_settings['biometric_enabled'] ?? '0') == '1',
      isOnboardingComplete:
          (_settings['is_onboarding_complete'] ?? '0') == '1',
      defaultAccountId: _settings['default_account_id'],
      monthlyBudgetLimit:
          double.tryParse(_settings['monthly_budget_limit'] ?? '0') ?? 0.0,
    );
  }

  @override
  Future<void> saveSetting(String key, String value) async {
    await initialize();
    _settings[key] = value;
  }

  @override
  Future<void> saveSettings(UserSettings settings) async {
    await initialize();
    _settings['currency'] = settings.currency;
    _settings['locale'] = settings.locale;
    _settings['theme_mode'] = settings.themeMode;
    _settings['notifications_enabled'] =
        settings.notificationsEnabled ? '1' : '0';
    _settings['biometric_enabled'] =
        settings.biometricEnabled ? '1' : '0';
    _settings['is_onboarding_complete'] =
        settings.isOnboardingComplete ? '1' : '0';
    _settings['monthly_budget_limit'] =
        settings.monthlyBudgetLimit.toString();
    if (settings.defaultAccountId != null) {
      _settings['default_account_id'] = settings.defaultAccountId!;
    }
  }

  // ── AGGREGATES ────────────────────────────────────────────────────────

  @override
  Future<Map<String, double>> getMonthlyTotals(DateTime month) async {
    final start = DateTime(month.year, month.month, 1);
    final end = DateTime(month.year, month.month + 1, 1);
    final txns = await getTransactions(startDate: start, endDate: end);
    double income = 0, expense = 0;
    for (final t in txns) {
      if (t.type == TransactionType.income) {
        income += t.amount;
      } else if (t.type == TransactionType.expense) {
        expense += t.amount;
      }
    }
    return {'income': income, 'expense': expense};
  }

  @override
  Future<double> getTotalBalance() async {
    final accounts = await getAccounts();
    return accounts.fold<double>(0.0, (s, a) => s + a.currentBalance);
  }
}
