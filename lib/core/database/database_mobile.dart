import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/database/database_service.dart';
import 'package:paisa_track/core/enums/account_type.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/account.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/category.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

DatabaseService createDatabaseService() => MobileDatabaseService();

/// SQLite database for mobile (Android/iOS).
class MobileDatabaseService extends DatabaseService {
  Database? _db;

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  @override
  Future<void> initialize() async {
    await database; // triggers _initDb if needed
  }

  Future<Database> _initDb() async {
    final path = join(await getDatabasesPath(), 'paisa_track.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        initial_balance REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        icon TEXT NOT NULL DEFAULT 'account_balance_wallet',
        color INTEGER NOT NULL DEFAULT 4284513675,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        current_balance REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    ''');
    await db.execute('''
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_hi TEXT NOT NULL DEFAULT '',
        icon TEXT NOT NULL,
        color INTEGER NOT NULL,
        type TEXT NOT NULL,
        is_default INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    ''');
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        receipt_image_path TEXT,
        transaction_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    ''');
    await db.execute('''
      CREATE TABLE budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        limit_amount REAL NOT NULL,
        start_date TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        category_ids TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    ''');
    await db.execute('''
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    ''');

    // Seed data
    for (final cat in CategoryConstants.allDefaultCategories) {
      await db.insert('categories', {
        'id': cat.id,
        'name': cat.name,
        'name_hi': cat.nameHi,
        'icon': cat.iconName,
        'color': cat.color,
        'type': cat.type,
        'is_default': 1,
        'is_active': 1,
        'sort_order': 0,
      });
    }
    final now = DateTime.now().toIso8601String();
    await db.insert('accounts', {
      'id': 'default-cash-account',
      'name': 'Cash',
      'type': AccountType.cash.name,
      'initial_balance': 0.0,
      'currency': 'INR',
      'icon': 'account_balance_wallet',
      'color': 0xFF4CAF50,
      'is_active': 1,
      'sort_order': 0,
      'current_balance': 0.0,
      'created_at': now,
      'is_deleted': 0,
    });
    await db.insert('accounts', {
      'id': 'default-savings-account',
      'name': 'Bank Account',
      'type': AccountType.savings.name,
      'initial_balance': 0.0,
      'currency': 'INR',
      'icon': 'account_balance',
      'color': 0xFF1976D2,
      'is_active': 1,
      'sort_order': 1,
      'current_balance': 0.0,
      'created_at': now,
      'is_deleted': 0,
    });
  }

  // ── TRANSACTIONS ──────────────────────────────────────────────────────

  @override
  Future<List<Transaction>> getTransactions({
    DateTime? startDate,
    DateTime? endDate,
    String? accountId,
    String? categoryId,
  }) async {
    final db = await database;
    final conds = <String>['is_deleted = 0'];
    final args = <dynamic>[];
    if (startDate != null) {
      conds.add('transaction_date >= ?');
      args.add(startDate.toIso8601String());
    }
    if (endDate != null) {
      conds.add('transaction_date < ?');
      args.add(endDate.toIso8601String());
    }
    if (accountId != null) {
      conds.add('account_id = ?');
      args.add(accountId);
    }
    if (categoryId != null) {
      conds.add('category_id = ?');
      args.add(categoryId);
    }
    final maps = await db.query('transactions',
        where: conds.join(' AND '),
        whereArgs: args.isEmpty ? null : args,
        orderBy: 'transaction_date DESC');
    return maps.map(Transaction.fromMap).toList();
  }

  @override
  Future<Transaction?> getTransaction(String id) async {
    final db = await database;
    final maps =
        await db.query('transactions', where: 'id = ?', whereArgs: [id], limit: 1);
    return maps.isEmpty ? null : Transaction.fromMap(maps.first);
  }

