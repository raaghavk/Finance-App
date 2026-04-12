import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/account_type.dart';
import 'package:paisa_track/domain/models/account.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/category.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

/// Singleton SQLite database service for PaisaTrack.
class DatabaseService {
  DatabaseService._();
  static final DatabaseService instance = DatabaseService._();

  static Database? _db;

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    if (kIsWeb) throw UnsupportedError('sqflite not supported on web');
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
        is_deleted INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id)
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

    await _seedData(db);
  }

  Future<void> _seedData(Database db) async {
    // Seed default categories
    final now = DateTime.now().toIso8601String();
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

    // Seed default Cash account
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

    // Seed default Savings account
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

  // ── TRANSACTIONS ──────────────────────────────────────────────────────────

  Future<List<Transaction>> getTransactions({
    DateTime? startDate,
    DateTime? endDate,
    String? accountId,
    String? categoryId,
  }) async {
    final db = await database;
    final conditions = <String>['is_deleted = 0'];
    final args = <dynamic>[];

    if (startDate != null) {
      conditions.add('transaction_date >= ?');
      args.add(startDate.toIso8601String());
    }
    if (endDate != null) {
      conditions.add('transaction_date <= ?');
      args.add(endDate.toIso8601String());
    }
    if (accountId != null) {
      conditions.add('account_id = ?');
      args.add(accountId);
    }
    if (categoryId != null) {
      conditions.add('category_id = ?');
      args.add(categoryId);
    }

    final where = conditions.join(' AND ');
    final maps = await db.query(
      'transactions',
      where: where,
      whereArgs: args.isEmpty ? null : args,
      orderBy: 'transaction_date DESC',
    );
    return maps.map(Transaction.fromMap).toList();
  }

  Future<Transaction?> getTransaction(String id) async {
    final db = await database;
    final maps = await db.query('transactions',
        where: 'id = ?', whereArgs: [id], limit: 1);
    if (maps.isEmpty) return null;
    return Transaction.fromMap(maps.first);
  }

  Future<void> insertTransaction(Transaction t) async {
    final db = await database;
    await db.insert('transactions', t.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
    await _recalculateAccountBalance(db, t.accountId);
  }

  Future<void> updateTransaction(Transaction t) async {
    final db = await database;
    await db.update('transactions', t.toMap(),
        where: 'id = ?', whereArgs: [t.id]);
    await _recalculateAccountBalance(db, t.accountId);
  }

  Future<void> deleteTransaction(String id) async {
    final db = await database;
    final maps = await db.query('transactions',
        where: 'id = ?', whereArgs: [id], limit: 1);
    if (maps.isNotEmpty) {
      final t = Transaction.fromMap(maps.first);
      await db.update('transactions', {'is_deleted': 1},
          where: 'id = ?', whereArgs: [id]);
      await _recalculateAccountBalance(db, t.accountId);
    }
  }

  Future<void> _recalculateAccountBalance(Database db, String accountId) async {
    final accountMaps = await db.query('accounts',
        where: 'id = ?', whereArgs: [accountId], limit: 1);
    if (accountMaps.isEmpty) return;

    final account = Account.fromMap(accountMaps.first);
    final txnMaps = await db.query('transactions',
        where: 'account_id = ? AND is_deleted = 0', whereArgs: [accountId]);

    double balance = account.initialBalance;
    for (final m in txnMaps) {
      final t = Transaction.fromMap(m);
      if (t.type.name == 'income') {
        balance += t.amount;
      } else if (t.type.name == 'expense') {
        balance -= t.amount;
      }
    }

    await db.update('accounts', {'current_balance': balance},
        where: 'id = ?', whereArgs: [accountId]);
  }

  // ── CATEGORIES ────────────────────────────────────────────────────────────

  Future<List<Category>> getCategories({String? type}) async {
    final db = await database;
    final maps = await db.query(
      'categories',
      where: type != null ? 'type = ? AND is_active = 1' : 'is_active = 1',
      whereArgs: type != null ? [type] : null,
      orderBy: 'sort_order ASC, name ASC',
    );
    return maps.map(Category.fromMap).toList();
  }

  Future<Category?> getCategory(String id) async {
    final db = await database;
    final maps = await db.query('categories',
        where: 'id = ?', whereArgs: [id], limit: 1);
    if (maps.isEmpty) return null;
    return Category.fromMap(maps.first);
  }

  Future<void> insertCategory(Category c) async {
    final db = await database;
    await db.insert('categories', c.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ── ACCOUNTS ──────────────────────────────────────────────────────────────

  Future<List<Account>> getAccounts() async {
    final db = await database;
    final maps = await db.query('accounts',
        where: 'is_deleted = 0 AND is_active = 1',
        orderBy: 'sort_order ASC, name ASC');
    return maps.map(Account.fromMap).toList();
  }

  Future<Account?> getAccount(String id) async {
    final db = await database;
    final maps = await db.query('accounts',
        where: 'id = ?', whereArgs: [id], limit: 1);
    if (maps.isEmpty) return null;
    return Account.fromMap(maps.first);
  }

  Future<void> insertAccount(Account a) async {
    final db = await database;
    await db.insert('accounts', a.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateAccount(Account a) async {
    final db = await database;
    await db.update('accounts', a.toMap(),
        where: 'id = ?', whereArgs: [a.id]);
  }

  Future<void> deleteAccount(String id) async {
    final db = await database;
    await db.update('accounts', {'is_deleted': 1},
        where: 'id = ?', whereArgs: [id]);
  }

  // ── BUDGETS ───────────────────────────────────────────────────────────────

  Future<List<Budget>> getBudgets() async {
    final db = await database;
    final maps = await db.query('budgets',
        where: 'is_deleted = 0', orderBy: 'created_at DESC');
    return maps.map(Budget.fromMap).toList();
  }

  Future<void> insertBudget(Budget b) async {
    final db = await database;
    await db.insert('budgets', b.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateBudget(Budget b) async {
    final db = await database;
    await db.update('budgets', b.toMap(),
        where: 'id = ?', whereArgs: [b.id]);
  }

  Future<void> deleteBudget(String id) async {
    final db = await database;
    await db.update('budgets', {'is_deleted': 1},
        where: 'id = ?', whereArgs: [id]);
  }

  // ── SETTINGS ──────────────────────────────────────────────────────────────

  Future<UserSettings> getSettings() async {
    final db = await database;
    final maps = await db.query('settings');
    final Map<String, dynamic> flat = {};
    for (final row in maps) {
      flat[row['key'] as String] = row['value'];
    }
    if (flat.isEmpty) return const UserSettings();

    return UserSettings(
      currency: (flat['currency'] as String?) ?? 'INR',
      locale: (flat['locale'] as String?) ?? 'en',
      themeMode: (flat['theme_mode'] as String?) ?? 'system',
      notificationsEnabled: (flat['notifications_enabled'] ?? '1') == '1',
      biometricEnabled: (flat['biometric_enabled'] ?? '0') == '1',
      isOnboardingComplete: (flat['is_onboarding_complete'] ?? '0') == '1',
      defaultAccountId: flat['default_account_id'] as String?,
      monthlyBudgetLimit:
          double.tryParse(flat['monthly_budget_limit'] ?? '0') ?? 0.0,
    );
  }

  Future<void> saveSetting(String key, String value) async {
    final db = await database;
    await db.insert('settings', {'key': key, 'value': value},
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

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
    for (final entry in map.entries) {
      batch.insert('settings', {'key': entry.key, 'value': entry.value},
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  // ── AGGREGATES ────────────────────────────────────────────────────────────

  Future<Map<String, double>> getMonthlyTotals(DateTime month) async {
    final db = await database;
    final start = DateTime(month.year, month.month, 1);
    final end = DateTime(month.year, month.month + 1, 1);

    final maps = await db.query(
      'transactions',
      where: 'is_deleted = 0 AND transaction_date >= ? AND transaction_date < ?',
      whereArgs: [start.toIso8601String(), end.toIso8601String()],
    );

    double income = 0;
    double expense = 0;
    for (final m in maps) {
      final t = Transaction.fromMap(m);
      if (t.type.name == 'income') {
        income += t.amount;
      } else if (t.type.name == 'expense') {
        expense += t.amount;
      }
    }
    return {'income': income, 'expense': expense};
  }

  Future<double> getTotalBalance() async {
    final accounts = await getAccounts();
    return accounts.fold(0.0, (sum, a) => sum + a.currentBalance);
  }
}
