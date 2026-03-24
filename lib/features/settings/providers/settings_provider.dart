/// Riverpod providers for user settings management.
library;

import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/constants/currency_constants.dart';
import 'package:paisa_track/domain/models/user_settings.dart';

part 'settings_provider.g.dart';

/// Manages [UserSettings] state with persistence via the settings repository.
@riverpod
class SettingsNotifier extends _$SettingsNotifier {
  @override
  UserSettings build() {
    // Load settings on initialisation.
    loadSettings();
    return const UserSettings();
  }

  /// Loads persisted settings from local storage.
  Future<void> loadSettings() async {
    try {
      // TODO: Replace with actual repository call.
      // final repo = ref.read(settingsRepositoryProvider);
      // final settings = await repo.getUserSettings();
      // state = settings;
      await Future<void>.delayed(const Duration(milliseconds: 200));
      debugPrint('[SettingsNotifier] Settings loaded');
    } catch (error, stackTrace) {
      debugPrint('[SettingsNotifier] Failed to load settings: $error');
      debugPrintStack(stackTrace: stackTrace);
    }
  }

  /// Updates the primary currency code (ISO 4217).
  Future<void> updateCurrency(String currencyCode) async {
    final currency = CurrencyConstants.findByCode(currencyCode);
    if (currency == null) return;

    state = state.copyWith(primaryCurrency: currency.code);
    await _persist();
  }

  /// Updates the locale (BCP 47 code).
  Future<void> updateLocale(String locale) async {
    state = state.copyWith(locale: locale);
    await _persist();
  }

  /// Toggles between dark and light theme modes.
  void toggleDarkMode() {
    final next = state.themeMode == 'dark' ? 'light' : 'dark';
    state = state.copyWith(themeMode: next);
    _persist();
  }

  /// Toggles push notification preference.
  void toggleNotifications() {
    state = state.copyWith(notificationEnabled: !state.notificationEnabled);
    _persist();
  }

  /// Toggles biometric lock.
  void toggleBiometricLock() {
    state = state.copyWith(biometricLockEnabled: !state.biometricLockEnabled);
    _persist();
  }

  /// Toggles automatic SMS transaction tracking.
  void toggleSmsTracking() {
    state = state.copyWith(smsTrackingEnabled: !state.smsTrackingEnabled);
    _persist();
  }

  /// Marks onboarding as complete.
  Future<void> completeOnboarding() async {
    state = state.copyWith(onboardingComplete: true);
    await _persist();
  }

  /// Persists current state to storage.
  Future<void> _persist() async {
    try {
      // TODO: Replace with actual repository call.
      // final repo = ref.read(settingsRepositoryProvider);
      // await repo.updateUserSettings(state);
      debugPrint('[SettingsNotifier] Settings persisted');
    } catch (error) {
      debugPrint('[SettingsNotifier] Failed to persist settings: $error');
    }
  }
}

/// Provides the current [UserSettings] snapshot.
@riverpod
UserSettings userSettings(Ref ref) {
  return ref.watch(settingsNotifierProvider);
}

/// Whether dark mode is currently enabled.
@riverpod
bool isDarkMode(Ref ref) {
  return ref.watch(settingsNotifierProvider).themeMode == 'dark';
}

/// The currently selected currency code.
@riverpod
String currentCurrency(Ref ref) {
  return ref.watch(settingsNotifierProvider).primaryCurrency;
}

/// Whether the user has completed onboarding.
@riverpod
bool isOnboardingComplete(Ref ref) {
  return ref.watch(settingsNotifierProvider).onboardingComplete;
}
