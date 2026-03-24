import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Animated waveform visualisation shown while the microphone is active.
///
/// Renders a row of vertical bars whose heights oscillate smoothly based on
/// [audioLevel]. When [isActive] is `false` the bars settle to a minimal
/// resting height.
class VoiceWaveform extends StatefulWidget {
  const VoiceWaveform({
    required this.isActive,
    this.audioLevel = 0.0,
    this.barCount = 20,
    this.color,
    this.height = 80,
    this.barWidth = 4.0,
    this.barSpacing = 3.0,
    super.key,
  });

  /// Whether the waveform should animate (i.e. the mic is recording).
  final bool isActive;

  /// Current audio input level (0.0 – 1.0).
  final double audioLevel;

  /// How many vertical bars to render.
  final int barCount;

  /// Bar colour. Defaults to teal if not specified.
  final Color? color;

  /// Total widget height.
  final double height;

  /// Width of each individual bar.
  final double barWidth;

  /// Gap between adjacent bars.
  final double barSpacing;

  @override
  State<VoiceWaveform> createState() => _VoiceWaveformState();
}

class _VoiceWaveformState extends State<VoiceWaveform>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    if (widget.isActive) _controller.repeat();
  }

  @override
  void didUpdateWidget(covariant VoiceWaveform oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !_controller.isAnimating) {
      _controller.repeat();
    } else if (!widget.isActive && _controller.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.color ?? Colors.teal;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return SizedBox(
          height: widget.height,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(widget.barCount, (index) {
              final phase = index / widget.barCount;
              final wave = widget.isActive
                  ? _computeBarHeight(phase, _controller.value)
                  : 0.08;
              final barHeight =
                  (widget.height * wave).clamp(4.0, widget.height);

              return AnimatedContainer(
                duration: const Duration(milliseconds: 120),
                curve: Curves.easeInOut,
                width: widget.barWidth,
                height: barHeight,
                margin: EdgeInsets.symmetric(
                  horizontal: widget.barSpacing / 2,
                ),
                decoration: BoxDecoration(
                  color: color.withOpacity(widget.isActive ? 0.9 : 0.3),
                  borderRadius: BorderRadius.circular(widget.barWidth / 2),
                ),
              );
            }),
          ),
        );
      },
    );
  }

  /// Compute a 0.0–1.0 height factor for a bar at [phase] given the current
  /// animation [time] (also 0.0–1.0).
  double _computeBarHeight(double phase, double time) {
    // Combine a sine wave with the live audio level for organic motion.
    final sinValue =
        (math.sin((phase + time) * 2 * math.pi) + 1) / 2; // 0..1
    const base = 0.15;
    final audioContribution = widget.audioLevel * 0.6;
    return base + sinValue * (0.25 + audioContribution);
  }
}
