/// Onboarding currency selection screen.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/currency_constants.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/core/theme/app_colors.dart';
import 'package:paisa_track/features/onboarding/providers/onboarding_provider.dart';

/// Lets the user pick their primary currency during onboarding.
class CurrencySelectScreen extends ConsumerWidget {
  const CurrencySelectScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final onboarding = ref.watch(onboardingNotifierProvider);
    final selected = onboarding.selectedCurrency;
    final currencies = CurrencyConstants.supportedCurrencies;
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // INR is always first and shown as the recommended default.
    final inr = currencies.first;
    final others = currencies.skip(1).toList();

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
                  'Primary Currency',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'You can change this later in Settings',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // ── Recommended (INR) ────────────────────────────────
              GestureDetector(
                onTap: () => ref
                    .read(onboardingNotifierProvider.notifier)
                    .setCurrency(inr.code),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: selected == inr.code
                          ? colorScheme.primary
                          : colorScheme.outlineVariant,
                      width: selected == inr.code ? 2 : 1,
                    ),
                    color: selected == inr.code
                        ? colorScheme.primary.withValues(alpha: 0.05)
                        : colorScheme.surface,
                  ),
                  child: Row(
                    children: [
                      Text(inr.flag, style: const TextStyle(fontSize: 32)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                '${inr.code} (${inr.symbol})',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.teal.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'Recommended',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: AppColors.teal,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            inr.name,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      if (selected == inr.code)
                        Icon(Icons.check_circle, color: colorScheme.primary),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── Other Currencies (Grid) ──────────────────────────
              Expanded(
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: 1.2,
                  ),
                  itemCount: others.length,
                  itemBuilder: (context, index) {
                    final currency = others[index];
                    final isSelected = currency.code == selected;

                    return GestureDetector(
                      onTap: () => ref
                          .read(onboardingNotifierProvider.notifier)
                          .setCurrency(currency.code),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? colorScheme.primary
                                : colorScheme.outlineVariant,
                            width: isSelected ? 2 : 1,
                          ),
                          color: isSelected
                              ? colorScheme.primary.withValues(alpha: 0.05)
                              : colorScheme.surface,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              currency.flag,
                              style: const TextStyle(fontSize: 24),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              currency.code,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                            Text(
                              currency.symbol,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),

              // ── Continue Button ──────────────────────────────────
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () =>
                      context.go(AppRoutes.onboardingPermissions),
                  child: const Text('Continue'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
