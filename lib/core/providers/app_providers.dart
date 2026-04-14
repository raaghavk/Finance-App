import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:paisa_track/core/database/database_service.dart';
import 'package:paisa_track/domain/models/account.dart';
import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/category.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

// ── Database ──────────────────────────────────────────────────────────────

final dbProvider = Provider<DatabaseService>((ref) => DatabaseService.instance);

// ── Settings ──────────────────────────────────────────────────────────────

class SettingsNotifier extends StateNotifier<UserSettings> {
  SettingsNotifier(this._db) : super(const UserSettings()) {
    _load();
  }

  final DatabaseService _db;

  Future<void> _load() async {
    state = await _db.getSettings();
  }

  Future<void> setCurrency(String currency) async {
    state = state.copyWith(currency: currency);
    await _db.saveSetting('currency', currency);
  }

  Future<void> setLocale(String locale) async {
    state = state.copyWith(locale: locale);
    await _db.saveSetting('locale', locale);
  }

  Future<void> setThemeMode(String mode) async {
    state = state.copyWith(themeMode: mode);
    await _db.saveSetting('theme_mode', mode);
  }

  Future<void> setNotifications(bool enabled) async {
    state = state.copyWith(notificationsEnabled: enabled);
    await _db.saveSetting('notifications_enabled', enabled ? '1' : '0');
  }

  Future<void> setBiometric(bool enabled) async {
    state = state.copyWith(biometricEnabled: enabled);
    await _db.saveSetting('biometric_enabled', enabled ? '1' : '0');
  }

  Future<void> completeOnboarding() async {
    state = state.copyWith(isOnboardingComplete: true);
    await _db.saveSetting('is_onboarding_complete', '1');
  }

  Future<void> setDefaultAccount(String accountId) async {
    state = state.copyWith(defaultAccountId: accountId);
    await _db.saveSetting('default_account_id', accountId);
  }

  Future<void> setMonthlyBudget(double limit) async {
    state = state.copyWith(monthlyBudgetLimit: limit);
    await _db.saveSetting('monthly_budget_limit', limit.toString());
  }

  // ── Premium ─────────────────────────────────────────────────────────────

  Future<void> setPremiumStatus(bool isPremium) async {
    state = state.copyWith(isPremium: isPremium);
    await _db.saveSetting('is_premium', isPremium ? '1' : '0');
  }

  Future<void> setSubscriptionTier(String tier) async {
    state = state.copyWith(subscriptionTier: tier);
    await _db.saveSetting('subscription_tier', tier);
  }

  Future<void> setSubscriptionExpiryDate(String? date) async {
    state = state.copyWith(subscriptionExpiryDate: date);
    await _db.saveSetting('subscription_expiry_date', date ?? '');
  }

  Future<void> setAiUsageCount(int count) async {
    state = state.copyWith(aiUsageCount: count);
    await _db.saveSetting('ai_usage_count', count.toString());
  }

  Future<void> setAiUsageResetDate(String date) async {
    state = state.copyWith(aiUsageResetDate: date);
    await _db.saveSetting('ai_usage_reset_date', date);
  }

  /// Activate premium (mock purchase). Sets tier to 'pro' with 30-day expiry.
  Future<void> activatePremium() async {
    final expiry =
        DateTime.now().add(const Duration(days: 30)).toIso8601String();
    state = state.copyWith(
      isPremium: true,
      subscriptionTier: 'pro',
      subscriptionExpiryDate: expiry,
    );
    await _db.saveSetting('is_premium', '1');
    await _db.saveSetting('subscription_tier', 'pro');
    await _db.saveSetting('subscription_expiry_date', expiry);
  }

  /// Deactivate premium (cancel / expire).
  Future<void> deactivatePremium() async {
    state = state.copyWith(
      isPremium: false,
      subscriptionTier: 'free',
      subscriptionExpiryDate: null,
    );
    await _db.saveSetting('is_premium', '0');
    await _db.saveSetting('subscription_tier', 'free');
    await _db.saveSetting('subscription_expiry_date', '');
  }

  /// Increment AI usage count. Auto-resets if it's a new month.
  Future<void> incrementAiUsage() async {
    final now = DateTime.now();
    final currentMonth = '${now.year}-${now.month.toString().padLeft(2, '0')}';

    int count = state.aiUsageCount;
    if (state.aiUsageResetDate != currentMonth) {
      count = 0;
      await setAiUsageResetDate(currentMonth);
    }

    count++;
    await setAiUsageCount(count);
  }
}

final settingsProvider =
    StateNotifierProvider<SettingsNotifier, UserSettings>((ref) {
  final db = ref.watch(dbProvider);
  return SettingsNotifier(db);
});

final isOnboardingCompleteProvider = Provider<bool>((ref) {
  return ref.watch(settingsProvider).isOnboardingComplete;
});

// ── Premium Providers ────────────────────────────────────────────────────

final isPremiumProvider = Provider<bool>((ref) {
  final settings = ref.watch(settingsProvider);
  if (!settings.isPremium) return false;
  // Check expiry
  if (settings.subscriptionExpiryDate != null &&
      settings.subscriptionExpiryDate!.isNotEmpty) {
    final expiry = DateTime.tryParse(settings.subscriptionExpiryDate!);
    if (expiry != null && expiry.isBefore(DateTime.now())) return false;
  }
  return true;
});

