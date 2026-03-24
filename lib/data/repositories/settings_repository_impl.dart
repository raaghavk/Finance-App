import 'package:paisa_track/core/enums/subscription_tier.dart';
import 'package:paisa_track/data/local/daos/settings_dao.dart';
import 'package:paisa_track/domain/models/user_settings.dart';
import 'package:paisa_track/domain/repositories/settings_repository.dart';

/// Key constants used in the settings key-value store.
abstract final class SettingsKeys {
  static const locale = 'locale';
  static const primaryCurrency = 'primary_currency';
  static const themeMode = 'theme_mode';
  static const onboardingComplete = 'onboarding_complete';
  static const defaultAccountId = 'default_account_id';
  static const subscriptionTier = 'subscription_tier';
  static const subscriptionExpiry = 'subscription_expiry';
  static const lastSyncAt = 'last_sync_at';
  static const notificationEnabled = 'notification_enabled';
  static const smsTrackingEnabled = 'sms_tracking_enabled';
  static const biometricLockEnabled = 'biometric_lock_enabled';
}

/// Drift-backed implementation of [SettingsRepository].
class SettingsRepositoryImpl implements SettingsRepository {
  SettingsRepositoryImpl(this._dao);

  final SettingsDao _dao;

  // ── Scalar access ────────────────────────────────────────────────────

  @override
  Future<String?> get(String key) => _dao.getSetting(key);

  @override
  Future<void> set(String key, String value) => _dao.setSetting(key, value);

  @override
  Stream<String?> watch(String key) => _dao.watchSetting(key);

  // ── Composite getters / setters ──────────────────────────────────────

  @override
  Future<UserSettings> getUserSettings() async {
    final locale =
        await _dao.getSetting(SettingsKeys.locale) ?? 'en';
    final primaryCurrency =
        await _dao.getSetting(SettingsKeys.primaryCurrency) ?? 'INR';
    final themeMode =
        await _dao.getSetting(SettingsKeys.themeMode) ?? 'system';
    final onboardingComplete =
        await _dao.getSetting(SettingsKeys.onboardingComplete) == 'true';
    final defaultAccountId =
        await _dao.getSetting(SettingsKeys.defaultAccountId);
    final tierStr =
        await _dao.getSetting(SettingsKeys.subscriptionTier);
    final expiryStr =
        await _dao.getSetting(SettingsKeys.subscriptionExpiry);
    final lastSyncStr =
        await _dao.getSetting(SettingsKeys.lastSyncAt);
    final notificationEnabled =
        (await _dao.getSetting(SettingsKeys.notificationEnabled)) != 'false';
    final smsTrackingEnabled =
        (await _dao.getSetting(SettingsKeys.smsTrackingEnabled)) == 'true';
    final biometricLockEnabled =
        (await _dao.getSetting(SettingsKeys.biometricLockEnabled)) == 'true';

    return UserSettings(
      locale: locale,
      primaryCurrency: primaryCurrency,
      themeMode: themeMode,
      onboardingComplete: onboardingComplete,
      defaultAccountId: defaultAccountId,
      subscriptionTier: SubscriptionTier.values.firstWhere(
        (e) => e.name == tierStr,
        orElse: () => SubscriptionTier.free,
      ),
      subscriptionExpiry:
          expiryStr != null ? DateTime.tryParse(expiryStr) : null,
      lastSyncAt: lastSyncStr != null ? DateTime.tryParse(lastSyncStr) : null,
      notificationEnabled: notificationEnabled,
      smsTrackingEnabled: smsTrackingEnabled,
      biometricLockEnabled: biometricLockEnabled,
    );
  }

  @override
  Future<void> updateUserSettings(UserSettings settings) async {
    await _dao.setSetting(SettingsKeys.locale, settings.locale);
    await _dao.setSetting(
        SettingsKeys.primaryCurrency, settings.primaryCurrency);
    await _dao.setSetting(SettingsKeys.themeMode, settings.themeMode);
    await _dao.setSetting(
        SettingsKeys.onboardingComplete, '${settings.onboardingComplete}');
    if (settings.defaultAccountId != null) {
      await _dao.setSetting(
          SettingsKeys.defaultAccountId, settings.defaultAccountId!);
    }
    await _dao.setSetting(
        SettingsKeys.subscriptionTier, settings.subscriptionTier.name);
    if (settings.subscriptionExpiry != null) {
      await _dao.setSetting(SettingsKeys.subscriptionExpiry,
          settings.subscriptionExpiry!.toIso8601String());
    }
    if (settings.lastSyncAt != null) {
      await _dao.setSetting(
          SettingsKeys.lastSyncAt, settings.lastSyncAt!.toIso8601String());
    }
    await _dao.setSetting(
        SettingsKeys.notificationEnabled, '${settings.notificationEnabled}');
    await _dao.setSetting(
        SettingsKeys.smsTrackingEnabled, '${settings.smsTrackingEnabled}');
    await _dao.setSetting(
        SettingsKeys.biometricLockEnabled, '${settings.biometricLockEnabled}');
  }
}
