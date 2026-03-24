import 'dart:typed_data';

import 'package:paisa_track/data/remote/api/sarvam_api_client.dart';
import 'package:paisa_track/domain/repositories/voice_repository.dart';

/// Remote implementation of [VoiceRepository] backed by the Sarvam AI API.
class VoiceRepositoryImpl implements VoiceRepository {
  VoiceRepositoryImpl(this._apiClient);

  final SarvamApiClient _apiClient;

  @override
  Future<String> speechToText(
    List<int> audioBytes,
    String languageCode,
  ) {
    return _apiClient.speechToText(
      Uint8List.fromList(audioBytes),
      languageCode: languageCode,
    );
  }
}
