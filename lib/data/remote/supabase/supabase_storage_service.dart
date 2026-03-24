import 'dart:io';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:paisa_track/data/remote/supabase/supabase_client.dart';

/// Service for uploading, downloading, and deleting receipt images in
/// Supabase Storage.
class SupabaseStorageService {
  SupabaseStorageService();

  SupabaseClient get _client => AppSupabaseClient.I.instance;

  /// The Supabase Storage bucket used for receipt images.
  static const _bucketId = 'receipts';

  /// Upload a receipt image to Supabase Storage.
  ///
  /// [localPath] - Absolute path to the image on the device.
  /// [transactionId] - The transaction this receipt belongs to, used as the
  ///                    storage key.
  ///
  /// Returns the public URL of the uploaded file.
  Future<String> uploadReceipt({
    required String localPath,
    required String transactionId,
  }) async {
    final file = File(localPath);
    if (!file.existsSync()) {
      throw ReceiptStorageException(
        'Local file not found: $localPath',
      );
    }

    final extension = localPath.split('.').last;
    final storagePath = '$transactionId/receipt.$extension';

    try {
      await _client.storage.from(_bucketId).upload(
            storagePath,
            file,
            fileOptions: const FileOptions(
              cacheControl: '3600',
              upsert: true,
            ),
          );

      final publicUrl =
          _client.storage.from(_bucketId).getPublicUrl(storagePath);

      return publicUrl;
    } on StorageException catch (e) {
      throw ReceiptStorageException(
        'Failed to upload receipt: ${e.message}',
        cause: e,
      );
    }
  }

  /// Download a receipt image from Supabase Storage to a local path.
  ///
  /// [remoteUrl] - The public or signed URL of the receipt.
  /// [localPath] - Where to save the file on device.
  Future<void> downloadReceipt({
    required String remoteUrl,
    required String localPath,
  }) async {
    try {
      // Extract the storage path from the public URL.
      final uri = Uri.parse(remoteUrl);
      final segments = uri.pathSegments;

      // Find the bucket segment and take everything after it.
      final bucketIndex = segments.indexOf(_bucketId);
      if (bucketIndex < 0 || bucketIndex >= segments.length - 1) {
        throw ReceiptStorageException(
          'Cannot determine storage path from URL: $remoteUrl',
        );
      }

      final storagePath = segments.sublist(bucketIndex + 1).join('/');
      final bytes = await _client.storage.from(_bucketId).download(storagePath);

      final file = File(localPath);
      await file.parent.create(recursive: true);
      await file.writeAsBytes(bytes);
    } on StorageException catch (e) {
      throw ReceiptStorageException(
        'Failed to download receipt: ${e.message}',
        cause: e,
      );
    }
  }

  /// Delete a receipt image from Supabase Storage.
  ///
  /// Removes all files under the `<transactionId>/` prefix.
  Future<void> deleteReceipt(String transactionId) async {
    try {
      final files = await _client.storage
          .from(_bucketId)
          .list(path: transactionId);

      if (files.isEmpty) return;

      final paths = files
          .map((f) => '$transactionId/${f.name}')
          .toList();

      await _client.storage.from(_bucketId).remove(paths);
    } on StorageException catch (e) {
      throw ReceiptStorageException(
        'Failed to delete receipt: ${e.message}',
        cause: e,
      );
    }
  }
}

/// Exception thrown by [SupabaseStorageService].
class ReceiptStorageException implements Exception {
  ReceiptStorageException(this.message, {this.cause});

  final String message;
  final Object? cause;

  @override
  String toString() => 'ReceiptStorageException: $message';
}
