import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/features/chat_input/providers/chat_input_provider.dart';
import 'package:paisa_track/features/chat_input/presentation/widgets/chat_bubble.dart';
import 'package:paisa_track/features/chat_input/presentation/widgets/suggestion_chips.dart';

/// Full-screen chat interface for quick expense entry via natural language.
class ChatInputScreen extends ConsumerStatefulWidget {
  const ChatInputScreen({super.key});

  @override
  ConsumerState<ChatInputScreen> createState() => _ChatInputScreenState();
}

class _ChatInputScreenState extends ConsumerState<ChatInputScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _inputFocusNode = FocusNode();

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _inputFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatInputNotifierProvider);
    final notifier = ref.read(chatInputNotifierProvider.notifier);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Auto-scroll to bottom when new messages arrive.
    ref.listen(chatInputNotifierProvider, (prev, next) {
      if ((prev?.messages.length ?? 0) < next.messages.length) {
        _scrollToBottom();
      }
    });

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            notifier.reset();
            context.pop();
          },
        ),
        title: const Text('Quick Entry'),
        actions: [
          // Usage counter badge
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: Text(
                '${state.usageCount}/${AppConstants.chatInputMonthlyLimit}',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Messages list ──────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: state.messages.length + (state.isProcessing ? 1 : 0),
              itemBuilder: (context, index) {
                // Typing indicator at the end while processing.
                if (index == state.messages.length && state.isProcessing) {
                  return _buildTypingIndicator(theme, colorScheme);
                }

                final message = state.messages[index];

                return Column(
                  crossAxisAlignment: message.isUser
                      ? CrossAxisAlignment.end
                      : CrossAxisAlignment.start,
                  children: [
                    ChatBubble(
                      text: message.text,
                      isUser: message.isUser,
                      timestamp: message.timestamp,
                      parsedExpense: message.parsedExpense,
                      onSaveParsed: () => notifier.confirmExpense(),
                      onEditParsed: () {
                        if (state.parsedExpense != null && context.mounted) {
                          context.push(
                            AppRoutes.addTransaction,
                            extra: state.parsedExpense,
                          );
                        }
                      },
                    ),
                    // Suggestion chips below bot messages.
                    if (!message.isUser && message.suggestions.isNotEmpty)
                      SuggestionChips(
                        labels: message.suggestions,
                        onSelected: (label) =>
                            notifier.handleSuggestion(label),
                        padding: const EdgeInsets.only(
                          left: 12,
                          right: 12,
                          bottom: 8,
                        ),
                      ),
                  ],
                );
              },
            ),
          ),

          // ── Error banner ───────────────────────────────────────
          if (state.error != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: colorScheme.errorContainer,
              child: Text(
                state.error!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onErrorContainer,
                ),
              ),
            ),

          // ── Usage counter ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Text(
              '${state.usageCount} of ${AppConstants.chatInputMonthlyLimit} '
              'chat inputs used this month',
              style: theme.textTheme.labelSmall?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
          ),

          // ── Input bar ──────────────────────────────────────────
          _buildInputBar(state, notifier, theme, colorScheme),
        ],
      ),
    );
  }

  // ── Sub-builders ───────────────────────────────────────────────────────

  Widget _buildInputBar(
    ChatInputState state,
    ChatInputNotifier notifier,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerLow,
          border: Border(
            top: BorderSide(color: colorScheme.outlineVariant, width: 0.5),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _textController,
                focusNode: _inputFocusNode,
                textCapitalization: TextCapitalization.sentences,
                textInputAction: TextInputAction.send,
                enabled: !state.isProcessing,
                decoration: InputDecoration(
                  hintText: 'Type your expense...',
                  hintStyle: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant.withOpacity(0.6),
                  ),
                  filled: true,
                  fillColor: colorScheme.surfaceContainerHighest,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (value) => _send(notifier),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: state.isProcessing ? null : () => _send(notifier),
              icon: const Icon(Icons.send_rounded),
              style: IconButton.styleFrom(
                backgroundColor: colorScheme.primary,
                foregroundColor: colorScheme.onPrimary,
                disabledBackgroundColor: colorScheme.surfaceContainerHighest,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator(ThemeData theme, ColorScheme colorScheme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: colorScheme.primary,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            'Thinking...',
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  void _send(ChatInputNotifier notifier) {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    _textController.clear();
    notifier.sendMessage(text);
    _inputFocusNode.requestFocus();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
}
