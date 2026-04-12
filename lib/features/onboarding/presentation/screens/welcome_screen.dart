import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/providers/app_providers.dart';
import 'package:paisa_track/core/theme/app_colors.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageController = PageController();
  int _page = 0;

  static const _pages = [
    _OnboardingPage(
      emoji: '₹',
      title: 'Har Paisa, Har Pal',
      subtitle: 'Track every rupee, every moment.\nBuilt for India.',
      features: [
        '30+ desi categories (Chai, Auto, Kirana…)',
        'Hindi & Hinglish support',
        'Works offline — no login needed',
      ],
    ),
    _OnboardingPage(
      emoji: '🎤',
      title: 'Log by Voice',
      subtitle: 'Just say what you spent.\nWe\'ll handle the rest.',
      features: [
        '"Aaj lunch pe 150 rupaye"',
        '"Yesterday auto fare 80"',
        '"Kirana 400"',
      ],
    ),
    _OnboardingPage(
      emoji: '📊',
      title: 'Smart Budgets',
      subtitle: 'Set limits, track spending,\nstay on budget.',
      features: [
        'Monthly spending limits by category',
        'Visual progress bars',
        'Alerts when you\'re near the limit',
      ],
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _next() {
    if (_page < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  Future<void> _finish() async {
    await ref.read(settingsProvider.notifier).completeOnboarding();
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: _pages.length,
              onPageChanged: (i) => setState(() => _page = i),
              itemBuilder: (context, i) => _PageContent(page: _pages[i]),
            ),
          ),

          // ── Bottom nav ───────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 48),
            child: Column(
              children: [
                // Page dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    _pages.length,
                    (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: _page == i ? 24 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _page == i
                            ? AppColors.primary
                            : AppColors.primary.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // CTA button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: FilledButton(
                    onPressed: _next,
                    style: FilledButton.styleFrom(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text(
                      _page == _pages.length - 1
                          ? 'Get Started'
                          : 'Continue',
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),

                if (_page < _pages.length - 1) ...[
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: _finish,
                    child: Text(
                      'Skip',
                      style: TextStyle(
                          color: theme.colorScheme.onSurfaceVariant),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PageContent extends StatelessWidget {
  const _PageContent({required this.page});
  final _OnboardingPage page;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Emoji / Icon
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: AppColors.balanceCardGradient,
                borderRadius: BorderRadius.circular(28),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  page.emoji,
                  style: const TextStyle(fontSize: 44),
                ),
              ),
            ),

            const SizedBox(height: 36),

            Text(
              page.title,
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w800,
                height: 1.2,
              ),
            ),

            const SizedBox(height: 12),

            Text(
              page.subtitle,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                height: 1.5,
              ),
            ),

            const SizedBox(height: 32),

            // Feature list
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: AppColors.primary.withOpacity(0.1)),
              ),
              child: Column(
                children: page.features
                    .map((f) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle_rounded,
                                  color: AppColors.primary, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(f,
                                    style: theme.textTheme.bodyMedium),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingPage {
  const _OnboardingPage({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.features,
  });

  final String emoji;
  final String title;
  final String subtitle;
  final List<String> features;
}
