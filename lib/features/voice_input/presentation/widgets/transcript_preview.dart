import 'package:flutter/material.dart';

/// Card that displays the raw speech-to-text transcript with an edit option.
///
/// Shows the recognised text inside quotation marks along with an "I heard:"
/// label. Tapping the edit icon invokes [onEdit] so the caller can let the
/// user manually correct the transcript.
class TranscriptPreview extends StatelessWidget {
  const TranscriptPreview({
    required this.transcript,
    this.onEdit,
    super.key,
  });

  /// The raw transcript returned by speech-to-text.
  final String transcript;

  /// Called when the user taps the edit icon.
  final VoidCallback? onEdit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header row
            Row(
              children: [
                Icon(
                  Icons.hearing,
                  size: 18,
                  color: colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'I heard:',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                if (onEdit != null)
                  IconButton(
                    icon: Icon(
                      Icons.edit_outlined,
                      size: 18,
                      color: colorScheme.onSurfaceVariant,
                    ),
                    tooltip: 'Edit transcript',
                    onPressed: onEdit,
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            // Transcript text
            Text(
              '\u201C$transcript\u201D',
              style: theme.textTheme.bodyLarge?.copyWith(
                fontStyle: FontStyle.italic,
                color: colorScheme.onSurface,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
