/// Premium upsell screen with feature comparison and purchase buttons.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/features/premium/presentation/widgets/feature_comparison_table.dart';
import 'package:paisa_track/features/premium/providers/subscription_provider.dart';

/// Full-screen premium upsell with hero section, feature comparison,
/// pricing, and purchase CTAs.
class PremiumUpsellScreen extends ConsumerStatefulWidget {
  const PremiumUpsellScreen({super.key});

  @override
  ConsumerState<PremiumUpsellScreen> createState() =>
      _PremiumUpsellScreenState();
}

class _PremiumUpsellScreenState extends ConsumerState<PremiumUpsellScreen> {
  bool _isPurchasing = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── Hero Section ──────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.only(
                top: MediaQuery.paddingOf(context).top + 16,
                left: 24,
                right: 24,
                bottom: 32,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.saffron, AppColors.saffronDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  // Close button
                  Align(
                    alignment: Alignment.topRight,
                    child: IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => context.pop(),
                    ),
                  ),
                  const Icon(
                    Icons.auto_awesome,
                    size: 56,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Unlock PaisaTrack Premium',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Get unlimited access to all features',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),

          // ── Feature Comparison ────────────────────────────────────────
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 24, 16, 0),
              child: FeatureComparisonTable(),
            ),
          ),

          // ── Pricing & Purchase ────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 0),
              child: Column(
                children: [
                  // Trust indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _TrustChip(label: '7-day free trial'),
                      const SizedBox(width: 12),
                      _TrustChip(label: 'Cancel anytime'),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Monthly button
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _isPurchasing
                          ? null
                          : () => _purchase('monthly'),
                      child: _isPurchasing
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              '\u20B9149/month',
                              style: TextStyle(fontSize: 16),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Yearly button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: _isPurchasing
                          ? null
                          : () => _purchase('yearly'),
                      child: const Column(
                        children: [
                          Text(
                            '\u20B91,299/year',
                            style: TextStyle(fontSize: 16),
                          ),
                          Text(
                            'Save 28%',
                            style: TextStyle(fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Restore
                  TextButton(
                    onPressed: _isPurchasing ? null : _restore,
                    child: Text(
                      'Restore Purchase',
                      style: TextStyle(color: colorScheme.onSurfaceVariant),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Maybe later
                  TextButton(
                    onPressed: () => context.pop(),
                    child: Text(
                      'Maybe Later',
                      style: TextStyle(color: colorScheme.onSurfaceVariant),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _purchase(String packageId) async {
    setState(() => _isPurchasing = true);
    final success = await ref
        .read(subscriptionNotifierProvider.notifier)
        .purchase(packageId);
    if (mounted) {
      setState(() => _isPurchasing = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Welcome to Premium!')),
        );
        context.pop();
      }
    }
  }

  Future<void> _restore() async {
    setState(() => _isPurchasing = true);
    final restored =
        await ref.read(subscriptionNotifierProvider.notifier).restore();
    if (mounted) {
      setState(() => _isPurchasing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            restored
                ? 'Purchase restored successfully!'
                : 'No previous purchase found.',
          ),
        ),
      );
      if (restored) context.pop();
    }
  }
}

class _TrustChip extends StatelessWidget {
  const _TrustChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.check_circle, size: 14, color: AppColors.teal),
          const SizedBox(width: 4),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
