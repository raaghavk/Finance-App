/// A compact "PRO" badge chip that navigates to the premium upsell screen.
library;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/router/routes.dart';

class PremiumBadge extends StatelessWidget {
  const PremiumBadge({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ActionChip(
      avatar: Icon(
        Icons.lock,
        size: 16,
        color: theme.colorScheme.onTertiaryContainer,
      ),
      label: Text(
        'PRO',
        style: theme.textTheme.labelSmall?.copyWith(
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.onTertiaryContainer,
        ),
      ),
      backgroundColor: theme.colorScheme.tertiaryContainer,
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      onPressed: () => context.push(AppRoutes.premium),
    );
  }
}
