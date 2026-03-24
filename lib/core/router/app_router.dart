/// GoRouter configuration for PaisaTrack using Riverpod code generation.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/router/guards.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/shared/widgets/app_scaffold.dart';

// ── Feature screen imports (placeholder widgets until screens are built) ──

// Dashboard
// import 'package:paisa_track/features/dashboard/presentation/screens/dashboard_screen.dart';
// Transactions
// import 'package:paisa_track/features/transactions/presentation/screens/transactions_screen.dart';
// import 'package:paisa_track/features/transactions/presentation/screens/transaction_detail_screen.dart';
// import 'package:paisa_track/features/transactions/presentation/screens/add_transaction_screen.dart';
// Budgets
// import 'package:paisa_track/features/budgets/presentation/screens/budgets_screen.dart';
// import 'package:paisa_track/features/budgets/presentation/screens/create_budget_screen.dart';
// import 'package:paisa_track/features/budgets/presentation/screens/smart_budget_screen.dart';
// Settings
// import 'package:paisa_track/features/settings/presentation/screens/settings_screen.dart';
// import 'package:paisa_track/features/settings/presentation/screens/currency_settings_screen.dart';
// import 'package:paisa_track/features/settings/presentation/screens/language_settings_screen.dart';
// import 'package:paisa_track/features/settings/presentation/screens/export_data_screen.dart';
// import 'package:paisa_track/features/settings/presentation/screens/about_screen.dart';
// Reminders
// import 'package:paisa_track/features/reminders/presentation/screens/reminders_screen.dart';
// Premium
// import 'package:paisa_track/features/premium/presentation/screens/premium_screen.dart';
// import 'package:paisa_track/features/premium/presentation/screens/manage_sub_screen.dart';
// Voice / Chat / Receipt
// import 'package:paisa_track/features/voice_input/presentation/screens/voice_input_screen.dart';
// import 'package:paisa_track/features/chat_input/presentation/screens/chat_input_screen.dart';
// import 'package:paisa_track/features/receipt_ocr/presentation/screens/receipt_scan_screen.dart';
// import 'package:paisa_track/features/receipt_ocr/presentation/screens/receipt_review_screen.dart';
// Onboarding
// import 'package:paisa_track/features/onboarding/presentation/screens/onboarding_welcome_screen.dart';
// import 'package:paisa_track/features/onboarding/presentation/screens/onboarding_language_screen.dart';
// import 'package:paisa_track/features/onboarding/presentation/screens/onboarding_currency_screen.dart';
// import 'package:paisa_track/features/onboarding/presentation/screens/onboarding_permissions_screen.dart';

part 'app_router.g.dart';

// ── Navigator keys for shell vs full-screen routes ─────────────────────
final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

