/// Reusable onboarding page template.
library;

import 'package:flutter/material.dart';

/// A standardised layout for onboarding pages.
///
/// Top 40% is an illustration/image area, followed by title, description,
/// custom content, and a bottom action button.
class OnboardingPage extends StatelessWidget {
  const OnboardingPage({
    required this.title,
    this.description,
    this.illustration,
    this.content,
    this.buttonLabel,
    this.onButtonPressed,
    this.secondaryButtonLabel,
    this.onSecondaryButtonPressed,
    super.key,
  });

  /// Optional widget shown in the top illustration area.
  final Widget? illustration;

  /// Page title.
  final String title;

  /// Descriptive text below the title.
  final String? description;

  /// Custom content rendered between the description and the action button.
  final Widget? content;

  /// Label for the primary action button. If null, no button is shown.
  final String? buttonLabel;

  /// Called when the primary action button is pressed.
  final VoidCallback? onButtonPressed;

  /// Label for an optional secondary/text button.
  final String? secondaryButtonLabel;

  /// Called when the secondary button is pressed.
  final VoidCallback? onSecondaryButtonPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final size = MediaQuery.sizeOf(context);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          children: [
            // ── Illustration Area (top ~40%) ────────────────────────
            if (illustration != null)
              SizedBox(
                height: size.height * 0.35,
                width: double.infinity,
                child: Center(child: illustration),
              )
            else
              SizedBox(height: size.height * 0.05),

            // ── Title ──────────────────────────────────────────────
            Text(
              title,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              const SizedBox(height: 8),
              Text(
                description!,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 24),

            // ── Content ────────────────────────────────────────────
            if (content != null) Expanded(child: content!),
            if (content == null) const Spacer(),

            // ── Buttons ────────────────────────────────────────────
            if (buttonLabel != null) ...[
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: onButtonPressed,
                  child: Text(buttonLabel!),
                ),
              ),
            ],
            if (secondaryButtonLabel != null) ...[
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: onSecondaryButtonPressed,
                  child: Text(secondaryButtonLabel!),
                ),
              ),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