final remainingFreeAiUsesProvider = Provider<int>((ref) {
  final settings = ref.watch(settingsProvider);
  if (ref.watch(isPremiumProvider)) return -1; // unlimited
  final now = DateTime.now();
  final currentMonth = '${now.year}-${now.month.toString().padLeft(2, '0')}';
  if (settings.aiUsageResetDate != currentMonth) {
    return UserSettings.freeAiUsageLimit; // new month, full allowance
  }
  return (UserSettings.freeAiUsageLimit - settings.aiUsageCount).clamp(0, UserSettings.freeAiUsageLimit);
});

final canUseAiFeatureProvider = Provider<bool>((ref) {
  if (ref.watch(isPremiumProvider)) return true;
  return ref.watch(remainingFreeAiUsesProvider) > 0;
});

// ── Accounts ──────────────────────────────────────────────────────────────

class AccountsNotifier extends StateNotifier<AsyncValue<List<Account>>> {
  AccountsNotifier(this._db) : super(const AsyncValue.loading()) {
    load();
  }

  final DatabaseService _db;

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final accounts = await _db.getAccounts();
      state = AsyncValue.data(accounts);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> add(Account account) async {
    await _db.insertAccount(account);
    await load();
  }

  Future<void> update(Account account) async {
    await _db.updateAccount(account);
    await load();
  }

  Future<void> delete(String id) async {
    await _db.deleteAccount(id);
    await load();
  }
}

final accountsProvider =
    StateNotifierProvider<AccountsNotifier, AsyncValue<List<Account>>>((ref) {
  final db = ref.watch(dbProvider);
  return AccountsNotifier(db);
});

// ── Categories ────────────────────────────────────────────────────────────

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final db = ref.watch(dbProvider);
  return db.getCategories();
});

final expenseCategoriesProvider = FutureProvider<List<Category>>((ref) async {
  final db = ref.watch(dbProvider);
  return db.getCategories(type: 'expense');
});

final incomeCategoriesProvider = FutureProvider<List<Category>>((ref) async {
  final db = ref.watch(dbProvider);
  return db.getCategories(type: 'income');
});

// ── Transactions ──────────────────────────────────────────────────────────

class TransactionsNotifier
    extends StateNotifier<AsyncValue<List<Transaction>>> {
  TransactionsNotifier(this._db) : super(const AsyncValue.loading()) {
    load();
  }

  final DatabaseService _db;

  Future<void> load({DateTime? startDate, DateTime? endDate}) async {
    state = const AsyncValue.loading();
    try {
      final transactions = await _db.getTransactions(
        startDate: startDate,
        endDate: endDate,
      );
      state = AsyncValue.data(transactions);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<bool> add(Transaction transaction) async {
    try {
      await _db.insertTransaction(transaction);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> update(Transaction transaction) async {
    try {
      await _db.updateTransaction(transaction);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> delete(String id) async {
    try {
      await _db.deleteTransaction(id);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }
}

final transactionsProvider = StateNotifierProvider<TransactionsNotifier,
    AsyncValue<List<Transaction>>>((ref) {
  final db = ref.watch(dbProvider);
  return TransactionsNotifier(db);
});

// ── Budgets ───────────────────────────────────────────────────────────────

class BudgetsNotifier extends StateNotifier<AsyncValue<List<Budget>>> {
  BudgetsNotifier(this._db) : super(const AsyncValue.loading()) {
    load();
  }

  final DatabaseService _db;

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final budgets = await _db.getBudgets();

      // Calculate spent amount for each budget this month
      final now = DateTime.now();
      final monthStart = DateTime(now.year, now.month, 1);
      final monthEnd = DateTime(now.year, now.month + 1, 1);
      final transactions = await _db.getTransactions(
        startDate: monthStart,
        endDate: monthEnd,
      );

      final hydrated = budgets.where((b) => !b.isDeleted).map((budget) {
        final relevant = transactions.where((t) {
          if (t.type.name != 'expense') return false;
          if (budget.categoryIds.isEmpty) return true;
          return budget.categoryIds.contains(t.categoryId);
        });
        final spent = relevant.fold(0.0, (s, t) => s + t.amount);
        return budget.copyWith(spentAmount: spent);
      }).toList();

      state = AsyncValue.data(hydrated);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> add(Budget budget) async {
    await _db.insertBudget(budget);
    await load();
  }

  Future<void> update(Budget budget) async {
    await _db.updateBudget(budget);
    await load();
  }

  Future<void> delete(String id) async {
    await _db.deleteBudget(id);
    await load();
  }
}

final budgetsProvider =
    StateNotifierProvider<BudgetsNotifier, AsyncValue<List<Budget>>>((ref) {
  final db = ref.watch(dbProvider);
  return BudgetsNotifier(db);
});

// ── Dashboard ─────────────────────────────────────────────────────────────

class DashboardData {
  const DashboardData({
    required this.totalBalance,
    required this.monthlyIncome,
    required this.monthlyExpense,
    required this.recentTransactions,
  });

  final double totalBalance;
  final double monthlyIncome;
  final double monthlyExpense;
  final List<Transaction> recentTransactions;

  double get monthlySavings => monthlyIncome - monthlyExpense;
}

final dashboardProvider = FutureProvider<DashboardData>((ref) async {
  // watch transactions so dashboard refreshes when transactions change
  ref.watch(transactionsProvider);
  ref.watch(accountsProvider);

  final db = ref.read(dbProvider);
  final now = DateTime.now();

  final totalBalance = await db.getTotalBalance();
  final totals = await db.getMonthlyTotals(now);
  final recent = await db.getTransactions();

  return DashboardData(
    totalBalance: totalBalance,
    monthlyIncome: totals['income'] ?? 0,
    monthlyExpense: totals['expense'] ?? 0,
    recentTransactions: recent.take(10).toList(),
  );
});
