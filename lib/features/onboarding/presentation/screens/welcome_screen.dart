/// Onboarding welcome / splash screen.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/core/theme/app_colors.dart';

/// First screen of the onboarding flow. Shows app branding and feature
/// highlights, then lets the user proceed to language selection.
class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            children: [
              const Spacer(flex: 2),

              // ── Logo Placeholder ─────────────────────────────────
              Container(
                width: 112,
                height: 112,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.saffron, AppColors.teal],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.saffron.withValues(alpha: 0.3),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.account_balance_wallet,
                  size: 56,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),

              // ── App Name ─────────────────────────────────────────
              Text(
                AppConstants.appName,
                style: theme.textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),

              // ── Tagline ──────────────────────────────────────────
              Text(
                AppConstants.tagline,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const Spacer(),

              // ── Feature Highlights ───────────────────────────────
              _FeatureHighlight(
                icon: Icons.mic,
                text: 'Voice tracking \u2013 just speak to log expenses',
              ),
              const SizedBox(height: 12),
              _FeatureHighlight(
                icon: Icons.auto_awesome,
                text: 'Smart budgets powered by AI',
              ),
              const SizedBox(height: 12),
              _FeatureHighlight(
                icon: Icons.flag,
                text: 'India-first \u2013 INR, UPI, and Hindi support',
              ),
              const Spacer(),

              // ── Get Started Button ───────────────────────────────
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => context.go(AppRoutes.onboardingLanguage),
                  child: const Text('Get Started'),
                ),
              ),
              const SizedBox(height: 12),

              // ── Sign In Link ─────────────────────────────────────
              TextButton(
                onPressed: () {
                  // TODO: Navigate to sign-in flow for premium sync users.
                },
                child: Text(
                  'Already have an account? Sign In',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _FeatureHighlight extends StatelessWidget {
  const _FeatureHighlight({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.saffron.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: AppColors.saffron, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: theme.textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
}
