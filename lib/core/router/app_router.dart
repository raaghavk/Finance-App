import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/features/budgets/presentation/screens/budgets_screen.dart';
import 'package:paisa_track/features/budgets/presentation/screens/create_budget_screen.dart';
import 'package:paisa_track/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:paisa_track/features/onboarding/presentation/screens/welcome_screen.dart';
import 'package:paisa_track/features/settings/presentation/screens/settings_screen.dart';
import 'package:paisa_track/features/transactions/presentation/screens/add_transaction_screen.dart';
import 'package:paisa_track/features/transactions/presentation/screens/transaction_detail_screen.dart';
import 'package:paisa_track/features/transactions/presentation/screens/transactions_list_screen.dart';
import 'package:paisa_track/features/premium/presentation/screens/premium_screen.dart';
import 'package:paisa_track/shared/widgets/app_scaffold.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final settings = ref.watch(settingsProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    debugLogDiagnostics: false,

    redirect: (context, state) {
      final isOnboarding = state.uri.path.startsWith('/onboarding');
      if (!settings.isOnboardingComplete && !isOnboarding) {
        return '/onboarding';
      }
      if (settings.isOnboardingComplete && isOnboarding) {
        return '/';
      }
      return null;
    },

    routes: [
      // ── Onboarding ───────────────────────────────────────────────
      GoRoute(
        path: '/onboarding',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const OnboardingScreen(),
      ),

      // ── Main shell (bottom navigation) ───────────────────────────
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => AppScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/transactions',
            name: 'transactions',
            builder: (context, state) => const TransactionsScreen(),
          ),
          GoRoute(
            path: '/budgets',
            name: 'budgets',
            builder: (context, state) => const BudgetsScreen(),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),

      // ── Full-screen routes (outside the shell) ───────────────────
      GoRoute(
        path: '/transactions/add',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final type = state.uri.queryParameters['type'];
          return AddTransactionScreen(initialType: type);
        },
      ),
      GoRoute(
        path: '/transactions/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return TransactionDetailScreen(id: id);
        },
      ),
      GoRoute(
        path: '/budgets/create',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CreateBudgetScreen(),
      ),
      GoRoute(
        path: '/settings/premium',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PremiumScreen(),
      ),
    ],
  );
});
