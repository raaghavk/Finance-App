/// Route guards for premium and other feature-gated routes.
library;

import 'package:paisa_track/core/router/routes.dart';

/// Subscription tiers recognised by PaisaTrack.
enum SubscriptionTier { free, premium }

/// Guards that restrict navigation based on subscription state.
class PremiumGuard {
  PremiumGuard._();

  /// Routes that require an active premium subscription.
  static const Set<String> _premiumRoutes = {
    AppRoutes.smartBudget,
    AppRoutes.manageSub,
  };

  /// Returns a redirect path to the premium upsell screen when a
  /// [SubscriptionTier.free] user attempts to access a premium route.
  ///
  /// Returns `null` if access is allowed.
  static String? guardPremiumFeature(
    SubscriptionTier tier,
    String location,
  ) {
    if (tier == SubscriptionTier.free && _premiumRoutes.contains(location)) {
      return AppRoutes.premium;
    }
    return null;
  }
}
