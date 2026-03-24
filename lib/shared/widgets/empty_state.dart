/// An empty-state placeholder with illustration, title, subtitle,
/// and an optional action button.
library;

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class EmptyState extends StatelessWidget {
  const EmptyState({
    required this.title,
    this.subtitle,
    this.lottieAsset,
    this.actionLabel,
    this.onAction,
    super.key,
  });

  /// Primary headline describing the empty state.
  final String title;

  /// Optional secondary description.
  final String? subtitle;

  /// Optional Lottie animation asset path (e.g. `'assets/lottie/empty.json'`).
  /// When `null` a generic icon is displayed instead.
  final String? lottieAsset;

  /// Label for the optional call-to-action button.
  final String? actionLabel;

  /// Callback invoked when the action button is tapped.
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Illustration
            if (lottieAsset != null)
              Lottie.asset(
                lottieAsset!,
                width: 200,
                height: 200,
                repeat: true,
              )
            else
              Icon(
                Icons.inbox_outlined,
                size: 96,
                color: theme.colorScheme.outline,
              ),
            const SizedBox(height: 24),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),

            // Subtitle
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.outline,
                ),
              ),
            ],

            // Action button
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              FilledButton(
                onPressed: onAction,
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
