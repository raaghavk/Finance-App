/// Paywall overlay that blurs and dims locked premium content.
library;

import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/core/theme/app_colors.dart';

/// Overlays a semi-transparent, blurred paywall on top of [child].
///
/// Shows a lock icon, "Premium Feature" text, and an "Upgrade" button
/// that navigates to the premium upsell screen.
class PaywallOverlay extends StatelessWidget {
  const PaywallOverlay({
    required this.child,
    this.isLocked = true,
    super.key,
  });

  /// The content to display (blurred when locked).
  final Widget child;

  /// Whether the paywall should be shown. When false, [child] renders normally.
  final bool isLocked;

  @override
  Widget build(BuildContext context) {
    if (!isLocked) return child;

    final theme = Theme.of(context);

    return Stack(
      children: [
        // ── Blurred child content ──────────────────────────────────
        ClipRect(
          child: ImageFiltered(
            imageFilter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
            child: child,
          ),
        ),

        // ── Dim overlay ────────────────────────────────────────────
        Positioned.fill(
          child: Container(
            color: theme.colorScheme.surface.withValues(alpha: 0.6),
          ),
        ),

        // ── Lock UI ────────────────────────────────────────────────
        Positioned.fill(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.saffron.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.lock_outline,
                    size: 32,
                    color: AppColors.saffron,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Premium Feature',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Upgrade to unlock this feature',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => context.go(AppRoutes.premium),
                  icon: const Icon(Icons.star, size: 18),
                  label: const Text('Upgrade'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.saffron,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
