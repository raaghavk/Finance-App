import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_record.freezed.dart';
part 'sync_record.g.dart';

/// A queued change waiting to be synced to the cloud.
@freezed
class SyncRecord with _$SyncRecord {
  const factory SyncRecord({
    /// Unique identifier for this sync record.
    required String id,

    /// Name of the database table that was modified.
    required String tableName,

    /// ID of the record that was modified.
    required String recordId,

    /// The operation performed: "insert", "update", or "delete".
    required String operation,

    /// JSON payload of the changed data.
    required Map<String, dynamic> payload,

    /// When this change was recorded.
    required DateTime createdAt,

    /// Whether this change has been pushed to the cloud.
    @Default(false) bool isSynced,
  }) = _SyncRecord;

  factory SyncRecord.fromJson(Map<String, dynamic> json) =>
      _$SyncRecordFromJson(json);
}
