/// Shell scaffold with bottom navigation for PaisaTrack's four main tabs.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';

/// Wraps the current tab's [child] in a [Scaffold] with a
/// [NavigationBar] providing access to the four main sections.
class AppScaffold extends StatelessWidget {
  const AppScaffold({required this.child, super.key});

  /// The routed page content displayed above the navigation bar.
  final Widget child;

  // ── Tab definitions ───────────────────────────────────────────────────

  static const List<_TabItem> _tabs = [
    _TabItem(
      label: 'Dashboard',
      icon: Icons.dashboard_outlined,
      activeIcon: Icons.dashboard,
      route: AppRoutes.dashboard,
    ),
    _TabItem(
      label: 'Transactions',
      icon: Icons.receipt_long_outlined,
      activeIcon: Icons.receipt_long,
      route: AppRoutes.transactions,
    ),
    _TabItem(
      label: 'Budgets',
      icon: Icons.pie_chart_outline,
      activeIcon: Icons.pie_chart,
      route: AppRoutes.budgets,
    ),
    _TabItem(
      label: 'Settings',
      icon: Icons.settings_outlined,
      activeIcon: Icons.settings,
      route: AppRoutes.settings,
    ),
  ];

  /// Derives the currently selected tab index from the router location.
  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith(AppRoutes.settings)) return 3;
    if (location.startsWith(AppRoutes.budgets)) return 2;
    if (location.startsWith(AppRoutes.transactions)) return 1;
    return 0; // dashboard or fallback
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = _currentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          final route = _tabs[index].route;
          // Only navigate if the destination is different.
          if (index != selectedIndex) {
            context.go(route);
          }
        },
        destinations: [
          for (final tab in _tabs)
            NavigationDestination(
              icon: Icon(tab.icon),
              selectedIcon: Icon(tab.activeIcon),
              label: tab.label,
            ),
        ],
      ),
    );
  }
}

/// Internal model for a bottom-navigation tab entry.
class _TabItem {
  const _TabItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
  });

  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;
}
