import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/data/local/database/app_database.dart';

/// Builds the [MigrationStrategy] used by [AppDatabase].
///
/// On first launch this seeds the database with default categories and a
/// default "Cash" account so the user can start recording transactions
/// immediately.
MigrationStrategy buildMigrationStrategy(AppDatabase db) {
  return MigrationStrategy(
    onCreate: (Migrator m) async {
      await m.createAll();
      await _seedDefaultCategories(db);
      await _seedDefaultAccount(db);
    },
    onUpgrade: (Migrator m, int from, int to) async {
      // Future schema migrations go here.
    },
  );
}

// ── Seed data ─────────────────────────────────────────────────────────────

Future<void> _seedDefaultCategories(AppDatabase db) async {
  final now = DateTime.now();

  // Expense categories
  final expenseCategories = <Map<String, dynamic>>[
    {
      'id': 'cat_food',
      'name': 'Food & Dining',
      'nameHi': 'खाना और भोजन',
      'icon': 'restaurant',
      'color': 0xFFFF9800,
      'sortOrder': 0,
    },
    {
      'id': 'cat_transport',
      'name': 'Transport',
      'nameHi': 'परिवहन',
      'icon': 'directions_bus',
      'color': 0xFF2196F3,
      'sortOrder': 1,
    },
    {
      'id': 'cat_shopping',
      'name': 'Shopping',
      'nameHi': 'खरीदारी',
      'icon': 'shopping_bag',
      'color': 0xFFE91E63,
      'sortOrder': 2,
    },
    {
      'id': 'cat_bills',
      'name': 'Bills & Utilities',
      'nameHi': 'बिल और उपयोगिताएँ',
      'icon': 'receipt_long',
      'color': 0xFF9C27B0,
      'sortOrder': 3,
    },
    {
      'id': 'cat_entertainment',
      'name': 'Entertainment',
      'nameHi': 'मनोरंजन',
      'icon': 'movie',
      'color': 0xFF00BCD4,
      'sortOrder': 4,
    },
    {
      'id': 'cat_health',
      'name': 'Health',
      'nameHi': 'स्वास्थ्य',
      'icon': 'local_hospital',
      'color': 0xFF4CAF50,
      'sortOrder': 5,
    },
    {
      'id': 'cat_education',
      'name': 'Education',
      'nameHi': 'शिक्षा',
      'icon': 'school',
      'color': 0xFF3F51B5,
      'sortOrder': 6,
    },
    {
      'id': 'cat_rent',
      'name': 'Rent',
      'nameHi': 'किराया',
      'icon': 'home',
      'color': 0xFF795548,
      'sortOrder': 7,
    },
    {
      'id': 'cat_groceries',
      'name': 'Groceries',
      'nameHi': 'किराना',
      'icon': 'local_grocery_store',
      'color': 0xFF8BC34A,
      'sortOrder': 8,
    },
    {
      'id': 'cat_other_expense',
      'name': 'Other',
      'nameHi': 'अन्य',
      'icon': 'more_horiz',
      'color': 0xFF607D8B,
      'sortOrder': 9,
    },
  ];

  // Income categories
  final incomeCategories = <Map<String, dynamic>>[
    {
      'id': 'cat_salary',
      'name': 'Salary',
      'nameHi': 'वेतन',
      'icon': 'account_balance_wallet',
      'color': 0xFF4CAF50,
      'sortOrder': 0,
    },
    {
      'id': 'cat_freelance',
      'name': 'Freelance',
      'nameHi': 'फ्रीलांस',
      'icon': 'laptop',
      'color': 0xFF009688,
      'sortOrder': 1,
    },
    {
      'id': 'cat_investment_income',
      'name': 'Investment',
      'nameHi': 'निवेश',
      'icon': 'trending_up',
      'color': 0xFF00BCD4,
      'sortOrder': 2,
    },
    {
      'id': 'cat_gift_income',
      'name': 'Gift',
      'nameHi': 'उपहार',
      'icon': 'card_giftcard',
      'color': 0xFFFF5722,
      'sortOrder': 3,
    },
    {
      'id': 'cat_other_income',
      'name': 'Other',
      'nameHi': 'अन्य',
      'icon': 'more_horiz',
      'color': 0xFF607D8B,
      'sortOrder': 4,
    },
  ];

  // Transfer category
  final transferCategories = <Map<String, dynamic>>[
    {
      'id': 'cat_transfer',
      'name': 'Transfer',
      'nameHi': 'ट्रांसफर',
      'icon': 'swap_horiz',
      'color': 0xFF9E9E9E,
      'sortOrder': 0,
    },
  ];

  Future<void> insertCategories(
    List<Map<String, dynamic>> cats,
    TransactionType type,
  ) async {
    for (final c in cats) {
      await db.into(db.categoriesTable).insert(
            CategoriesTableCompanion.insert(
              id: c['id'] as String,
              name: c['name'] as String,
              nameHi: c['nameHi'] as String,
              icon: c['icon'] as String,
              color: c['color'] as int,
              type: type,
              isDefault: const Value(true),
              sortOrder: Value(c['sortOrder'] as int),
              createdAt: Value(now),
            ),
          );
    }
  }

  await insertCategories(expenseCategories, TransactionType.expense);
  await insertCategories(incomeCategories, TransactionType.income);
  await insertCategories(transferCategories, TransactionType.transfer);
}

Future<void> _seedDefaultAccount(AppDatabase db) async {
  await db.into(db.accountsTable).insert(
        AccountsTableCompanion.insert(
          id: 'account_cash',
          name: 'Cash',
          type: 'cash',
          initialBalance: const Value(0),
          currency: const Value('INR'),
          icon: const Value('account_balance_wallet'),
          color: const Value(0xFF4CAF50),
          isActive: const Value(true),
          sortOrder: const Value(0),
          syncStatus: Value(SyncStatus.pending.index),
          createdAt: Value(DateTime.now()),
          updatedAt: Value(DateTime.now()),
        ),
      );
}
