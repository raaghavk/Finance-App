/// Riverpod providers for subscription / premium state management.
library;

import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/enums/subscription_tier.dart';

part 'subscription_provider.g.dart';

/// Manages the user's subscription tier and related operations.
@riverpod
class SubscriptionNotifier extends _$SubscriptionNotifier {
  @override
  SubscriptionTier build() {
    checkSubscription();
    return SubscriptionTier.free;
  }

  /// Checks the current subscription status with the payment provider.
  Future<void> checkSubscription() async {
    try {
      // TODO: Replace with actual RevenueCat / Play Billing check.
      // final customerInfo = await Purchases.getCustomerInfo();
      // if (customerInfo.entitlements.active.containsKey('premium')) {
      //   state = SubscriptionTier.premium;
      // }
      await Future<void>.delayed(const Duration(milliseconds: 300));
      debugPrint('[SubscriptionNotifier] Subscription checked');
    } catch (error) {
      debugPrint('[SubscriptionNotifier] Check failed: $error');
    }
  }

  /// Initiates a purchase for the given package identifier.
  Future<bool> purchase(String packageId) async {
    try {
      // TODO: Replace with actual purchase flow.
      // final result = await Purchases.purchasePackage(package);
      // if (result.entitlements.active.containsKey('premium')) {
      //   state = SubscriptionTier.premium;
      //   return true;
      // }
      await Future<void>.delayed(const Duration(seconds: 1));
      state = SubscriptionTier.premium;
      debugPrint('[SubscriptionNotifier] Purchase successful: $packageId');
      return true;
    } catch (error) {
      debugPrint('[SubscriptionNotifier] Purchase failed: $error');
      return false;
    }
  }

  /// Restores previous purchases.
  Future<bool> restore() async {
    try {
      // TODO: Replace with actual restore flow.
      // final customerInfo = await Purchases.restorePurchases();
      // if (customerInfo.entitlements.active.containsKey('premium')) {
      //   state = SubscriptionTier.premium;
      //   return true;
      // }
      await Future<void>.delayed(const Duration(seconds: 1));
      debugPrint('[SubscriptionNotifier] Restore attempted');
      return false;
    } catch (error) {
      debugPrint('[SubscriptionNotifier] Restore failed: $error');
      return false;
    }
  }

  /// Fetches available offerings / packages from the payment provider.
  Future<List<Map<String, String>>> getOfferings() async {
    try {
      // TODO: Replace with actual RevenueCat offerings.
      // final offerings = await Purchases.getOfferings();
      // return offerings.current?.availablePackages ?? [];
      await Future<void>.delayed(const Duration(milliseconds: 500));
      return [
        {
          'id': 'monthly',
          'title': 'Monthly',
          'price': '\u20B9149/month',
        },
        {
          'id': 'yearly',
          'title': 'Yearly',
          'price': '\u20B91,299/year',
        },
      ];
    } catch (error) {
      debugPrint('[SubscriptionNotifier] Failed to get offerings: $error');
      return [];
    }
  }

  /// Cancels the current subscription.
  Future<void> cancel() async {
    // TODO: Guide user to Play Store / App Store subscription management.
    debugPrint('[SubscriptionNotifier] Cancel requested');
  }
}

/// Convenience provider that returns true when the user is premium.
@riverpod
bool isPremium(Ref ref) {
  return ref.watch(subscriptionNotifierProvider).isPremium;
}

/// Returns the remaining usage count for a metered feature on the free tier.
///
/// Pass a feature name: `'voice'`, `'chat'`, or `'ocr'`.
@riverpod
int remainingUsage(Ref ref, String feature) {
  final tier = ref.watch(subscriptionNotifierProvider);
  if (tier.isPremium) return -1; // unlimited

  // TODO: Read actual usage counts from local DB.
  // For now, return the full monthly limit as placeholder.
  switch (feature) {
    case 'voice':
      return AppConstants.voiceInputMonthlyLimit;
    case 'chat':
      return AppConstants.chatInputMonthlyLimit;
    case 'ocr':
      return AppConstants.ocrMonthlyLimit;
    default:
      return 0;
  }
}
