/// Defines all named route paths used throughout PaisaTrack.
library;

abstract class AppRoutes {
  // ── Main Tabs ───────────────────────────────────────────────────────────
  static const String dashboard = '/';
  static const String transactions = '/transactions';
  static const String transactionDetail = '/transactions/:id';
  static const String addTransaction = '/transactions/add';
  static const String budgets = '/budgets';
  static const String createBudget = '/budgets/create';
  static const String smartBudget = '/budgets/smart';

  // ── Settings ────────────────────────────────────────────────────────────
  static const String settings = '/settings';
  static const String currencySettings = '/settings/currency';
  static const String languageSettings = '/settings/language';
  static const String reminders = '/settings/reminders';
  static const String exportData = '/settings/export';
  static const String premium = '/settings/premium';
  static const String manageSub = '/settings/premium/manage';
  static const String about = '/settings/about';

  // ── AI / Input ──────────────────────────────────────────────────────────
  static const String voiceInput = '/voice-input';
  static const String chatInput = '/chat-input';
  static const String receiptScan = '/receipt-scan';
  static const String receiptReview = '/receipt-review';

  // ── Onboarding ──────────────────────────────────────────────────────────
  static const String onboardingWelcome = '/onboarding';
  static const String onboardingLanguage = '/onboarding/language';
  static const String onboardingCurrency = '/onboarding/currency';
  static const String onboardingPermissions = '/onboarding/permissions';
}
