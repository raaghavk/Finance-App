import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';

part 'chat_input_provider.g.dart';

// ---------------------------------------------------------------------------
// ChatMessage model
// ---------------------------------------------------------------------------

@immutable
class ChatMessage {
  const ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.parsedExpense,
    this.suggestions = const [],
  });

  /// The message content.
  final String text;

  /// `true` if the message was sent by the user, `false` for bot responses.
  final bool isUser;

  /// When the message was created.
  final DateTime timestamp;

  /// An optional parsed expense attached to a bot response.
  final ParsedExpense? parsedExpense;

  /// Quick-action labels shown beneath a bot response.
  final List<String> suggestions;
}

// ---------------------------------------------------------------------------
// ChatInputState
// ---------------------------------------------------------------------------

@immutable
class ChatInputState {
  const ChatInputState({
    this.messages = const [],
    this.isProcessing = false,
    this.parsedExpense,
    this.usageCount = 0,
    this.error,
  });

  /// Ordered list of chat messages (oldest first).
  final List<ChatMessage> messages;

  /// Whether the bot is currently thinking.
  final bool isProcessing;

  /// The most recently parsed expense, if any.
  final ParsedExpense? parsedExpense;

  /// Number of chat inputs used this month.
  final int usageCount;

  /// Human-readable error, if any.
  final String? error;

  /// Remaining free-tier uses.
  int get remaining => AppConstants.chatInputMonthlyLimit - usageCount;

  /// Whether the free-tier limit has been reached.
  bool get isLimitReached => usageCount >= AppConstants.chatInputMonthlyLimit;

  ChatInputState copyWith({
    List<ChatMessage>? messages,
    bool? isProcessing,
    ParsedExpense? Function()? parsedExpense,
    int? usageCount,
    String? Function()? error,
  }) {
    return ChatInputState(
      messages: messages ?? this.messages,
      isProcessing: isProcessing ?? this.isProcessing,
      parsedExpense:
          parsedExpense != null ? parsedExpense() : this.parsedExpense,
      usageCount: usageCount ?? this.usageCount,
      error: error != null ? error() : this.error,
    );
  }
}

// ---------------------------------------------------------------------------
// ChatInputNotifier
// ---------------------------------------------------------------------------

@riverpod
class ChatInputNotifier extends _$ChatInputNotifier {
  @override
  ChatInputState build() {
    // Seed the conversation with an initial bot greeting.
    return ChatInputState(
      messages: [
        ChatMessage(
          text: 'Tell me about your expense! For example: '
              '"spent 200 on chai yesterday"',
          isUser: false,
          timestamp: DateTime.now(),
          suggestions: ['Spent 50 on auto', 'Lunch 150', 'Chai 30 yesterday'],
        ),
      ],
    );
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /// Send a user message and generate a bot response.
  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    if (state.isLimitReached) {
      state = state.copyWith(
        error: () =>
            'Monthly limit reached. Upgrade to Premium for unlimited chat inputs.',
      );
      return;
    }

    // Add user message.
    final userMessage = ChatMessage(
      text: text.trim(),
      isUser: true,
      timestamp: DateTime.now(),
    );
    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isProcessing: true,
      error: () => null,
    );

    try {
      // TODO: Replace with actual expense parser call.
      // final parsed = await ref.read(expenseParserProvider).parse(
      //   text,
      //   source: 'chat',
      // );
      final parsed = ParsedExpense(
        source: 'chat',
        rawText: text.trim(),
      );

      // Build a human-readable summary for the bot response.
      final summary = _buildSummary(parsed);

      final botMessage = ChatMessage(
        text: summary,
        isUser: false,
        timestamp: DateTime.now(),
        parsedExpense: parsed,
        suggestions: ['Save', 'Edit Amount', 'Change Category', 'Cancel'],
      );

      state = state.copyWith(
        messages: [...state.messages, botMessage],
        isProcessing: false,
        parsedExpense: () => parsed,
        usageCount: state.usageCount + 1,
      );
    } catch (e) {
      final errorMessage = ChatMessage(
        text: "Sorry, I couldn't understand that. Could you rephrase?",
        isUser: false,
        timestamp: DateTime.now(),
        suggestions: ['Try again', 'Cancel'],
      );

      state = state.copyWith(
        messages: [...state.messages, errorMessage],
        isProcessing: false,
      );
    }
  }

  /// Confirm and save the most recently parsed expense as a transaction.
  Future<void> confirmExpense() async {
    if (state.parsedExpense == null) return;

    // TODO: Persist the transaction via repository.
    // await ref.read(transactionRepositoryProvider).createFromParsed(
    //   state.parsedExpense!,
    // );

    final confirmMessage = ChatMessage(
      text: 'Transaction saved! Anything else?',
      isUser: false,
      timestamp: DateTime.now(),
      suggestions: ['Add another', 'Done'],
    );

    state = state.copyWith(
      messages: [...state.messages, confirmMessage],
      parsedExpense: () => null,
    );
  }

  /// Handle suggestion chip taps.
  Future<void> handleSuggestion(String suggestion) async {
    switch (suggestion.toLowerCase()) {
      case 'save':
        await confirmExpense();
      case 'cancel':
      case 'done':
        // The screen itself will pop.
        break;
      case 'edit amount':
      case 'change category':
        final botMessage = ChatMessage(
          text: 'Please type the new ${suggestion.toLowerCase()} and I\'ll update it.',
          isUser: false,
          timestamp: DateTime.now(),
        );
        state = state.copyWith(messages: [...state.messages, botMessage]);
      default:
        // Treat unknown suggestions as user input.
        await sendMessage(suggestion);
    }
  }

  /// Clear the conversation and return to initial state.
  void reset() {
    state = const ChatInputState();
    // Re-seed the greeting.
    state = ChatInputState(
      messages: [
        ChatMessage(
          text: 'Tell me about your expense! For example: '
              '"spent 200 on chai yesterday"',
          isUser: false,
          timestamp: DateTime.now(),
          suggestions: ['Spent 50 on auto', 'Lunch 150', 'Chai 30 yesterday'],
        ),
      ],
    );
  }

  // ── Internals ────────────────────────────────────────────────────────────

  String _buildSummary(ParsedExpense parsed) {
    final parts = <String>[];
    if (parsed.amount != null) {
      parts.add('\u20B9${parsed.amount!.toStringAsFixed(0)}');
    }
    if (parsed.categoryName != null && parsed.categoryName!.isNotEmpty) {
      parts.add('for ${parsed.categoryName}');
    }
    if (parsed.date != null) {
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final target =
          DateTime(parsed.date!.year, parsed.date!.month, parsed.date!.day);
      if (target == today) {
        parts.add('today');
      } else if (target == today.subtract(const Duration(days: 1))) {
        parts.add('yesterday');
      }
    }
    if (parts.isEmpty) return 'I understood your expense. Does this look right?';
    return 'Got it! ${parts.join(" ")}. Does this look right?';
  }
}
