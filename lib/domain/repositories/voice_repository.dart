/// Contract for speech-to-text conversion.
abstract class VoiceRepository {
  /// Convert [audioBytes] to text using the given [languageCode] (e.g. "hi-IN").
  ///
  /// Returns the transcribed text string.
  Future<String> speechToText(List<int> audioBytes, String languageCode);
}