@riverpod
GoRouter appRouter(Ref ref) {
  // TODO: Replace with real providers once implemented.
  // final isOnboardingComplete = ref.watch(isOnboardingCompleteProvider);
  // final subscriptionTier = ref.watch(subscriptionTierProvider);
  const isOnboardingComplete = true; // placeholder
  const subscriptionTier = SubscriptionTier.free; // placeholder

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.dashboard,
    debugLogDiagnostics: true,

    // ── Global redirect ───────────────────────────────────────────────
    redirect: (context, state) {
      final location = state.uri.path;
      final isOnboarding = location.startsWith(AppRoutes.onboardingWelcome);

      // Redirect to onboarding if not yet completed.
      if (!isOnboardingComplete && !isOnboarding) {
        return AppRoutes.onboardingWelcome;
      }

      // Redirect away from onboarding if already completed.
      if (isOnboardingComplete && isOnboarding) {
        return AppRoutes.dashboard;
      }

      // Premium feature gate.
      final premiumRedirect =
          PremiumGuard.guardPremiumFeature(subscriptionTier, location);
      if (premiumRedirect != null) return premiumRedirect;

      return null;
    },

    routes: [
      // ── Shell route (bottom navigation tabs) ──────────────────────
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => AppScaffold(child: child),
        routes: [
          // Dashboard
          GoRoute(
            path: AppRoutes.dashboard,
            name: 'dashboard',
            builder: (context, state) => const _Placeholder('Dashboard'),
          ),

          // Transactions
          GoRoute(
            path: AppRoutes.transactions,
            name: 'transactions',
            builder: (context, state) => const _Placeholder('Transactions'),
            routes: [
              GoRoute(
                path: 'add',
                name: 'addTransaction',
                builder: (context, state) =>
                    const _Placeholder('Add Transaction'),
              ),
              GoRoute(
                path: ':id',
                name: 'transactionDetail',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return _Placeholder('Transaction $id');
                },
              ),
            ],
          ),

          // Budgets
          GoRoute(
            path: AppRoutes.budgets,
            name: 'budgets',
            builder: (context, state) => const _Placeholder('Budgets'),
            routes: [
              GoRoute(
                path: 'create',
                name: 'createBudget',
                builder: (context, state) =>
                    const _Placeholder('Create Budget'),
              ),
              GoRoute(
                path: 'smart',
                name: 'smartBudget',
                builder: (context, state) =>
                    const _Placeholder('Smart Budget'),
              ),
            ],
          ),

          // Settings
          GoRoute(
            path: AppRoutes.settings,
            name: 'settings',
            builder: (context, state) => const _Placeholder('Settings'),
            routes: [
              GoRoute(
                path: 'currency',
                name: 'currencySettings',
                builder: (context, state) =>
                    const _Placeholder('Currency Settings'),
              ),
              GoRoute(
                path: 'language',
                name: 'languageSettings',
                builder: (context, state) =>
                    const _Placeholder('Language Settings'),
              ),
              GoRoute(
                path: 'reminders',
                name: 'reminders',
                builder: (context, state) => const _Placeholder('Reminders'),
              ),
              GoRoute(
                path: 'export',
                name: 'exportData',
                builder: (context, state) =>
                    const _Placeholder('Export Data'),
              ),
              GoRoute(
                path: 'premium',
                name: 'premium',
                builder: (context, state) => const _Placeholder('Premium'),
                routes: [
                  GoRoute(
                    path: 'manage',
                    name: 'manageSub',
                    builder: (context, state) =>
                        const _Placeholder('Manage Subscription'),
                  ),
                ],
              ),
              GoRoute(
                path: 'about',
                name: 'about',
                builder: (context, state) => const _Placeholder('About'),
              ),
            ],
          ),
        ],
      ),

      // ── Full-screen routes (outside the shell) ────────────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.voiceInput,
        name: 'voiceInput',
        builder: (context, state) => const _Placeholder('Voice Input'),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.chatInput,
        name: 'chatInput',
        builder: (context, state) => const _Placeholder('Chat Input'),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.receiptScan,
        name: 'receiptScan',
        builder: (context, state) => const _Placeholder('Receipt Scan'),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.receiptReview,
        name: 'receiptReview',
        builder: (context, state) => const _Placeholder('Receipt Review'),
      ),

      // ── Onboarding flow ───────────────────────────────────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: AppRoutes.onboardingWelcome,
        name: 'onboardingWelcome',
        builder: (context, state) =>
            const _Placeholder('Onboarding Welcome'),
        routes: [
          GoRoute(
            path: 'language',
            name: 'onboardingLanguage',
            builder: (context, state) =>
                const _Placeholder('Onboarding Language'),
          ),
          GoRoute(
            path: 'currency',
            name: 'onboardingCurrency',
            builder: (context, state) =>
                const _Placeholder('Onboarding Currency'),
          ),
          GoRoute(
            path: 'permissions',
            name: 'onboardingPermissions',
            builder: (context, state) =>
                const _Placeholder('Onboarding Permissions'),
          ),
        ],
      ),
    ],
  );
}

// ── Temporary placeholder screen until feature screens are created ──────

class _Placeholder extends StatelessWidget {
  const _Placeholder(this.label);
  final String label;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(label)),
        body: Center(
          child: Text(
            label,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
        ),
      );
}
