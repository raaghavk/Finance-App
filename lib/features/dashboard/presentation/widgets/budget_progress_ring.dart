import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/domain/models/budget_progress.dart';
import 'package:paisa_track/features/dashboard/providers/dashboard_provider.dart';

/// A horizontally scrollable list of circular budget-progress rings.
///
/// Each ring shows the percentage of a budget consumed and changes colour
/// based on utilisation:
/// * **Green** - under 70%
/// * **Yellow** - 70-90%
/// * **Red** - over 90%
class BudgetProgressRing extends ConsumerWidget {
  const BudgetProgressRing({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncProgress = ref.watch(activeBudgetProgressProvider);

    return asyncProgress.when(
      loading: () => const SizedBox(
        height: 140,
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text(
          'Could not load budgets',
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
      ),
      data: (progressList) {
        if (progressList.isEmpty) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text(
                'No active budgets',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ),
          );
        }

        return SizedBox(
          height: 148,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: progressList.length,
            separatorBuilder: (_, __) => const SizedBox(width: 16),
            itemBuilder: (context, index) {
              return _BudgetRingItem(progress: progressList[index]);
            },
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Single ring item
// ---------------------------------------------------------------------------

class _BudgetRingItem extends StatelessWidget {
  const _BudgetRingItem({required this.progress});

  final BudgetProgress progress;

  Color _ringColor(double percentage) {
    if (percentage >= 90) return const Color(0xFFEF5350); // red
    if (percentage >= 70) return const Color(0xFFFFC107); // yellow
    return const Color(0xFF66BB6A); // green
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = _ringColor(progress.percentage);
    final currencyFormat = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '\u20B9',
      decimalDigits: 0,
    );

    return GestureDetector(
      onTap: () {
        // Navigate to budget detail screen.
        context.push('/budgets/${progress.budget.id}');
      },
      child: SizedBox(
        width: 100,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Ring
            SizedBox(
              width: 72,
              height: 72,
              child: CustomPaint(
                painter: _RingPainter(
                  percentage: progress.percentage.clamp(0, 100),
                  color: color,
                  trackColor:
                      theme.colorScheme.surfaceContainerHighest,
                ),
                child: Center(
                  child: Text(
                    '${progress.percentage.clamp(0, 999).toStringAsFixed(0)}%',
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Budget name
            Text(
              progress.budget.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),

            // Spent / limit
            Text(
              '${currencyFormat.format(progress.spent)} / ${currencyFormat.format(progress.budget.limitAmount)}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Custom ring painter
// ---------------------------------------------------------------------------

class _RingPainter extends CustomPainter {
  _RingPainter({
    required this.percentage,
    required this.color,
    required this.trackColor,
  });

  final double percentage;
  final Color color;
  final Color trackColor;

  @override
  void paint(Canvas canvas, Size size) {
    final strokeWidth = 6.0;
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (math.min(size.width, size.height) - strokeWidth) / 2;

    // Track
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;
    canvas.drawCircle(center, radius, trackPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final sweepAngle = 2 * math.pi * (percentage / 100).clamp(0.0, 1.0);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2, // start from top
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) =>
      oldDelegate.percentage != percentage || oldDelegate.color != color;
}
