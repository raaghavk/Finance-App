import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';

/// An expandable Floating Action Button that fans out four quick-action
/// mini-FABs for voice input, chat input, receipt scan, and manual entry.
class QuickActionFab extends StatefulWidget {
  const QuickActionFab({super.key});

  @override
  State<QuickActionFab> createState() => _QuickActionFabState();
}

class _QuickActionFabState extends State<QuickActionFab>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _expandAnimation;
  bool _isOpen = false;

  static const _kDuration = Duration(milliseconds: 250);

  // The mini-FAB definitions.
  static const List<_MiniAction> _actions = [
    _MiniAction(
      icon: Icons.mic_rounded,
      label: 'Voice Input',
      route: AppRoutes.voiceInput,
      color: Color(0xFF7C4DFF),
    ),
    _MiniAction(
      icon: Icons.chat_bubble_outline_rounded,
      label: 'Chat Input',
      route: AppRoutes.chatInput,
      color: Color(0xFF00ACC1),
    ),
    _MiniAction(
      icon: Icons.camera_alt_outlined,
      label: 'Scan Receipt',
      route: AppRoutes.receiptScan,
      color: Color(0xFFFF7043),
    ),
    _MiniAction(
      icon: Icons.edit_outlined,
      label: 'Manual Entry',
      route: AppRoutes.addTransaction,
      color: Color(0xFF66BB6A),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: _kDuration);
    _expandAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
      reverseCurve: Curves.easeIn,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _isOpen = !_isOpen;
      if (_isOpen) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    });
  }

  void _close() {
    if (_isOpen) _toggle();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      height: 340,
      child: Stack(
        alignment: Alignment.bottomRight,
        children: [
          // Invisible tap-catcher to close when tapping outside
          if (_isOpen)
            Positioned.fill(
              child: GestureDetector(
                onTap: _close,
                behavior: HitTestBehavior.opaque,
                child: const SizedBox.expand(),
              ),
            ),

          // Mini-FABs (fanning upward)
          ..._buildMiniFabs(),

          // Main FAB
          _buildMainFab(),
        ],
      ),
    );
  }

  // ── Main FAB ─────────────────────────────────────────────────────────────

  Widget _buildMainFab() {
    return FloatingActionButton(
      heroTag: 'quickActionFab',
      onPressed: _toggle,
      child: AnimatedBuilder(
        animation: _expandAnimation,
        builder: (context, child) {
          return Transform.rotate(
            angle: _expandAnimation.value * math.pi / 4,
            child: const Icon(Icons.add, size: 28),
          );
        },
      ),
    );
  }

  // ── Mini FABs ────────────────────────────────────────────────────────────

  List<Widget> _buildMiniFabs() {
    return List.generate(_actions.length, (i) {
      final action = _actions[i];
      // Fan out vertically with spacing.
      final offsetY = (i + 1) * 60.0;

      return AnimatedBuilder(
        animation: _expandAnimation,
        builder: (context, child) {
          final scale = _expandAnimation.value;
          return Positioned(
            bottom: 8 + offsetY * scale,
            right: 4,
            child: Opacity(
              opacity: scale.clamp(0.0, 1.0),
              child: Transform.scale(
                scale: scale.clamp(0.0, 1.0),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Label chip
                    Material(
                      elevation: 2,
                      borderRadius: BorderRadius.circular(8),
                      color: Theme.of(context).colorScheme.surfaceContainer,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        child: Text(
                          action.label,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Mini FAB
                    FloatingActionButton.small(
                      heroTag: 'quickAction_$i',
                      backgroundColor: action.color,
                      foregroundColor: Colors.white,
                      onPressed: () {
                        _close();
                        context.push(action.route);
                      },
                      child: Icon(action.icon, size: 20),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      );
    });
  }
}

// ---------------------------------------------------------------------------
// Mini action definition
// ---------------------------------------------------------------------------

class _MiniAction {
  const _MiniAction({
    required this.icon,
    required this.label,
    required this.route,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String route;
  final Color color;
}

// ---------------------------------------------------------------------------
// AnimatedBuilder helper (alias for AnimatedBuilder)
// ---------------------------------------------------------------------------
// Flutter's AnimatedBuilder is the correct widget here; we use it directly.
