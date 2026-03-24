import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:paisa_track/data/local/daos/settings_dao.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/remote/supabase/supabase_sync_service.dart';
import 'package:paisa_track/domain/models/sync_record.dart';
import 'package:paisa_track/domain/repositories/sync_repository.dart';

/// Implementation of [SyncRepository] backed by the local Drift database for
/// the sync queue and a [SupabaseSyncService] for cloud operations.
class SyncRepositoryImpl implements SyncRepository {
  SyncRepositoryImpl({
    required AppDatabase database,
    required SupabaseSyncService syncService,
    required SettingsDao settingsDao,
  })  : _db = database,
        _syncService = syncService,
        _settingsDao = settingsDao;

  final AppDatabase _db;
  final SupabaseSyncService _syncService;
  final SettingsDao _settingsDao;

  static const _lastSyncKey = 'last_sync_at';

  // ── Push / Pull ──────────────────────────────────────────────────────

  @override
  Future<void> pushChanges() async {
    final queued = await getQueuedChanges();
    if (queued.isEmpty) return;

    await _syncService.pushPendingChanges(queued);

    // Mark all pushed records as synced.
    await markSynced(queued.map((r) => r.id).toList());

    // Update last sync timestamp.
    await _settingsDao.setSetting(
      _lastSyncKey,
      DateTime.now().toIso8601String(),
    );
  }

  @override
  Future<void> pullChanges() async {
    final lastSync = await getLastSyncTime();
    await _syncService.pullRemoteChanges(lastSync);

    await _settingsDao.setSetting(
      _lastSyncKey,
      DateTime.now().toIso8601String(),
    );
  }

  // ── Queue management ─────────────────────────────────────────────────

  @override
  Future<List<SyncRecord>> getQueuedChanges() async {
    final rows = await (_db.select(_db.syncQueueTable)
          ..where((s) => s.isSynced.equals(false))
          ..orderBy([(s) => OrderingTerm.asc(s.createdAt)]))
        .get();

    return rows.map((row) {
      return SyncRecord(
        id: row.id.toString(),
        tableName: row.tableName_,
        recordId: row.recordId,
        operation: row.operation,
        payload: jsonDecode(row.payload) as Map<String, dynamic>,
        createdAt: row.createdAt,
        isSynced: row.isSynced,
      );
    }).toList();
  }

  @override
  Future<void> markSynced(List<String> ids) async {
    final intIds = ids.map((id) => int.tryParse(id)).whereType<int>().toList();
    if (intIds.isEmpty) return;

    await (_db.update(_db.syncQueueTable)
          ..where((s) => s.id.isIn(intIds)))
        .write(const SyncQueueTableCompanion(
      isSynced: Value(true),
    ));
  }

  // ── Metadata ─────────────────────────────────────────────────────────

  @override
  Future<DateTime?> getLastSyncTime() async {
    final raw = await _settingsDao.getSetting(_lastSyncKey);
    return raw != null ? DateTime.tryParse(raw) : null;
  }
}
