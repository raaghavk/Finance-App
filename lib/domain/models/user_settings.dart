import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/subscription_tier.dart';

part 'user_settings.freezed.dart';
part 'user_settings.g.dart';

/// All user-configurable application settings.
@freezed
class UserSettings with _$UserSettings {
  const factory UserSettings({
    /// BCP 47 locale code (e.g. "en", "hi").
    @Default('en') String locale,

    /// ISO 4217 code of the user's primary currency.
    @Default('INR') String primaryCurrency,

    /// Theme mode: "system", "light", or "dark".
    @Default('system') String themeMode,

    /// Whether the user has completed onboarding.
    @Default(false) bool onboardingComplete,

    /// The default account used for new transactions.
    String? defaultAccountId,

    /// Current subscription tier.
    @Default(SubscriptionTier.free) SubscriptionTier subscriptionTier,

    /// When the premium subscription expires.
    DateTime? subscriptionExpiry,

    /// When the last cloud sync completed.
    DateTime? lastSyncAt,

    /// Whether push notifications are enabled.
    @Default(true) bool notificationEnabled,

    /// Whether automatic SMS parsing is enabled.
    @Default(false) bool smsTrackingEnabled,

    /// Whether biometric lock is enabled.
    @Default(false) bool biometricLockEnabled,
  }) = _UserSettings;

  factory UserSettings.fromJson(Map<String, dynamic> json) =>
      _$UserSettingsFromJson(json);
}
