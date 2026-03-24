import 'package:flutter/material.dart';

/// A custom animated progress bar with rounded corners and color
/// transitions: green -> yellow -> red based on the fill percentage.
class BudgetProgressBar extends StatelessWidget {
  const BudgetProgressBar({
    required this.percentage,
    this.height = 10,
    this.showLabel = false,
    this.animationDuration = const Duration(milliseconds: 600),
    super.key,
  });

  /// Percentage of the budget consumed (0.0 - 100.0+).
  final double percentage;

  /// Height of the progress bar.
  final double height;

  /// Whether to display the percentage label on the trailing side.
  final bool showLabel;

  /// Duration for the animated fill transition.
  final Duration animationDuration;

  /// Returns a colour based on the percentage:
  ///   0-50%  -> green
  ///  50-80%  -> yellow / amber
  ///  80-100% -> orange
  ///  100%+   -> red
  static Color colorForPercentage(double pct) {
    if (pct <= 50) return const Color(0xFF4CAF50); // green
    if (pct <= 80) return const Color(0xFFFFC107); // amber
    if (pct <= 100) return const Color(0xFFFF9800); // orange
    return const Color(0xFFF44336); // red
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final clampedPct = percentage.clamp(0.0, 100.0);
    final fillFraction = clampedPct / 100;
    final barColor = colorForPercentage(percentage);

    return Row(
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(height / 2),
            child: SizedBox(
              height: height,
              child: Stack(
                children: [
                  // Background track.
                  Container(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest,
                      borderRadius: BorderRadius.circular(height / 2),
                    ),
                  ),
                  // Animated fill.
                  AnimatedFractionallySizedBox(
                    duration: animationDuration,
                    curve: Curves.easeInOut,
                    widthFactor: fillFraction,
                    child: Container(
                      decoration: BoxDecoration(
                        color: barColor,
                        borderRadius: BorderRadius.circular(height / 2),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (showLabel) ...[
          const SizedBox(width: 8),
          SizedBox(
            width: 42,
            child: Text(
              '${percentage.toStringAsFixed(0)}%',
              textAlign: TextAlign.end,
              style: theme.textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: barColor,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// A [FractionallySizedBox] that animates its [widthFactor] changes.
class AnimatedFractionallySizedBox extends ImplicitlyAnimatedWidget {
  const AnimatedFractionallySizedBox({
    required this.widthFactor,
    required this.child,
    required super.duration,
    super.curve,
    super.key,
  });

  /// Target width as a fraction of the parent's width (0.0 - 1.0).
  final double widthFactor;

  /// The widget to size.
  final Widget child;

  @override
  AnimatedWidgetBaseState<AnimatedFractionallySizedBox> createState() =>
      _AnimatedFractionallySizedBoxState();
}

class _AnimatedFractionallySizedBoxState
    extends AnimatedWidgetBaseState<AnimatedFractionallySizedBox> {
  Tween<double>? _widthFactor;

  @override
  void forEachTween(TweenVisitor<dynamic> visitor) {
    _widthFactor = visitor(
      _widthFactor,
      widget.widthFactor,
      (dynamic value) => Tween<double>(begin: value as double),
    ) as Tween<double>?;
  }

  @override
  Widget build(BuildContext context) {
    return FractionallySizedBox(
      alignment: Alignment.centerLeft,
      widthFactor: _widthFactor?.evaluate(animation) ?? widget.widthFactor,
      child: widget.child,
    );
  }
}
