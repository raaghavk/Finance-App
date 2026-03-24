import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/remote/supabase/supabase_client.dart';
import 'package:paisa_track/domain/models/sync_record.dart';

/// Core sync engine that pushes local changes to Supabase and pulls remote
/// changes back into the local Drift database.
class SupabaseSyncService {
  SupabaseSyncService({
    required AppDatabase database,
  }) : _db = database;

  final AppDatabase _db;

  SupabaseClient get _client => AppSupabaseClient.I.instance;

  /// Tables that participate in two-way sync.
  static const _syncTables = [
    'transactions',
    'categories',
    'accounts',
    'budgets',
    'budget_categories',
    'reminders',
  ];

  // ── Push ─────────────────────────────────────────────────────────────

  /// Read queued [SyncRecord]s and upsert them into the corresponding
  /// Supabase tables, grouped by table name for batching.
  Future<void> pushPendingChanges(List<SyncRecord> records) async {
    // Group records by target table.
    final grouped = <String, List<SyncRecord>>{};
    for (final record in records) {
      grouped.putIfAbsent(record.tableName, () => []).add(record);
    }

    for (final entry in grouped.entries) {
      final table = entry.key;
      final tableRecords = entry.value;

      final deletes = tableRecords
          .where((r) => r.operation == 'delete')
          .toList();
      final upserts = tableRecords
          .where((r) => r.operation != 'delete')
          .toList();

      // Upsert creates / updates.
      if (upserts.isNotEmpty) {
        final payloads = upserts.map((r) => r.payload).toList();
        await _client.from(table).upsert(payloads);
      }

      // Soft-delete remotely.
      for (final record in deletes) {
        await _client
            .from(table)
            .update({'is_deleted': true})
            .eq('id', record.recordId);
      }
    }
  }

  // ── Pull ─────────────────────────────────────────────────────────────

  /// Fetch records from all sync tables that have been modified after
  /// [lastSyncAt]. When [lastSyncAt] is `null`, pulls everything.
  Future<void> pullRemoteChanges(DateTime? lastSyncAt) async {
    for (final table in _syncTables) {
      List<Map<String, dynamic>> rows;

      if (lastSyncAt != null) {
        rows = await _client
            .from(table)
            .select()
            .gt('updated_at', lastSyncAt.toIso8601String())
            .order('updated_at');
      } else {
        rows = await _client.from(table).select().order('updated_at');
      }

      for (final remote in rows) {
        await _mergeRemoteRecord(table, remote);
      }
    }
  }

  // ── Conflict resolution ──────────────────────────────────────────────

  /// Merge a single remote record into the local database using
  /// last-write-wins semantics based on `updated_at`.
  Future<void> _mergeRemoteRecord(
    String table,
    Map<String, dynamic> remote,
  ) async {
    final remoteId = remote['id'] as String?;
    if (remoteId == null) return;

    final remoteUpdatedAt =
        DateTime.tryParse(remote['updated_at']?.toString() ?? '');

    // Attempt to read the existing local record.
    final localRow = await _fetchLocalRecord(table, remoteId);

    if (localRow == null) {
      // No local version exists – insert.
      await _upsertLocalRecord(table, remote);
      return;
    }

    // Last-write-wins: accept remote if its updated_at is newer.
    final localUpdatedAt = localRow['updated_at'] as DateTime?;
    if (remoteUpdatedAt != null &&
        localUpdatedAt != null &&
        remoteUpdatedAt.isAfter(localUpdatedAt)) {
      await _upsertLocalRecord(table, remote);
    }
  }

  // ── Full sync ────────────────────────────────────────────────────────

  /// Convenience method: push pending local changes, then pull remote.
  Future<void> fullSync(List<SyncRecord> pendingRecords,
      {DateTime? lastSyncAt}) async {
    await pushPendingChanges(pendingRecords);
    await pullRemoteChanges(lastSyncAt);
  }

  // ── Local DB helpers ─────────────────────────────────────────────────

  /// Fetch a single local record by table name and id using raw queries.
  Future<Map<String, dynamic>?> _fetchLocalRecord(
    String tableName,
    String id,
  ) async {
    final result = await _db.customSelect(
      'SELECT * FROM $tableName WHERE id = ?',
      variables: [Variable.withString(id)],
    ).getSingleOrNull();

    return result?.data;
  }

  /// Insert or replace a record into the local table.
  Future<void> _upsertLocalRecord(
    String tableName,
    Map<String, dynamic> data,
  ) async {
    final columns = data.keys.toList();
    final placeholders = columns.map((_) => '?').join(', ');
    final columnNames = columns.join(', ');
    final values =
        columns.map((c) => Variable.withString(data[c].toString())).toList();

    await _db.customStatement(
      'INSERT OR REPLACE INTO $tableName ($columnNames) VALUES ($placeholders)',
      values.map((v) => v.value).toList(),
    );
  }
}
