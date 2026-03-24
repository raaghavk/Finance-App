/// Subscription management screen for existing premium users.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/features/premium/providers/subscription_provider.dart';
import 'package:paisa_track/features/settings/providers/settings_provider.dart';

/// Displays the current subscription plan, usage stats, and management options.
class SubscriptionScreen extends ConsumerWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tier = ref.watch(subscriptionNotifierProvider);
    final settings = ref.watch(userSettingsProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final voiceRemaining = ref.watch(remainingUsageProvider('voice'));
    final chatRemaining = ref.watch(remainingUsageProvider('chat'));
    final ocrRemaining = ref.watch(remainingUsageProvider('ocr'));

    return Scaffold(
      appBar: AppBar(title: const Text('Subscription')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Current Plan Card ──────────────────────────────────────
          Card(
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: tier.isPremium
                    ? const LinearGradient(
                        colors: [AppColors.saffron, AppColors.saffronDark],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        tier.isPremium
                            ? Icons.workspace_premium
                            : Icons.person_outline,
                        color: tier.isPremium
                            ? Colors.white
                            : colorScheme.onSurface,
                        size: 28,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        tier.label,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          color: tier.isPremium
                              ? Colors.white
                              : colorScheme.onSurface,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (tier.isPremium && settings.subscriptionExpiry != null)
                    Text(
                      'Renews on ${_formatDate(settings.subscriptionExpiry!)}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    )
                  else if (!tier.isPremium)
                    Text(
                      'Limited features and usage caps',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // ── Usage Stats ────────────────────────────────────────────
          Text(
            'Usage This Month',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          _UsageTile(
            icon: Icons.mic,
            label: 'Voice Inputs',
            remaining: voiceRemaining,
            total: AppConstants.voiceInputMonthlyLimit,
            isPremium: tier.isPremium,
          ),
          _UsageTile(
            icon: Icons.chat_bubble_outline,
            label: 'Chat Inputs',
            remaining: chatRemaining,
            total: AppConstants.chatInputMonthlyLimit,
            isPremium: tier.isPremium,
          ),
          _UsageTile(
            icon: Icons.document_scanner_outlined,
            label: 'OCR Scans',
            remaining: ocrRemaining,
            total: AppConstants.ocrMonthlyLimit,
            isPremium: tier.isPremium,
          ),
          const SizedBox(height: 24),

          // ── Actions ────────────────────────────────────────────────
          if (!tier.isPremium)
            FilledButton.icon(
              onPressed: () => context.go(AppRoutes.premium),
              icon: const Icon(Icons.star),
              label: const Text('Upgrade to Premium'),
            )
          else ...[
            OutlinedButton(
              onPressed: () => context.go(AppRoutes.premium),
              child: const Text('Change Plan'),
            ),
            const SizedBox(height: 8),
            Center(
              child: TextButton(
                onPressed: () => _showCancelDialog(context, ref),
                child: Text(
                  'Cancel Subscription',
                  style: TextStyle(color: colorScheme.error),
                ),
              ),
            ),
          ],
          const SizedBox(height: 32),

          // ── FAQ Section ────────────────────────────────────────────
          Text(
            'FAQ',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const _FaqItem(
            question: 'What happens when I cancel?',
            answer:
                'You will retain premium features until the end of your current billing period. After that, your account reverts to the free tier.',
          ),
          const _FaqItem(
            question: 'Can I switch between monthly and yearly?',
            answer:
                'Yes! You can change your plan at any time. The new plan takes effect at the next billing cycle.',
          ),
          const _FaqItem(
            question: 'Will I lose my data?',
            answer:
                'No. All your data stays on your device. Cloud sync will pause on the free tier, but nothing is deleted.',
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  void _showCancelDialog(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel Subscription?'),
        content: const Text(
          'You will lose access to premium features at the end of your current billing period.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Keep Premium'),
          ),
          TextButton(
            onPressed: () {
              ref.read(subscriptionNotifierProvider.notifier).cancel();
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Redirecting to store for cancellation...'),
                ),
              );
            },
            child: Text(
              'Cancel',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ),
        ],
      ),
    );
  }
}

class _UsageTile extends StatelessWidget {
  const _UsageTile({
    required this.icon,
    required this.label,
    required this.remaining,
    required this.total,
    required this.isPremium,
  });

  final IconData icon;
  final String label;
  final int remaining;
  final int total;
  final bool isPremium;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final used = isPremium ? 0 : (total - remaining);
    final fraction = isPremium ? 0.0 : (used / total).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: theme.colorScheme.onSurfaceVariant),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(label, style: theme.textTheme.bodyMedium),
                    Text(
                      isPremium ? 'Unlimited' : '$remaining / $total left',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                if (!isPremium)
                  LinearProgressIndicator(
                    value: fraction,
                    backgroundColor:
                        theme.colorScheme.surfaceContainerHighest,
                    color: fraction > 0.8 ? AppColors.expense : AppColors.teal,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FaqItem extends StatelessWidget {
  const _FaqItem({required this.question, required this.answer});

  final String question;
  final String answer;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ExpansionTile(
      title: Text(
        question,
        style: theme.textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w500,
        ),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(
            answer,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ],
    );
  }
}
