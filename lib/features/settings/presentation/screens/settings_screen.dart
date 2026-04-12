import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/core/utils/formatters.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final settings = ref.watch(settingsProvider);
    final accounts = ref.watch(accountsProvider).valueOrNull ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          // ── Accounts Section ─────────────────────────────────────
          _SectionHeader('Accounts'),
          ...accounts.map((a) => ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Color(a.color).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.account_balance_wallet,
                      color: Color(a.color), size: 20),
                ),
                title: Text(a.name,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(formatCurrency(a.currentBalance)),
                trailing: Text(a.type.name,
                    style: TextStyle(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontSize: 12)),
              )),

          // ── Appearance ────────────────────────────────────────────
          _SectionHeader('Appearance'),
          ListTile(
            leading: const Icon(Icons.palette_outlined),
            title: const Text('Theme'),
            trailing: DropdownButton<String>(
              value: settings.themeMode,
              underline: const SizedBox.shrink(),
              items: const [
                DropdownMenuItem(value: 'system', child: Text('System')),
                DropdownMenuItem(value: 'light', child: Text('Light')),
                DropdownMenuItem(value: 'dark', child: Text('Dark')),
              ],
              onChanged: (v) {
                if (v != null) {
                  ref.read(settingsProvider.notifier).setThemeMode(v);
                }
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.currency_rupee),
            title: const Text('Currency'),
            trailing: Text(settings.currency,
                style: TextStyle(
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w600)),
            onTap: () => _pickCurrency(context, ref),
          ),

          // ── Notifications ─────────────────────────────────────────
          _SectionHeader('Notifications'),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_outlined),
            title: const Text('Transaction Reminders'),
            subtitle: const Text('Get alerts for upcoming bills'),
            value: settings.notificationsEnabled,
            activeColor: AppColors.primary,
            onChanged: (v) =>
                ref.read(settingsProvider.notifier).setNotifications(v),
          ),

          // ── Security ─────────────────────────────────────────────
          _SectionHeader('Security'),
          SwitchListTile(
            secondary: const Icon(Icons.fingerprint),
            title: const Text('Biometric Lock'),
            subtitle: const Text('Use fingerprint or face to unlock'),
            value: settings.biometricEnabled,
            activeColor: AppColors.primary,
            onChanged: (v) =>
                ref.read(settingsProvider.notifier).setBiometric(v),
          ),

          // ── About ─────────────────────────────────────────────────
          _SectionHeader('About'),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About PaisaTrack'),
            subtitle: const Text('Version 1.0.0'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showAbout(context),
          ),
          ListTile(
            leading: const Icon(Icons.star_outline),
            title: const Text('Rate the App'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.share_outlined),
            title: const Text('Share with Friends'),
            onTap: () {},
          ),

          const SizedBox(height: 32),

          // ── App branding ──────────────────────────────────────────
          Center(
            child: Column(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    gradient: AppColors.balanceCardGradient,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Center(
                    child: Text('₹',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w800)),
                  ),
                ),
                const SizedBox(height: 8),
                const Text('PaisaTrack',
                    style: TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 16)),
                const Text('Har paisa, har pal.',
                    style: TextStyle(
                        color: AppColors.primary,
                        fontStyle: FontStyle.italic,
                        fontSize: 13)),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickCurrency(BuildContext context, WidgetRef ref) async {
    final currencies = {
      'INR': '₹ Indian Rupee',
      'USD': '$ US Dollar',
      'EUR': '€ Euro',
      'GBP': '£ British Pound',
      'AED': 'د.إ UAE Dirham',
      'SGD': 'S\$ Singapore Dollar',
    };

    final current = ref.read(settingsProvider).currency;
    final picked = await showModalBottomSheet<String>(
      context: context,
      builder: (ctx) => ListView(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Text('Select Currency',
                style: Theme.of(ctx).textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.w700)),
          ),
          ...currencies.entries.map((e) => ListTile(
                title: Text(e.value),
                trailing: e.key == current
                    ? const Icon(Icons.check, color: AppColors.primary)
                    : null,
                onTap: () => ctx.pop(e.key),
              )),
        ],
      ),
    );

    if (picked != null) {
      ref.read(settingsProvider.notifier).setCurrency(picked);
    }
  }

  void _showAbout(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'PaisaTrack',
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          gradient: AppColors.balanceCardGradient,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Center(
          child: Text('₹',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w800)),
        ),
      ),
      children: const [
        Text(
            'PaisaTrack is an India-first personal finance app. '
            'Track expenses in Hindi, Hinglish or English. '
            'Built with Flutter. Local-first. No login required.'),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 6),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: AppColors.primary,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
