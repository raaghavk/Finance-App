/// Application-wide constants for PaisaTrack.
///
/// Contains free-tier usage limits, app metadata, and other
/// configuration values used across the application.
library;

abstract final class AppConstants {
  // ── App Metadata ──────────────────────────────────────────────────────
  static const String appName = 'PaisaTrack';
  static const String tagline = 'Har paisa, har pal.';
  static const String packageName = 'com.paisatrack.app';
  static const String appVersion = '1.0.0';

  // ── Free-Tier Limits ──────────────────────────────────────────────────
  /// Maximum voice inputs allowed per month on free tier.
  static const int voiceInputMonthlyLimit = 10;

  /// Maximum chat/AI inputs allowed per month on free tier.
  static const int chatInputMonthlyLimit = 10;

  /// Maximum OCR scans (receipt captures) allowed per month on free tier.
  static const int ocrMonthlyLimit = 5;

  /// Number of months of transaction history available on free tier.
  static const int freeHistoryMonths = 6;

  /// Maximum number of budgets a free user can create.
  static const int freeBudgetLimit = 3;

  /// Maximum number of accounts a free user can create.
  static const int freeAccountLimit = 2;

  /// Maximum number of reminders a free user can create.
  static const int freeReminderLimit = 3;

  /// Number of months of data that can be exported on free tier.
  static const int freeExportMonths = 1;

  // ── Miscellaneous ─────────────────────────────────────────────────────
  /// Duration before an idle session is considered inactive.
  static const Duration sessionTimeout = Duration(minutes: 15);

  /// Minimum interval between consecutive cloud syncs.
  static const Duration syncInterval = Duration(minutes: 5);

  /// Maximum attachment file size in bytes (5 MB).
  static const int maxAttachmentBytes = 5 * 1024 * 1024;
}
