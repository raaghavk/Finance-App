import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

class PremiumScreen extends ConsumerWidget {
  const PremiumScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPremium = ref.watch(isPremiumProvider);
    final settings = ref.watch(settingsProvider);
    final remaining = ref.watch(remainingFreeAiUsesProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0B0B0F),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => context.pop(),
        ),
        title: const Text('PaisaTrack Pro'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const SizedBox(height: 8),

            // Plan status card
            _PlanStatusCard(isPremium: isPremium, settings: settings),
            const SizedBox(height: 24),

            // AI usage meter (free users only)
            if (!isPremium) ...[
              _AiUsageMeter(remaining: remaining),
              const SizedBox(height: 24),
            ],

            // Feature comparison
            _FeatureComparison(isPremium: isPremium),
            const SizedBox(height: 32),

            // CTA button
            if (!isPremium)
              _UpgradeButton(
                onTap: () => _showPurchaseSheet(context, ref),
              )
            else
              _ManageSubscription(
                onCancel: () => _showCancelSheet(context, ref),
                expiryDate: settings.subscriptionExpiryDate,
              ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _showPurchaseSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141418),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            const Icon(Icons.workspace_premium,
                color: AppColors.tertiary, size: 48),
            const SizedBox(height: 16),
            const Text(
              'Unlock PaisaTrack Pro',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            const Text(
              '\u20b999/month \u2022 Cancel anytime',
              style: TextStyle(color: Color(0xFF8E8E93), fontSize: 15),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, Color(0xFF00BFA5)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: ElevatedButton(
                  onPressed: () async {
                    await ref
                        .read(settingsProvider.notifier)
                        .activatePremium();
                    if (ctx.mounted) Navigator.of(ctx).pop();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content:
                              Text('Welcome to PaisaTrack Pro!'),
                          backgroundColor: AppColors.income,
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text(
                    'Start Pro \u2014 \u20b999/mo',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Maybe later',
                  style: TextStyle(color: Color(0xFF8E8E93))),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _showCancelSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141418),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded,
                color: AppColors.expense, size: 40),
            const SizedBox(height: 16),
            const Text(
              'Cancel Pro?',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            const Text(
              'You\'ll lose access to unlimited AI features,\nunlimited budgets, and smart insights.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF8E8E93), fontSize: 14),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () async {
                  await ref
                      .read(settingsProvider.notifier)
                      .deactivatePremium();
                  if (ctx.mounted) Navigator.of(ctx).pop();
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.expense),
                  foregroundColor: AppColors.expense,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Yes, cancel'),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Keep Pro',
                  style: TextStyle(color: AppColors.primary)),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Plan Status Card ────────────────────────────────────────────────────

class _PlanStatusCard extends StatelessWidget {
  const _PlanStatusCard({required this.isPremium, required this.settings});
  final bool isPremium;
  final UserSettings settings;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: isPremium
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1A3A35), Color(0xFF0D1F1C)],
              )
            : null,
        color: isPremium ? null : const Color(0xFF141418),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isPremium
              ? AppColors.primary.withValues(alpha: 0.4)
              : const Color(0xFF2A2A32),
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: isPremium
                  ? AppColors.primary.withValues(alpha: 0.2)
                  : const Color(0xFF1C1C22),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPremium ? Icons.workspace_premium : Icons.lock_outline,
              color: isPremium ? AppColors.primary : const Color(0xFF8E8E93),
              size: 32,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            isPremium ? 'Pro Plan' : 'Free Plan',
            style: TextStyle(
              color: isPremium ? AppColors.primary : Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            isPremium
                ? 'All features unlocked'
                : 'Upgrade to unlock AI & more',
            style: const TextStyle(color: Color(0xFF8E8E93), fontSize: 14),
          ),
        ],
      ),
    );
  }
}

// ─── AI Usage Meter ──────────────────────────────────────────────────────

class _AiUsageMeter extends StatelessWidget {
  const _AiUsageMeter({required this.remaining});
  final int remaining;

