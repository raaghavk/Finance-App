/// Feature comparison table showing Free vs Premium capabilities.
library;

import 'package:flutter/material.dart';

import 'package:paisa_track/core/theme/app_colors.dart';

/// A two-column comparison table highlighting Free vs Premium features.
///
/// The Premium column is accented with the saffron/gold brand colour.
/// Rows animate in with a staggered reveal effect.
class FeatureComparisonTable extends StatefulWidget {
  const FeatureComparisonTable({super.key});

  @override
  State<FeatureComparisonTable> createState() => _FeatureComparisonTableState();
}

class _FeatureComparisonTableState extends State<FeatureComparisonTable>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  static const _features = <_Feature>[
    _Feature(name: 'Voice Inputs', free: '10/month', premium: 'Unlimited'),
    _Feature(name: 'Chat AI Inputs', free: '10/month', premium: 'Unlimited'),
    _Feature(name: 'Receipt OCR', free: '5/month', premium: 'Unlimited'),
    _Feature(name: 'Cloud Sync', free: false, premium: true),
    _Feature(name: 'AI Smart Budgets', free: false, premium: true),
    _Feature(name: 'SMS Tracking', free: false, premium: true),
    _Feature(name: 'Full History Export', free: false, premium: true),
    _Feature(name: 'Biometric Lock', free: false, premium: true),
    _Feature(name: 'Custom Categories', free: 'Limited', premium: 'Unlimited'),
    _Feature(name: 'Accounts', free: '2', premium: 'Unlimited'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return FadeTransition(
      opacity: _animation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.1),
          end: Offset.zero,
        ).animate(_animation),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // ── Header Row ──────────────────────────────────────
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: Text(
                        'Feature',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text(
                        'Free',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.saffron.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Premium',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.saffron,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 24),

                // ── Feature Rows ────────────────────────────────────
                ...List.generate(_features.length, (index) {
                  final feature = _features[index];
                  final delay = index / _features.length;

                  return TweenAnimationBuilder<double>(
                    key: ValueKey(feature.name),
                    tween: Tween(begin: 0, end: 1),
                    duration: Duration(
                      milliseconds: 400 + (index * 80),
                    ),
                    builder: (context, value, child) => Opacity(
                      opacity: value,
                      child: Transform.translate(
                        offset: Offset(0, 10 * (1 - value)),
                        child: child,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Text(
                              feature.name,
                              style: theme.textTheme.bodyMedium,
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: _buildCell(
                              context,
                              feature.free,
                              isHighlighted: false,
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: _buildCell(
                              context,
                              feature.premium,
                              isHighlighted: true,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCell(
    BuildContext context,
    Object value, {
    required bool isHighlighted,
  }) {
    final theme = Theme.of(context);

    if (value is bool) {
      return Icon(
        value ? Icons.check_circle : Icons.cancel,
        color: value
            ? (isHighlighted ? AppColors.saffron : AppColors.teal)
            : theme.colorScheme.outlineVariant,
        size: 20,
      );
    }

    return Text(
      value.toString(),
      style: theme.textTheme.bodySmall?.copyWith(
        color: isHighlighted
            ? AppColors.saffron
            : theme.colorScheme.onSurfaceVariant,
        fontWeight: isHighlighted ? FontWeight.w600 : FontWeight.normal,
      ),
      textAlign: TextAlign.center,
    );
  }
}

class _Feature {
  const _Feature({
    required this.name,
    required this.free,
    required this.premium,
  });

  final String name;

  /// Either a [bool] (check/cross) or a [String] description.
  final Object free;

  /// Either a [bool] (check/cross) or a [String] description.
  final Object premium;
}
