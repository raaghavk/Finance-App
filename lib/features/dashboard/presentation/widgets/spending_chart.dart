import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/features/dashboard/providers/chart_data_provider.dart';

/// Toggleable chart widget showing spending data as either a **pie chart**
/// (by category) or a **bar chart** (daily this month).
class SpendingChart extends ConsumerStatefulWidget {
  const SpendingChart({super.key});

  @override
  ConsumerState<SpendingChart> createState() => _SpendingChartState();
}

class _SpendingChartState extends ConsumerState<SpendingChart> {
  bool _showPie = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Toggle header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              _ToggleChip(
                label: 'By Category',
                selected: _showPie,
                onTap: () => setState(() => _showPie = true),
              ),
              const SizedBox(width: 8),
              _ToggleChip(
                label: 'Daily',
                selected: !_showPie,
                onTap: () => setState(() => _showPie = false),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Chart body
        SizedBox(
          height: 260,
          child: _showPie
              ? const _PieChartSection()
              : const _BarChartSection(),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Toggle chip
// ---------------------------------------------------------------------------

class _ToggleChip extends StatelessWidget {
  const _ToggleChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? cs.primary : cs.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: theme.textTheme.labelMedium?.copyWith(
            color: selected ? cs.onPrimary : cs.onSurfaceVariant,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Pie chart
// ---------------------------------------------------------------------------

/// Fixed palette for pie chart segments.
const List<Color> _kCategoryColors = [
  Color(0xFF4CAF50),
  Color(0xFF2196F3),
  Color(0xFFFF9800),
  Color(0xFFE91E63),
  Color(0xFF9C27B0),
  Color(0xFF00BCD4),
  Color(0xFFFF5722),
  Color(0xFF795548),
  Color(0xFF607D8B),
  Color(0xFFCDDC39),
  Color(0xFF3F51B5),
  Color(0xFFFFC107),
];

class _PieChartSection extends ConsumerWidget {
  const _PieChartSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(spendingByCategoryProvider);
    final theme = Theme.of(context);

    return asyncData.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Text('Error loading chart', style: TextStyle(color: theme.colorScheme.error)),
      ),
      data: (categoryMap) {
        if (categoryMap.isEmpty) {
          return Center(
            child: Text(
              'No spending data this month',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          );
        }

        final entries = categoryMap.entries.toList()
          ..sort((a, b) => b.value.compareTo(a.value));
        final total = entries.fold<double>(0, (s, e) => s + e.value);

        final currencyFormat = NumberFormat.currency(
          locale: 'en_IN',
          symbol: '\u20B9',
          decimalDigits: 0,
        );

        return Row(
          children: [
            // Pie
            Expanded(
              flex: 3,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 32,
                  sections: List.generate(entries.length, (i) {
                    final entry = entries[i];
                    final color =
                        _colorForCategory(entry.key, i);
                    return PieChartSectionData(
                      value: entry.value,
                      color: color,
                      radius: 44,
                      title:
                          '${(entry.value / total * 100).toStringAsFixed(0)}%',
                      titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    );
                  }),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Legend
            Expanded(
              flex: 4,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(entries.length, (i) {
                    final entry = entries[i];
                    final color =
                        _colorForCategory(entry.key, i);
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              entry.key,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall,
                            ),
                          ),
                          Text(
                            currencyFormat.format(entry.value),
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
        );
      },
    );
  }

  /// Resolves a colour for a category, preferring the default category colour
  /// and falling back to the fixed palette.
  Color _colorForCategory(String categoryName, int index) {
    // Try to find colour from default categories.
    for (final cat in CategoryConstants.allDefaultCategories) {
      if (cat.name == categoryName) {
        return Color(cat.color);
      }
    }
    return _kCategoryColors[index % _kCategoryColors.length];
  }
}

// ---------------------------------------------------------------------------
// Bar chart
// ---------------------------------------------------------------------------

class _BarChartSection extends ConsumerWidget {
  const _BarChartSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncData = ref.watch(dailySpendingProvider);
    final theme = Theme.of(context);

    return asyncData.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Text('Error loading chart', style: TextStyle(color: theme.colorScheme.error)),
      ),
      data: (dailyEntries) {
        if (dailyEntries.isEmpty) {
          return Center(
            child: Text(
              'No spending data this month',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          );
        }

        final today = DateTime.now().day;
        final maxAmount = dailyEntries.fold<double>(
          0,
          (m, e) => e.amount > m ? e.amount : m,
        );
        final topY = maxAmount == 0 ? 1000.0 : (maxAmount * 1.2);

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: BarChart(
            BarChartData(
              alignment: BarChartAlignment.spaceAround,
              maxY: topY,
              barTouchData: BarTouchData(
                enabled: true,
                touchTooltipData: BarTouchTooltipData(
                  getTooltipItem: (group, groupIndex, rod, rodIndex) {
                    final entry = dailyEntries[groupIndex];
                    final fmt = NumberFormat.currency(
                      locale: 'en_IN',
                      symbol: '\u20B9',
                      decimalDigits: 0,
                    );
                    return BarTooltipItem(
                      '${entry.date.day} ${DateFormat.MMM().format(entry.date)}\n${fmt.format(entry.amount)}',
                      TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    );
                  },
                ),
              ),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 48,
                    getTitlesWidget: (value, meta) {
                      if (value == 0) return const SizedBox.shrink();
                      final fmt = NumberFormat.compact(locale: 'en_IN');
                      return Text(
                        fmt.format(value),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      );
                    },
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      final day = value.toInt() + 1;
                      // Show every 5th day + first and last.
                      if (day == 1 ||
                          day == dailyEntries.length ||
                          day % 5 == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            '$day',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                ),
              ),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: topY / 4,
                getDrawingHorizontalLine: (value) => FlLine(
                  color: theme.colorScheme.outlineVariant.withValues(alpha: 0.4),
                  strokeWidth: 1,
                ),
              ),
              borderData: FlBorderData(show: false),
              barGroups: List.generate(dailyEntries.length, (i) {
                final entry = dailyEntries[i];
                final isToday = entry.date.day == today;
                return BarChartGroupData(
                  x: i,
                  barRods: [
                    BarChartRodData(
                      toY: entry.amount,
                      width: dailyEntries.length > 20 ? 6 : 10,
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(4),
                      ),
                      color: isToday
                          ? theme.colorScheme.primary
                          : theme.colorScheme.primary.withValues(alpha: 0.45),
                    ),
                  ],
                );
              }),
            ),
          ),
        );
      },
    );
  }
}
