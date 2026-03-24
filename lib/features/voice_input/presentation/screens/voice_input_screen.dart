import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/features/voice_input/providers/voice_input_provider.dart';
import 'package:paisa_track/features/voice_input/presentation/widgets/parsed_expense_card.dart';
import 'package:paisa_track/features/voice_input/presentation/widgets/transcript_preview.dart';
import 'package:paisa_track/features/voice_input/presentation/widgets/voice_waveform.dart';

/// Full-screen voice input screen with dark/gradient background.
///
/// Shows a large animated mic button, waveform visualisation, recording timer,
/// transcript preview, parsed expense card, and action buttons.
class VoiceInputScreen extends ConsumerStatefulWidget {
  const VoiceInputScreen({super.key});

  @override
  ConsumerState<VoiceInputScreen> createState() => _VoiceInputScreenState();
}

class _VoiceInputScreenState extends ConsumerState<VoiceInputScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(voiceInputNotifierProvider);
    final notifier = ref.read(voiceInputNotifierProvider.notifier);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Drive pulse animation based on recording state.
    if (state.isRecording && !_pulseController.isAnimating) {
      _pulseController.repeat(reverse: true);
    } else if (!state.isRecording && _pulseController.isAnimating) {
      _pulseController.stop();
      _pulseController.reset();
    }

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              colorScheme.surface,
              colorScheme.surfaceContainerLowest,
              colorScheme.surfaceContainerLow,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // ── Top bar ──────────────────────────────────────────
              _buildTopBar(context, notifier),

              // ── Scrollable content ───────────────────────────────
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.only(bottom: 32),
                  child: Column(
                    children: [
                      const SizedBox(height: 48),

                      // ── Mic button ───────────────────────────────
                      _buildMicButton(state, notifier, colorScheme),
                      const SizedBox(height: 16),

                      // ── Recording timer ──────────────────────────
                      if (state.isRecording) _buildTimer(state, theme),

                      // ── Waveform ─────────────────────────────────
                      if (state.isRecording || state.isProcessing)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          child: VoiceWaveform(
                            isActive: state.isRecording,
                            audioLevel: state.audioLevel,
                          ),
                        ),

                      // ── Processing indicator ─────────────────────
                      if (state.isProcessing) _buildProcessingIndicator(theme),

                      // ── Error state ──────────────────────────────
                      if (state.error != null)
                        _buildError(state, notifier, theme),

                      // ── Transcript ───────────────────────────────
                      if (state.transcript.isNotEmpty &&
                          !state.isProcessing &&
                          state.error == null)
                        TranscriptPreview(
                          transcript: state.transcript,
                          onEdit: () {
                            // TODO: Open inline editor or dialog for transcript
                          },
                        ),

                      // ── Parsed expense ───────────────────────────
                      if (state.parsedExpense != null &&
                          !state.isProcessing &&
                          state.error == null)
                        ParsedExpenseCard(
                          expense: state.parsedExpense!,
                          onSave: () => _saveTransaction(context, notifier),
                          onEdit: () => _editTransaction(context, state),
                        ),

                      const SizedBox(height: 24),

                      // ── Usage counter ────────────────────────────
                      _buildUsageCounter(state, theme, colorScheme),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Sub-builders ───────────────────────────────────────────────────────

  Widget _buildTopBar(BuildContext context, VoiceInputNotifier notifier) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              notifier.reset();
              context.pop();
            },
          ),
          const Spacer(),
          Text(
            'Voice Input',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const Spacer(),
          const SizedBox(width: 48), // balance the close button
        ],
      ),
    );
  }

  Widget _buildMicButton(
    VoiceInputState state,
    VoiceInputNotifier notifier,
    ColorScheme colorScheme,
  ) {
    final isRecording = state.isRecording;

    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, _) {
        final scale = isRecording ? _pulseAnimation.value : 1.0;

        return Transform.scale(
          scale: scale,
          child: GestureDetector(
            onTap: () {
              if (state.isProcessing) return;
              if (isRecording) {
                notifier.stopRecording();
              } else {
                notifier.startRecording();
              }
            },
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isRecording
                    ? Colors.red.shade400
                    : colorScheme.primaryContainer,
                boxShadow: [
                  if (isRecording)
                    BoxShadow(
                      color: Colors.red.withOpacity(0.35),
                      blurRadius: 32,
                      spreadRadius: 8,
                    )
                  else
                    BoxShadow(
                      color: colorScheme.primary.withOpacity(0.2),
                      blurRadius: 24,
                      spreadRadius: 4,
                    ),
                ],
              ),
              child: Icon(
                isRecording ? Icons.stop_rounded : Icons.mic,
                size: 48,
                color: isRecording
                    ? Colors.white
                    : colorScheme.onPrimaryContainer,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTimer(VoiceInputState state, ThemeData theme) {
    final minutes = state.recordingDuration.inMinutes
        .remainder(60)
        .toString()
        .padLeft(2, '0');
    final seconds = state.recordingDuration.inSeconds
        .remainder(60)
        .toString()
        .padLeft(2, '0');

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.fiber_manual_record, color: Colors.red, size: 12),
          const SizedBox(width: 8),
          Text(
            '$minutes:$seconds',
            style: theme.textTheme.titleMedium?.copyWith(
              fontFeatures: [const FontFeature.tabularFigures()],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProcessingIndicator(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(strokeWidth: 3),
          ),
          const SizedBox(height: 16),
          Text(
            'Processing...',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(
    VoiceInputState state,
    VoiceInputNotifier notifier,
    ThemeData theme,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
          const SizedBox(height: 12),
          Text(
            state.error!,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.error,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => notifier.reset(),
            icon: const Icon(Icons.refresh),
            label: const Text('Try Again'),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageCounter(
    VoiceInputState state,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Text(
        '${state.usageCount} of ${AppConstants.voiceInputMonthlyLimit} '
        'voice inputs used this month',
        style: theme.textTheme.bodySmall?.copyWith(
          color: colorScheme.onSurfaceVariant,
        ),
        textAlign: TextAlign.center,
      ),
    );
  }

  // ── Actions ────────────────────────────────────────────────────────────

  void _saveTransaction(BuildContext context, VoiceInputNotifier notifier) {
    // TODO: Persist the transaction via repository.
    notifier.reset();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transaction saved!')),
      );
      context.pop();
    }
  }

  void _editTransaction(BuildContext context, VoiceInputState state) {
    // Navigate to add_transaction screen pre-filled with parsed data.
    if (context.mounted) {
      context.push(
        AppRoutes.addTransaction,
        extra: state.parsedExpense,
      );
    }
  }
}
