import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';

part 'voice_input_provider.g.dart';

// ---------------------------------------------------------------------------
// VoiceInputState
// ---------------------------------------------------------------------------

@immutable
class VoiceInputState {
  const VoiceInputState({
    this.isRecording = false,
    this.isProcessing = false,
    this.transcript = '',
    this.parsedExpense,
    this.error,
    this.recordingDuration = Duration.zero,
    this.audioLevel = 0.0,
    this.usageCount = 0,
  });

  /// Whether the mic is currently capturing audio.
  final bool isRecording;

  /// Whether audio is being transcribed / parsed.
  final bool isProcessing;

  /// Raw speech-to-text transcript.
  final String transcript;

  /// The expense extracted from the transcript.
  final ParsedExpense? parsedExpense;

  /// Human-readable error message, if any.
  final String? error;

  /// How long the user has been recording.
  final Duration recordingDuration;

  /// Current audio input level (0.0 – 1.0) for waveform visualisation.
  final double audioLevel;

  /// Number of voice inputs used this month.
  final int usageCount;

  /// Remaining free-tier uses.
  int get remaining => AppConstants.voiceInputMonthlyLimit - usageCount;

  /// Whether the free-tier limit has been reached.
  bool get isLimitReached => usageCount >= AppConstants.voiceInputMonthlyLimit;

  VoiceInputState copyWith({
    bool? isRecording,
    bool? isProcessing,
    String? transcript,
    ParsedExpense? Function()? parsedExpense,
    String? Function()? error,
    Duration? recordingDuration,
    double? audioLevel,
    int? usageCount,
  }) {
    return VoiceInputState(
      isRecording: isRecording ?? this.isRecording,
      isProcessing: isProcessing ?? this.isProcessing,
      transcript: transcript ?? this.transcript,
      parsedExpense:
          parsedExpense != null ? parsedExpense() : this.parsedExpense,
      error: error != null ? error() : this.error,
      recordingDuration: recordingDuration ?? this.recordingDuration,
      audioLevel: audioLevel ?? this.audioLevel,
      usageCount: usageCount ?? this.usageCount,
    );
  }
}

// ---------------------------------------------------------------------------
// VoiceInputNotifier
// ---------------------------------------------------------------------------

@riverpod
class VoiceInputNotifier extends _$VoiceInputNotifier {
  Timer? _durationTimer;

  @override
  VoiceInputState build() {
    ref.onDispose(_disposeTimers);
    return const VoiceInputState();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /// Begin recording audio from the microphone.
  ///
  /// Returns early with an error when the free-tier limit is reached.
  Future<void> startRecording() async {
    if (state.isLimitReached) {
      state = state.copyWith(
        error: () =>
            'Monthly limit reached. Upgrade to Premium for unlimited voice inputs.',
      );
      return;
    }

    state = state.copyWith(
      isRecording: true,
      isProcessing: false,
      transcript: '',
      parsedExpense: () => null,
      error: () => null,
      recordingDuration: Duration.zero,
      audioLevel: 0.0,
    );

    // Tick the duration timer every second.
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      state = state.copyWith(
        recordingDuration: state.recordingDuration + const Duration(seconds: 1),
      );
    });

    try {
      // TODO: Call the actual voice repository to start recording.
      // await ref.read(voiceRepositoryProvider).startRecording();
    } catch (e) {
      state = state.copyWith(
        isRecording: false,
        error: () => 'Failed to start recording: $e',
      );
      _durationTimer?.cancel();
    }
  }

  /// Stop recording and trigger transcription + parsing.
  Future<void> stopRecording() async {
    _durationTimer?.cancel();

    state = state.copyWith(
      isRecording: false,
      isProcessing: true,
    );

    try {
      // TODO: Replace with actual voice repository call.
      // final audioPath = await ref.read(voiceRepositoryProvider).stopRecording();
      // await processAudio(audioPath);
      await processAudio('');
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: () => 'Could not understand. Try again?',
      );
    }
  }

  /// Run speech-to-text followed by expense parsing on the given audio file.
  Future<void> processAudio(String audioPath) async {
    state = state.copyWith(isProcessing: true, error: () => null);

    try {
      // TODO: Replace with actual STT repository call.
      // final transcript =
      //     await ref.read(voiceRepositoryProvider).transcribe(audioPath);
      const transcript = '';

      if (transcript.isEmpty) {
        state = state.copyWith(
          isProcessing: false,
          error: () => 'Could not understand. Try again?',
        );
        return;
      }

      state = state.copyWith(transcript: transcript);

      // TODO: Replace with actual expense parser call.
      // final parsed =
      //     await ref.read(expenseParserProvider).parse(transcript, source: 'voice');
      final parsed = ParsedExpense(
        source: 'voice',
        rawText: transcript,
      );

      state = state.copyWith(
        isProcessing: false,
        parsedExpense: () => parsed,
        usageCount: state.usageCount + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: () => 'Could not understand. Try again?',
      );
    }
  }

  /// Update the live audio level for waveform animation.
  void updateAudioLevel(double level) {
    state = state.copyWith(audioLevel: level.clamp(0.0, 1.0));
  }

  /// Clear everything and return to the initial idle state.
  void reset() {
    _disposeTimers();
    state = const VoiceInputState();
  }

  // ── Internals ────────────────────────────────────────────────────────────

  void _disposeTimers() {
    _durationTimer?.cancel();
    _durationTimer = null;
  }
}
