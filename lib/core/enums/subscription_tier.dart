/// User subscription tiers.
library;

/// Represents the subscription level of a user account.
enum SubscriptionTier {
  /// Free tier with usage limits defined in [AppConstants].
  free('Free', 'फ्री'),

  /// Premium tier with unlimited access to all features.
  premium('Premium', 'प्रीमियम');

  const SubscriptionTier(this.label, this.labelHi);

  /// English display label.
  final String label;

  /// Hindi display label.
  final String labelHi;

  /// Whether this tier is the paid premium tier.
  bool get isPremium => this == SubscriptionTier.premium;

  /// Whether this tier is the free tier.
  bool get isFree => this == SubscriptionTier.free;
}
