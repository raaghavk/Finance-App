/// Onboarding permissions request screen.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/features/onboarding/providers/onboarding_provider.dart';
import 'package:paisa_track/features/settings/providers/settings_provider.dart';

/// Requests optional device permissions during onboarding and then
/// navigates to the main dashboard.
class PermissionsScreen extends ConsumerWidget {
  const PermissionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final onboarding = ref.watch(onboardingNotifierProvider);
    final permissions = onboarding.permissions;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 48),

              // ── Heading ──────────────────────────────────────────
              Center(
                child: Text(
                  'Permissions',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Grant permissions to get the most out of PaisaTrack',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 32),

              // ── Permission Items ─────────────────────────────────
              _PermissionTile(
                icon: Icons.notifications_outlined,
                title: 'Notifications',
                description: 'Get reminders for bills and budget alerts',
                badge: 'Recommended',
                isGranted: permissions.notifications,
                onToggle: () {
                  // TODO: Request actual notification permission.
                  ref
                      .read(onboardingNotifierProvider.notifier)
                      .setPermission(
                          notifications: !permissions.notifications);
                },
              ),
              const SizedBox(height: 12),
              _PermissionTile(
                icon: Icons.camera_alt_outlined,
                title: 'Camera',
                description: 'Scan receipts for automatic expense entry',
                badge: 'Optional',
                isGranted: permissions.camera,
                onToggle: () {
                  // TODO: Request actual camera permission.
                  ref
                      .read(onboardingNotifierProvider.notifier)
                      .setPermission(camera: !permissions.camera);
                },
              ),
              const SizedBox(height: 12),
              _PermissionTile(
                icon: Icons.mic_outlined,
                title: 'Microphone',
                description: 'Log expenses hands-free with voice input',
                badge: 'Optional',
                isGranted: permissions.microphone,
                onToggle: () {
                  // TODO: Request actual microphone permission.
                  ref
                      .read(onboardingNotifierProvider.notifier)
                      .setPermission(microphone: !permissions.microphone);
                },
              ),
              const SizedBox(height: 12),
              _PermissionTile(
                icon: Icons.sms_outlined,
                title: 'SMS Access',
                description:
                    'Auto-track transactions from bank SMS (Premium)',
                badge: 'Optional',
                isGranted: permissions.sms,
                onToggle: () {
                  // TODO: Request actual SMS permission.
                  ref
                      .read(onboardingNotifierProvider.notifier)
                      .setPermission(sms: !permissions.sms);
                },
              ),
              const Spacer(),

              // ── Continue Button ──────────────────────────────────
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => _completeOnboarding(context, ref),
                  child: const Text('Continue'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => _completeOnboarding(context, ref),
                  child: const Text('Skip for now'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _completeOnboarding(BuildContext context, WidgetRef ref) async {
    final notifier = ref.read(onboardingNotifierProvider.notifier);
    await notifier.completeOnboarding();

    // Persist onboarding choices into settings.
    final onboardingState = ref.read(onboardingNotifierProvider);
    final settingsNotifier = ref.read(settingsNotifierProvider.notifier);
    await settingsNotifier.updateLocale(onboardingState.selectedLanguage);
    await settingsNotifier.updateCurrency(onboardingState.selectedCurrency);
    await settingsNotifier.completeOnboarding();

    if (context.mounted) {
      context.go(AppRoutes.dashboard);
    }
  }
}

class _PermissionTile extends StatelessWidget {
  const _PermissionTile({
    required this.icon,
    required this.title,
    required this.description,
    required this.badge,
    required this.isGranted,
    required this.onToggle,
  });

  final IconData icon;
  final String title;
  final String description;
  final String badge;
  final bool isGranted;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isGranted ? colorScheme.primary : colorScheme.outlineVariant,
          width: isGranted ? 2 : 1,
        ),
        color: isGranted
            ? colorScheme.primary.withValues(alpha: 0.05)
            : colorScheme.surface,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isGranted
                  ? colorScheme.primary.withValues(alpha: 0.1)
                  : colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: isGranted
                  ? colorScheme.primary
                  : colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: badge == 'Recommended'
                            ? AppColors.teal.withValues(alpha: 0.1)
                            : colorScheme.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        badge,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: badge == 'Recommended'
                              ? AppColors.teal
                              : colorScheme.onSurfaceVariant,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Switch.adaptive(
            value: isGranted,
            onChanged: (_) => onToggle(),
          ),
        ],
      ),
    );
  }
}
