import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/domain/models/parsed_expense.dart';
import 'package:paisa_track/features/voice_input/presentation/widgets/parsed_expense_card.dart';

/// A single chat bubble that aligns to the right for user messages and to the
/// left for bot messages. Optionally embeds a [ParsedExpenseCard] below the
/// text content.
class ChatBubble extends StatelessWidget {
  const ChatBubble({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.parsedExpense,
    this.onSaveParsed,
    this.onEditParsed,
    super.key,
  });

  /// The message text.
  final String text;

  /// Whether this message was sent by the user.
  final bool isUser;

  /// When the message was created.
  final DateTime timestamp;

  /// Optional parsed expense to embed inline.
  final ParsedExpense? parsedExpense;

  /// Callback when the user taps "Looks good!" on the embedded card.
  final VoidCallback? onSaveParsed;

  /// Callback when the user taps "Edit Details" on the embedded card.
  final VoidCallback? onEditParsed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final alignment =
        isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final bubbleColor =
        isUser ? colorScheme.primaryContainer : colorScheme.surfaceContainerHigh;
    final textColor = isUser
        ? colorScheme.onPrimaryContainer
        : colorScheme.onSurface;

    final borderRadius = BorderRadius.only(
      topLeft: const Radius.circular(16),
      topRight: const Radius.circular(16),
      bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
      bottomRight: isUser ? Radius.zero : const Radius.circular(16),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Column(
        crossAxisAlignment: alignment,
        children: [
          // ── Bubble ───────────────────────────────────────────────
          ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.sizeOf(context).width * 0.78,
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: bubbleColor,
                borderRadius: borderRadius,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    text,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: textColor,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat.jm().format(timestamp),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: textColor.withOpacity(0.55),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Embedded parsed expense card ─────────────────────────
          if (parsedExpense != null) ...[
            const SizedBox(height: 6),
            ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.sizeOf(context).width * 0.85,
              ),
              child: ParsedExpenseCard(
                expense: parsedExpense!,
                onSave: onSaveParsed,
                onEdit: onEditParsed,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