  @override
  Future<void> insertTransaction(Transaction t) async {
    final db = await database;
    await db.insert('transactions', t.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
    await _recalcBalance(db, t.accountId);
  }

  @override
  Future<void> updateTransaction(Transaction t) async {
    final db = await database;
    await db.update('transactions', t.toMap(), where: 'id = ?', whereArgs: [t.id]);
    await _recalcBalance(db, t.accountId);
  }

  @override
  Future<void> deleteTransaction(String id) async {
    final db = await database;
    final maps =
        await db.query('transactions', where: 'id = ?', whereArgs: [id], limit: 1);
    if (maps.isNotEmpty) {
      final t = Transaction.fromMap(maps.first);
      await db.update('transactions', {'is_deleted': 1},
          where: 'id = ?', whereArgs: [id]);
      await _recalcBalance(db, t.accountId);
    }
  }

  Future<void> _recalcBalance(Database db, String accountId) async {
    final aMaps =
        await db.query('accounts', where: 'id = ?', whereArgs: [accountId], limit: 1);
    if (aMaps.isEmpty) return;
    final account = Account.fromMap(aMaps.first);
    final tMaps = await db.query('transactions',
        where: 'account_id = ? AND is_deleted = 0', whereArgs: [accountId]);
    double bal = account.initialBalance;
    for (final m in tMaps) {
      final t = Transaction.fromMap(m);
      if (t.type == TransactionType.income) bal += t.amount;
      if (t.type == TransactionType.expense) bal -= t.amount;
    }
    await db.update('accounts', {'current_balance': bal},
        where: 'id = ?', whereArgs: [accountId]);
  }

  // ── CATEGORIES ────────────────────────────────────────────────────────

  @override
  Future<List<Category>> getCategories({String? type}) async {
    final db = await database;
    final maps = await db.query('categories',
        where: type != null ? 'type = ? AND is_active = 1' : 'is_active = 1',
        whereArgs: type != null ? [type] : null,
        orderBy: 'sort_order ASC, name ASC');
    return maps.map(Category.fromMap).toList();
  }

  @override
  Future<Category?> getCategory(String id) async {
    final db = await database;
    final maps =
        await db.query('categories', where: 'id = ?', whereArgs: [id], limit: 1);
    return maps.isEmpty ? null : Category.fromMap(maps.first);
  }

  @override
  Future<void> insertCategory(Category c) async {
    final db = await database;
    await db.insert('categories', c.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ── ACCOUNTS ──────────────────────────────────────────────────────────

  @override
  Future<List<Account>> getAccounts() async {
    final db = await database;
    final maps = await db.query('accounts',
        where: 'is_deleted = 0 AND is_active = 1',
        orderBy: 'sort_order ASC, name ASC');
    return maps.map(Account.fromMap).toList();
  }

  @override
  Future<Account?> getAccount(String id) async {
    final db = await database;
    final maps =
        await db.query('accounts', where: 'id = ?', whereArgs: [id], limit: 1);
    return maps.isEmpty ? null : Account.fromMap(maps.first);
  }

  @override
  Future<void> insertAccount(Account a) async {
    final db = await database;
    await db.insert('accounts', a.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  @override
  Future<void> updateAccount(Account a) async {
    final db = await database;
    await db.update('accounts', a.toMap(), where: 'id = ?', whereArgs: [a.id]);
  }

  @override
  Future<void> deleteAccount(String id) async {
    final db = await database;
    await db.update('accounts', {'is_deleted': 1},
        where: 'id = ?', whereArgs: [id]);
  }

  // ── BUDGETS ───────────────────────────────────────────────────────────

  @override
  Future<List<Budget>> getBudgets() async {
    final db = await database;
    final maps = await db.query('budgets',
        where: 'is_deleted = 0', orderBy: 'created_at DESC');
    return maps.map(Budget.fromMap).toList();
  }

  @override
  Future<void> insertBudget(Budget b) async {
    final db = await database;
    await db.insert('budgets', b.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  @override
  Future<void> updateBudget(Budget b) async {
    final db = await database;
    await db.update('budgets', b.toMap(), where: 'id = ?', whereArgs: [b.id]);
  }

  @override
  Future<void> deleteBudget(String id) async {
    final db = await database;
    await db.update('budgets', {'is_deleted': 1},
        where: 'id = ?', whereArgs: [id]);
  }

  // ── SETTINGS ──────────────────────────────────────────────────────────

  @override
  Future<UserSettings> getSettings() async {
    final db = await database;
    final maps = await db.query('settings');
    final flat = <String, String>{};
    for (final row in maps) {
      flat[row['key'] as String] = row['value'] as String;
    }
    if (flat.isEmpty) return const UserSettings();
    return UserSettings(
      currency: flat['currency'] ?? 'INR',
      locale: flat['locale'] ?? 'en',
      themeMode: flat['theme_mode'] ?? 'system',
      notificationsEnabled: (flat['notifications_enabled'] ?? '1') == '1',
      biometricEnabled: (flat['biometric_enabled'] ?? '0') == '1',
      isOnboardingComplete: (flat['is_onboarding_complete'] ?? '0') == '1',
      defaultAccountId: flat['default_account_id'],
      monthlyBudgetLimit:
          double.tryParse(flat['monthly_budget_limit'] ?? '0') ?? 0.0,
    );
  }

  @override
  Future<void> saveSetting(String key, String value) async {
    final db = await database;
    await db.insert('settings', {'key': key, 'value': value},
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  @override
  Future<void> saveSettings(UserSettings settings) async {
    final db = await database;
    final batch = db.batch();
    final map = {
      'currency': settings.currency,
      'locale': settings.locale,
      'theme_mode': settings.themeMode,
      'notifications_enabled': settings.notificationsEnabled ? '1' : '0',
      'biometric_enabled': settings.biometricEnabled ? '1' : '0',
      'is_onboarding_complete': settings.isOnboardingComplete ? '1' : '0',
      'monthly_budget_limit': settings.monthlyBudgetLimit.toString(),
    };
    if (settings.defaultAccountId != null) {
      map['default_account_id'] = settings.defaultAccountId!;
    }
    for (final e in map.entries) {
      batch.insert('settings', {'key': e.key, 'value': e.value},
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  // ── AGGREGATES ────────────────────────────────────────────────────────

  @override
  Future<Map<String, double>> getMonthlyTotals(DateTime month) async {
    final start = DateTime(month.year, month.month, 1);
    final end = DateTime(month.year, month.month + 1, 1);
    final txns = await getTransactions(startDate: start, endDate: end);
    double income = 0, expense = 0;
    for (final t in txns) {
      if (t.type == TransactionType.income) income += t.amount;
      if (t.type == TransactionType.expense) expense += t.amount;
    }
    return {'income': income, 'expense': expense};
  }

  @override
  Future<double> getTotalBalance() async {
    final accounts = await getAccounts();
    return accounts.fold(0.0, (s, a) => s + a.currentBalance);
  }
}
