/// Reusable settings list tile with optional premium badge.
library;

import 'package:flutter/material.dart';

/// A styled [ListTile] used across the settings screens.
///
/// Supports leading icon, title, optional subtitle, trailing widget
/// (defaults to a chevron), and an optional premium badge overlay.
class SettingsTile extends StatelessWidget {
  const SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.showPremiumBadge = false,
    super.key,
  });

  /// Leading icon displayed before the title.
  final IconData icon;

  /// Primary text label.
  final String title;

  /// Optional secondary text displayed below the title.
  final String? subtitle;

  /// Trailing widget. Defaults to a right-chevron icon.
  final Widget? trailing;

  /// Called when the tile is tapped.
  final VoidCallback? onTap;

  /// When true, a small "PRO" badge is shown on the leading icon.
  final bool showPremiumBadge;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    Widget leadingWidget = Icon(icon, color: colorScheme.onSurfaceVariant);

    if (showPremiumBadge) {
      leadingWidget = Stack(
        clipBehavior: Clip.none,
        children: [
          leadingWidget,
          Positioned(
            right: -6,
            top: -6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B35), // saffron
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'PRO',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.white,
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      );
    }

    return ListTile(
      leading: leadingWidget,
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: trailing ?? const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
