/// Animation constants for PaisaTrack.
///
/// Provides standardised durations, curves, and page transition builders
/// to ensure smooth, consistent motion throughout the app.
library;

import 'package:flutter/material.dart';

abstract final class AppAnimations {
  // ══════════════════════════════════════════════════════════════════════════
  // DURATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /// Quick micro-interactions: ripples, toggles (150ms).
  static const Duration fast = Duration(milliseconds: 150);

  /// Standard transitions: expansions, fades, color changes (250ms).
  static const Duration normal = Duration(milliseconds: 250);

  /// Deliberate transitions: modals, large layout shifts (400ms).
  static const Duration slow = Duration(milliseconds: 400);

  /// Full-screen page transitions (300ms).
  static const Duration pageTransition = Duration(milliseconds: 300);

  // ══════════════════════════════════════════════════════════════════════════
  // CURVES
  // ══════════════════════════════════════════════════════════════════════════

  /// Default curve for most animations — smooth and natural.
  static const Curve defaultCurve = Curves.easeInOutCubic;

  /// Bounce curve for playful interactions (e.g. FAB press).
  static const Curve bounceCurve = Curves.elasticOut;

  /// Sharp curve for quick snapping motions.
  static const Curve sharpCurve = Curves.easeOutCubic;

  /// Deceleration curve for entering elements.
  static const Curve enterCurve = Curves.decelerate;

  /// Acceleration curve for exiting elements.
  static const Curve exitCurve = Curves.easeInCubic;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE TRANSITIONS
  // ══════════════════════════════════════════════════════════════════════════

  /// Slide-up transition for modals and bottom-sheet-style pages.
  static Widget slideUpTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final tween = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).chain(CurveTween(curve: defaultCurve));

    final fadeTween = Tween<double>(
      begin: 0,
      end: 1,
    ).chain(CurveTween(curve: sharpCurve));

    return SlideTransition(
      position: animation.drive(tween),
      child: FadeTransition(
        opacity: animation.drive(fadeTween),
        child: child,
      ),
    );
  }

  /// Fade transition for tab switches and lateral navigation.
  static Widget fadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: animation.drive(
        Tween<double>(begin: 0, end: 1).chain(
          CurveTween(curve: sharpCurve),
        ),
      ),
      child: child,
    );
  }

  /// Shared-axis horizontal transition for sibling page navigation.
  static Widget sharedAxisHorizontalTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final slideTween = Tween<Offset>(
      begin: const Offset(0.05, 0),
      end: Offset.zero,
    ).chain(CurveTween(curve: defaultCurve));

    final fadeTween = Tween<double>(
      begin: 0,
      end: 1,
    ).chain(CurveTween(curve: sharpCurve));

    return SlideTransition(
      position: animation.drive(slideTween),
      child: FadeTransition(
        opacity: animation.drive(fadeTween),
        child: child,
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOM PAGE ROUTE
  // ══════════════════════════════════════════════════════════════════════════

  /// Creates a [PageRouteBuilder] with the slide-up modal transition.
  static PageRouteBuilder<T> modalRoute<T>({
    required WidgetBuilder builder,
    RouteSettings? settings,
  }) {
    return PageRouteBuilder<T>(
      settings: settings,
      transitionDuration: pageTransition,
      reverseTransitionDuration: pageTransition,
      pageBuilder: (context, animation, secondaryAnimation) =>
          builder(context),
      transitionsBuilder: slideUpTransition,
    );
  }

  /// Creates a [PageRouteBuilder] with the fade transition.
  static PageRouteBuilder<T> fadeRoute<T>({
    required WidgetBuilder builder,
    RouteSettings? settings,
  }) {
    return PageRouteBuilder<T>(
      settings: settings,
      transitionDuration: pageTransition,
      reverseTransitionDuration: fast,
      pageBuilder: (context, animation, secondaryAnimation) =>
          builder(context),
      transitionsBuilder: fadeTransition,
    );
  }
}
