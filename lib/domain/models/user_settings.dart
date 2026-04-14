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
    this.isPremium = false,
    this.subscriptionTier = 'free',
    this.subscriptionExpiryDate,
    this.aiUsageCount = 0,
    this.aiUsageResetDate,
  });

  final String currency;
  final String locale;
  final String themeMode; // 'system', 'light', 'dark'
  final bool notificationsEnabled;
  final bool biometricEnabled;
  final bool isOnboardingComplete;
  final String? defaultAccountId;
  final double monthlyBudgetLimit;

  // Premium fields
  final bool isPremium;
  final String subscriptionTier; // 'free', 'pro'
  final String? subscriptionExpiryDate; // ISO8601 or null
  final int aiUsageCount; // AI uses this month (scans + voice)
  final String? aiUsageResetDate; // ISO8601 date when count resets

  static const int freeAiUsageLimit = 3;

  UserSettings copyWith({
    String? currency,
    String? locale,
    String? themeMode,
    bool? notificationsEnabled,
    bool? biometricEnabled,
    bool? isOnboardingComplete,
    String? defaultAccountId,
    double? monthlyBudgetLimit,
    bool? isPremium,
    String? subscriptionTier,
    String? subscriptionExpiryDate,
    int? aiUsageCount,
    String? aiUsageResetDate,
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
      isPremium: isPremium ?? this.isPremium,
      subscriptionTier: subscriptionTier ?? this.subscriptionTier,
      subscriptionExpiryDate:
          subscriptionExpiryDate ?? this.subscriptionExpiryDate,
      aiUsageCount: aiUsageCount ?? this.aiUsageCount,
      aiUsageResetDate: aiUsageResetDate ?? this.aiUsageResetDate,
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
      'is_premium': isPremium ? 1 : 0,
      'subscription_tier': subscriptionTier,
      'subscription_expiry_date': subscriptionExpiryDate,
      'ai_usage_count': aiUsageCount,
      'ai_usage_reset_date': aiUsageResetDate,
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
      isPremium: ((map['is_premium'] as int?) ?? 0) == 1,
      subscriptionTier: (map['subscription_tier'] as String?) ?? 'free',
      subscriptionExpiryDate: map['subscription_expiry_date'] as String?,
      aiUsageCount: (map['ai_usage_count'] as int?) ?? 0,
      aiUsageResetDate: map['ai_usage_reset_date'] as String?,
    );
  }
}
