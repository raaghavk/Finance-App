/// Synchronisation status for local data records.
library;

/// Tracks whether a local record has been synchronised with the cloud.
enum SyncStatus {
  /// The record has been modified locally and is awaiting sync.
  pending('Pending', 'लंबित'),

  /// The record is in sync with the cloud.
  synced('Synced', 'सिंक्ड'),

  /// The record has conflicting changes in local and cloud copies.
  conflict('Conflict', 'विवाद');

  const SyncStatus(this.label, this.labelHi);

  /// English display label.
  final String label;

  /// Hindi display label.
  final String labelHi;
}
