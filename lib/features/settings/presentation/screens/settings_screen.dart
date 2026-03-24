/// Main settings screen with grouped preference tiles.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/constants/currency_constants.dart';
import 'package:paisa_track/core/enums/subscription_tier.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/features/settings/presentation/widgets/settings_tile.dart';
import 'package:paisa_track/features/settings/providers/settings_provider.dart';

/// The root settings screen showing grouped preference categories.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(userSettingsProvider);
    final isDark = ref.watch(isDarkModeProvider);
    final currencyCode = ref.watch(currentCurrencyProvider);
    final currency = CurrencyConstants.findByCode(currencyCode);
    final isPremium = settings.subscriptionTier == SubscriptionTier.premium;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          // ── General ──────────────────────────────────────────────────
          _SectionHeader(title: 'General'),
          SettingsTile(
            icon: Icons.currency_exchange,
            title: 'Currency',
            subtitle: currency != null
                ? '${currency.flag} ${currency.code} (${currency.symbol})'
                : currencyCode,
            onTap: () => context.go(AppRoutes.currencySettings),
          ),
          SettingsTile(
            icon: Icons.language,
            title: 'Language',
            subtitle: settings.locale == 'hi' ? 'Hindi' : 'English',
            onTap: () => context.go(AppRoutes.languageSettings),
          ),
          SettingsTile(
            icon: Icons.dark_mode_outlined,
            title: 'Dark Mode',
            trailing: Switch.adaptive(
              value: isDark,
              onChanged: (_) =>
                  ref.read(settingsNotifierProvider.notifier).toggleDarkMode(),
            ),
            onTap: () =>
                ref.read(settingsNotifierProvider.notifier).toggleDarkMode(),
          ),
          const Divider(indent: 16, endIndent: 16),

          // ── Data ─────────────────────────────────────────────────────
          _SectionHeader(title: 'Data'),
          SettingsTile(
            icon: Icons.file_download_outlined,
            title: 'Export Data',
            subtitle: 'CSV or PDF export',
            onTap: () => context.go(AppRoutes.exportData),
          ),
          SettingsTile(
            icon: Icons.notifications_outlined,
            title: 'Reminders',
            subtitle: 'Bill & budget reminders',
            onTap: () => context.go(AppRoutes.reminders),
          ),
          const Divider(indent: 16, endIndent: 16),

          // ── Security ─────────────────────────────────────────────────
          _SectionHeader(title: 'Security'),
          SettingsTile(
            icon: Icons.fingerprint,
            title: 'Biometric Lock',
            showPremiumBadge: !isPremium,
            trailing: Switch.adaptive(
              value: settings.biometricLockEnabled,
              onChanged: isPremium
                  ? (_) => ref
                      .read(settingsNotifierProvider.notifier)
                      .toggleBiometricLock()
                  : null,
            ),
            onTap: isPremium
                ? () => ref
                    .read(settingsNotifierProvider.notifier)
                    .toggleBiometricLock()
                : () => context.go(AppRoutes.premium),
          ),
          const Divider(indent: 16, endIndent: 16),

          // ── Premium ──────────────────────────────────────────────────
          _SectionHeader(title: 'Premium'),
          SettingsTile(
            icon: isPremium ? Icons.workspace_premium : Icons.star_outline,
            title: isPremium ? 'Manage Subscription' : 'Upgrade to Premium',
            subtitle: isPremium ? 'Premium active' : 'Unlock all features',
            onTap: () => isPremium
                ? context.go(AppRoutes.manageSub)
                : context.go(AppRoutes.premium),
          ),
          const Divider(indent: 16, endIndent: 16),

          // ── About ────────────────────────────────────────────────────
          _SectionHeader(title: 'About'),
          SettingsTile(
            icon: Icons.info_outline,
            title: 'About ${AppConstants.appName}',
            subtitle: 'Version ${AppConstants.appVersion}',
            onTap: () => context.go(AppRoutes.about),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
