class UserSettings {
  const UserSettings({
    this.currency = 'INR',
    this.locale = 'en',
    this.themeMode = 'system',
    this.notificationsEnabled = true,
    this.biometricEnabled = false,
    this.isOnboardingComplete = false,
    this.defaultAccountId,
    this.monthlyBudgetLimit = 0.0,
  });

  final String currency;
  final String locale;
  final String themeMode; // 'system', 'light', 'dark'
  final bool notificationsEnabled;
  final bool biometricEnabled;
  final bool isOnboardingComplete;
  final String? defaultAccountId;
  final double monthlyBudgetLimit;

  UserSettings copyWith({
    String? currency,
    String? locale,
    String? themeMode,
    bool? notificationsEnabled,
    bool? biometricEnabled,
    bool? isOnboardingComplete,
    String? defaultAccountId,
    double? monthlyBudgetLimit,
  }) {
    return UserSettings(
      currency: currency ?? this.currency,
      locale: locale ?? this.locale,
      themeMode: themeMode ?? this.themeMode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      isOnboardingComplete: isOnboardingComplete ?? this.isOnboardingComplete,
      defaultAccountId: defaultAccountId ?? this.defaultAccountId,
      monthlyBudgetLimit: monthlyBudgetLimit ?? this.monthlyBudgetLimit,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'currency': currency,
      'locale': locale,
      'theme_mode': themeMode,
      'notifications_enabled': notificationsEnabled ? 1 : 0,
      'biometric_enabled': biometricEnabled ? 1 : 0,
      'is_onboarding_complete': isOnboardingComplete ? 1 : 0,
      'default_account_id': defaultAccountId,
      'monthly_budget_limit': monthlyBudgetLimit,
    };
  }

  factory UserSettings.fromMap(Map<String, dynamic> map) {
    return UserSettings(
      currency: (map['currency'] as String?) ?? 'INR',
      locale: (map['locale'] as String?) ?? 'en',
      themeMode: (map['theme_mode'] as String?) ?? 'system',
      notificationsEnabled:
          ((map['notifications_enabled'] as int?) ?? 1) == 1,
      biometricEnabled: ((map['biometric_enabled'] as int?) ?? 0) == 1,
      isOnboardingComplete:
          ((map['is_onboarding_complete'] as int?) ?? 0) == 1,
      defaultAccountId: map['default_account_id'] as String?,
      monthlyBudgetLimit:
          (map['monthly_budget_limit'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
