import 'package:flutter/material.dart';

/// A horizontally scrollable row of outlined action chips.
///
/// Used below bot messages to surface quick follow-up actions such as "Save",
/// "Edit Amount", "Change Category", etc.
class SuggestionChips extends StatelessWidget {
  const SuggestionChips({
    required this.labels,
    required this.onSelected,
    this.padding = const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
    super.key,
  });

  /// The display labels for each chip.
  final List<String> labels;

  /// Called with the label text when a chip is tapped.
  final ValueChanged<String> onSelected;

  /// Outer padding around the scroll view.
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    if (labels.isEmpty) return const SizedBox.shrink();

    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Padding(
      padding: padding,
      child: SizedBox(
        height: 40,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: labels.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final label = labels[index];
            return ActionChip(
              label: Text(
                label,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: colorScheme.primary,
                ),
              ),
              side: BorderSide(color: colorScheme.outline),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              backgroundColor: colorScheme.surface,
              onPressed: () => onSelected(label),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
            );
          },
        ),
      ),
    );
  }
}
