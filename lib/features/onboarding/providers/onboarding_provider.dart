/// Riverpod providers for the onboarding flow state.
library;

import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'onboarding_provider.g.dart';

/// Tracks granted permissions during onboarding.
@immutable
class PermissionsState {
  const PermissionsState({
    this.notifications = false,
    this.camera = false,
    this.microphone = false,
    this.sms = false,
  });

  final bool notifications;
  final bool camera;
  final bool microphone;
  final bool sms;

  PermissionsState copyWith({
    bool? notifications,
    bool? camera,
    bool? microphone,
    bool? sms,
  }) =>
      PermissionsState(
        notifications: notifications ?? this.notifications,
        camera: camera ?? this.camera,
        microphone: microphone ?? this.microphone,
        sms: sms ?? this.sms,
      );
}

/// The aggregate state of the onboarding wizard.
@immutable
class OnboardingState {
  const OnboardingState({
    this.currentPage = 0,
    this.selectedLanguage = 'en',
    this.selectedCurrency = 'INR',
    this.permissions = const PermissionsState(),
  });

  /// Index of the current onboarding page (0-based).
  final int currentPage;

  /// The language code the user chose (BCP 47).
  final String selectedLanguage;

  /// The currency code the user chose (ISO 4217).
  final String selectedCurrency;

  /// Permissions granted during onboarding.
  final PermissionsState permissions;

  OnboardingState copyWith({
    int? currentPage,
    String? selectedLanguage,
    String? selectedCurrency,
    PermissionsState? permissions,
  }) =>
      OnboardingState(
        currentPage: currentPage ?? this.currentPage,
        selectedLanguage: selectedLanguage ?? this.selectedLanguage,
        selectedCurrency: selectedCurrency ?? this.selectedCurrency,
        permissions: permissions ?? this.permissions,
      );
}

/// Manages the onboarding wizard flow.
@riverpod
class OnboardingNotifier extends _$OnboardingNotifier {
  /// Total number of pages in the onboarding flow.
  static const int totalPages = 4;

  @override
  OnboardingState build() => const OnboardingState();

  /// Advances to the next onboarding page.
  void nextPage() {
    if (state.currentPage < totalPages - 1) {
      state = state.copyWith(currentPage: state.currentPage + 1);
    }
  }

  /// Navigates back to the previous onboarding page.
  void previousPage() {
    if (state.currentPage > 0) {
      state = state.copyWith(currentPage: state.currentPage - 1);
    }
  }

  /// Sets the selected language.
  void setLanguage(String languageCode) {
    state = state.copyWith(selectedLanguage: languageCode);
  }

  /// Sets the selected currency.
  void setCurrency(String currencyCode) {
    state = state.copyWith(selectedCurrency: currencyCode);
  }

  /// Updates a specific permission.
  void setPermission({
    bool? notifications,
    bool? camera,
    bool? microphone,
    bool? sms,
  }) {
    state = state.copyWith(
      permissions: state.permissions.copyWith(
        notifications: notifications,
        camera: camera,
        microphone: microphone,
        sms: sms,
      ),
    );
  }

  /// Marks onboarding as complete and persists user choices.
  Future<void> completeOnboarding() async {
    // TODO: Persist language, currency, and permission choices via
    // SettingsNotifier and actual permission request APIs.
    debugPrint(
      '[OnboardingNotifier] Onboarding complete: '
      'lang=${state.selectedLanguage}, '
      'currency=${state.selectedCurrency}, '
      'permissions=${state.permissions}',
    );
  }
}
