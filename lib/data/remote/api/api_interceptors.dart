import 'dart:async';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Adds the Sarvam AI API key header to every outgoing request.
class AuthInterceptor extends Interceptor {
  AuthInterceptor({required this.apiKey});

  final String apiKey;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    options.headers['api-subscription-key'] = apiKey;
    handler.next(options);
  }
}

/// Retries failed requests up to [maxRetries] times with exponential backoff.
///
/// Only retries on transient server errors (5xx) and network timeouts.
class RetryInterceptor extends Interceptor {
  RetryInterceptor({
    required this.dio,
    this.maxRetries = 3,
    this.baseDelay = const Duration(milliseconds: 500),
  });

  final Dio dio;
  final int maxRetries;
  final Duration baseDelay;

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final shouldRetry = _isRetryable(err);
    final attempt = (err.requestOptions.extra['_retryAttempt'] as int?) ?? 0;

    if (shouldRetry && attempt < maxRetries) {
      final nextAttempt = attempt + 1;
      final delay = baseDelay * pow(2, attempt).toInt();

      await Future<void>.delayed(delay);

      // Clone the request with updated retry counter.
      final options = err.requestOptions;
      options.extra['_retryAttempt'] = nextAttempt;

      try {
        final response = await dio.fetch<dynamic>(options);
        handler.resolve(response);
        return;
      } on DioException catch (retryErr) {
        // Let subsequent attempts flow through.
        handler.reject(retryErr);
        return;
      }
    }

    handler.next(err);
  }

  bool _isRetryable(DioException err) {
    // Network-level failures.
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.connectionError) {
      return true;
    }

    // Server errors (5xx) are considered transient.
    final statusCode = err.response?.statusCode;
    if (statusCode != null && statusCode >= 500) {
      return true;
    }

    return false;
  }
}

/// Logs HTTP requests and responses when running in debug mode.
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '→ ${options.method} ${options.uri}\n'
        '  Headers: ${_redactHeaders(options.headers)}',
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    if (kDebugMode) {
      debugPrint(
        '← ${response.statusCode} ${response.requestOptions.uri}\n'
        '  Data: ${_truncate(response.data.toString(), 500)}',
      );
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '✗ ${err.type} ${err.requestOptions.uri}\n'
        '  ${err.message}\n'
        '  Response: ${err.response?.data}',
      );
    }
    handler.next(err);
  }

  /// Redact sensitive header values for logging.
  Map<String, dynamic> _redactHeaders(Map<String, dynamic> headers) {
    final redacted = Map<String, dynamic>.from(headers);
    const sensitiveKeys = [
      'api-subscription-key',
      'authorization',
      'apikey',
    ];
    for (final key in sensitiveKeys) {
      if (redacted.containsKey(key)) {
        redacted[key] = '***';
      }
    }
    return redacted;
  }

  String _truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}... (truncated)';
  }
}