  @override
  Widget build(BuildContext context) {
    final used = UserSettings.freeAiUsageLimit - remaining;
    final progress = used / UserSettings.freeAiUsageLimit;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF141418),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2A32)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Free AI Uses This Month',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600),
              ),
              Text(
                '$used / ${UserSettings.freeAiUsageLimit}',
                style: TextStyle(
                  color: remaining == 0 ? AppColors.expense : AppColors.primary,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: const Color(0xFF1C1C22),
              valueColor: AlwaysStoppedAnimation(
                remaining == 0 ? AppColors.expense : AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            remaining == 0
                ? 'You\'ve used all free AI features. Upgrade for unlimited!'
                : '$remaining AI uses remaining (receipt scan + voice)',
            style: const TextStyle(color: Color(0xFF8E8E93), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

// ─── Feature Comparison ──────────────────────────────────────────────────

class _FeatureComparison extends StatelessWidget {
  const _FeatureComparison({required this.isPremium});
  final bool isPremium;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What you get with Pro',
          style: TextStyle(
              color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 16),
        _FeatureRow(
          icon: Icons.camera_alt_rounded,
          title: 'Receipt Scanner',
          subtitle: 'Snap & auto-log expenses',
          free: '3/mo',
          pro: 'Unlimited',
        ),
        _FeatureRow(
          icon: Icons.mic_rounded,
          title: 'Voice Input',
          subtitle: 'Hindi, Hinglish & English',
          free: '3/mo',
          pro: 'Unlimited',
        ),
        _FeatureRow(
          icon: Icons.insights_rounded,
          title: 'Smart Insights',
          subtitle: 'AI spending analysis & trends',
          free: '\u2014',
          pro: '\u2713',
        ),
        _FeatureRow(
          icon: Icons.bar_chart_rounded,
          title: 'Unlimited Budgets',
          subtitle: 'Free plan: up to 3',
          free: '3 max',
          pro: 'Unlimited',
        ),
        _FeatureRow(
          icon: Icons.picture_as_pdf_rounded,
          title: 'PDF Reports',
          subtitle: 'Monthly financial summaries',
          free: '\u2014',
          pro: '\u2713',
        ),
        _FeatureRow(
          icon: Icons.flight_takeoff_rounded,
          title: 'Travel Mode',
          subtitle: 'Multi-currency trip tracking',
          free: '\u2014',
          pro: 'Coming soon',
        ),
        _FeatureRow(
          icon: Icons.cloud_rounded,
          title: 'Cloud Backup',
          subtitle: 'Sync across devices',
          free: '\u2014',
          pro: 'Coming soon',
        ),
      ],
    );
  }
}

class _FeatureRow extends StatelessWidget {
  const _FeatureRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.free,
    required this.pro,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String free;
  final String pro;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF141418),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1C1C22)),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600)),
                  Text(subtitle,
                      style: const TextStyle(
                          color: Color(0xFF8E8E93), fontSize: 12)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(free,
                    style: const TextStyle(
                        color: Color(0xFF5A5A5E), fontSize: 11)),
                const SizedBox(height: 2),
                Text(pro,
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w700)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Upgrade Button ──────────────────────────────────────────────────────

class _UpgradeButton extends StatelessWidget {
  const _UpgradeButton({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, Color(0xFF00BFA5)],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: onTap,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text(
            'Upgrade to Pro \u2014 \u20b999/mo',
            style: TextStyle(
                color: Colors.white, fontSize: 17, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }
}

// ─── Manage Subscription ─────────────────────────────────────────────────

class _ManageSubscription extends StatelessWidget {
  const _ManageSubscription({required this.onCancel, this.expiryDate});
  final VoidCallback onCancel;
  final String? expiryDate;

  @override
  Widget build(BuildContext context) {
    String expiryText = '';
    if (expiryDate != null && expiryDate!.isNotEmpty) {
      final date = DateTime.tryParse(expiryDate!);
      if (date != null) {
        expiryText =
            'Renews ${date.day}/${date.month}/${date.year}';
      }
    }

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF141418),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              const Icon(Icons.check_circle,
                  color: AppColors.primary, size: 32),
              const SizedBox(height: 8),
              const Text('You\'re on Pro!',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.w700)),
              if (expiryText.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(expiryText,
                    style: const TextStyle(
                        color: Color(0xFF8E8E93), fontSize: 13)),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: onCancel,
          child: const Text('Cancel subscription',
              style: TextStyle(color: Color(0xFF5A5A5E), fontSize: 14)),
        ),
      ],
    );
  }
}
