import 'package:paisa_track/domain/models/sync_record.dart';

/// Contract for cloud synchronisation operations.
abstract class SyncRepository {
  /// Push all queued local changes to the cloud.
  Future<void> pushChanges();

  /// Pull remote changes from the cloud and merge locally.
  Future<void> pullChanges();

  /// Get all sync records that have not been pushed yet.
  Future<List<SyncRecord>> getQueuedChanges();

  /// Mark a list of sync records as successfully synced.
  Future<void> markSynced(List<String> ids);

  /// Get the timestamp of the last successful sync.
  Future<DateTime?> getLastSyncTime();
}
