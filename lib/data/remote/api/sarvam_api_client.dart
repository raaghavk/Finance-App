import 'dart:typed_data';

import 'package:dio/dio.dart';

/// Dio-based client for the Sarvam AI speech and translation API.
class SarvamApiClient {
  SarvamApiClient({
    required Dio dio,
    required String apiKey,
  })  : _dio = dio,
        _apiKey = apiKey {
    _dio.options.baseUrl = _baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 60);
  }

  final Dio _dio;
  final String _apiKey;

  static const _baseUrl = 'https://api.sarvam.ai';

  /// Convert raw audio bytes to text.
  ///
  /// [audioBytes] - WAV / PCM audio data.
  /// [languageCode] - BCP-47 code, e.g. `hi-IN`.
  ///
  /// Returns the transcribed text.
  Future<String> speechToText(
    Uint8List audioBytes, {
    String languageCode = 'hi-IN',
  }) async {
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        audioBytes,
        filename: 'audio.wav',
      ),
      'language_code': languageCode,
      'model': 'saaras:v2',
    });

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/speech-to-text',
        data: formData,
        options: Options(
          headers: {
            'api-subscription-key': _apiKey,
          },
          contentType: 'multipart/form-data',
        ),
      );

      final data = response.data;
      if (data == null) {
        throw SarvamApiException('Empty response from speech-to-text API');
      }

      final transcript = data['transcript'] as String?;
      if (transcript == null || transcript.isEmpty) {
        throw SarvamApiException(
          'No transcript found in response: $data',
        );
      }
      return transcript;
    } on DioException catch (e) {
      throw SarvamApiException(
        'Speech-to-text request failed: ${e.message}',
        statusCode: e.response?.statusCode,
        cause: e,
      );
    }
  }

  /// Translate text between languages using Sarvam AI.
  ///
  /// [text] - Source text.
  /// [sourceLang] - BCP-47 source language, e.g. `hi-IN`.
  /// [targetLang] - BCP-47 target language, e.g. `en-IN`.
  ///
  /// Returns translated text.
  Future<String> translate(
    String text, {
    String sourceLang = 'hi-IN',
    String targetLang = 'en-IN',
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/translate',
        data: {
          'input': text,
          'source_language_code': sourceLang,
          'target_language_code': targetLang,
          'model': 'mayura:v1',
          'enable_preprocessing': true,
        },
        options: Options(
          headers: {
            'api-subscription-key': _apiKey,
            'Content-Type': 'application/json',
          },
        ),
      );

      final data = response.data;
      if (data == null) {
        throw SarvamApiException('Empty response from translate API');
      }

      final translated = data['translated_text'] as String?;
      if (translated == null || translated.isEmpty) {
        throw SarvamApiException(
          'No translated text found in response: $data',
        );
      }
      return translated;
    } on DioException catch (e) {
      throw SarvamApiException(
        'Translation request failed: ${e.message}',
        statusCode: e.response?.statusCode,
        cause: e,
      );
    }
  }
}

/// Exception thrown by the Sarvam API client.
class SarvamApiException implements Exception {
  SarvamApiException(this.message, {this.statusCode, this.cause});

  final String message;
  final int? statusCode;
  final Object? cause;

  @override
  String toString() =>
      'SarvamApiException($statusCode): $message';
}
