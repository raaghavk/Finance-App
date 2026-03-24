import 'package:flutter/material.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/transaction_tile.dart';

/// A scrollable grid showing categories filtered by [TransactionType].
///
/// Displays each category as an icon + name tile with a selected-state
/// border highlight. Fires [onCategorySelected] with the category id.
class CategoryPicker extends StatefulWidget {
  const CategoryPicker({
    super.key,
    required this.transactionType,
    required this.selectedCategoryId,
    required this.onCategorySelected,
    this.showAddCustom = true,
    this.maxVisibleRows = 2,
    this.crossAxisCount = 4,
  });

  final TransactionType transactionType;
  final String? selectedCategoryId;
  final ValueChanged<String> onCategorySelected;

  /// Whether to show an "Add Custom" button at the end of the grid.
  final bool showAddCustom;

  /// Maximum visible rows before the widget becomes scrollable.
  final int maxVisibleRows;

  /// Number of columns in the grid.
  final int crossAxisCount;

  @override
  State<CategoryPicker> createState() => _CategoryPickerState();
}

class _CategoryPickerState extends State<CategoryPicker> {
  bool _showAll = false;

  List<DefaultCategory> _filteredCategories() {
    switch (widget.transactionType) {
      case TransactionType.expense:
        return CategoryConstants.defaultExpenseCategories;
      case TransactionType.income:
        return CategoryConstants.defaultIncomeCategories;
      case TransactionType.transfer:
        // Transfers typically do not need a category, but we show expense
        // categories as a fallback.
        return CategoryConstants.defaultExpenseCategories;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categories = _filteredCategories();
    final visibleLimit = widget.crossAxisCount * widget.maxVisibleRows;
    final hasMore = categories.length > visibleLimit;
    final displayList =
        _showAll ? categories : categories.take(visibleLimit).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: widget.crossAxisCount,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 0.85,
          ),
          itemCount:
              displayList.length + (widget.showAddCustom && _showAll ? 1 : 0),
          itemBuilder: (context, index) {
            // "Add Custom" is the last item when fully expanded.
            if (index == displayList.length && widget.showAddCustom) {
              return _AddCustomTile(
                onTap: () {
                  // TODO: Navigate to custom category creation screen.
                },
              );
            }

            final category = displayList[index];
            final isSelected = category.id == widget.selectedCategoryId;
            final color = Color(category.color);
            final icon =
                TransactionTile.categoryIconFromName(category.iconName);

            return GestureDetector(
              onTap: () => widget.onCategorySelected(category.id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                decoration: BoxDecoration(
                  color: isSelected
                      ? color.withOpacity(0.15)
                      : theme.colorScheme.surfaceContainerHighest
                          .withOpacity(0.4),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? color : Colors.transparent,
                    width: 2,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      backgroundColor: color.withOpacity(0.15),
                      radius: 20,
                      child: Icon(icon, color: color, size: 20),
                    ),
                    const SizedBox(height: 6),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Text(
                        category.name,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.labelSmall?.copyWith(
                          fontWeight:
                              isSelected ? FontWeight.w600 : FontWeight.w400,
                          color: isSelected
                              ? color
                              : theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        if (hasMore && !_showAll) ...[
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: () => setState(() => _showAll = true),
              child: const Text('See All'),
            ),
          ),
        ],
        if (_showAll && hasMore) ...[
          const SizedBox(height: 8),
          Center(
            child: TextButton(
              onPressed: () => setState(() => _showAll = false),
              child: const Text('Show Less'),
            ),
          ),
        ],
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// "Add Custom" grid tile
// ---------------------------------------------------------------------------

class _AddCustomTile extends StatelessWidget {
  const _AddCustomTile({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.4),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundColor:
                  theme.colorScheme.primary.withOpacity(0.12),
              radius: 20,
              child: Icon(
                Icons.add,
                color: theme.colorScheme.primary,
                size: 20,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Add Custom',
              textAlign: TextAlign.center,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
