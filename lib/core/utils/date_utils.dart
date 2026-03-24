/// Date utility helpers for Indian fiscal-year calculations and
/// human-readable date ranges.
library;

/// Static date helpers used across the application.
///
/// All fiscal-year methods follow the Indian government fiscal year
/// which runs from 1 April to 31 March.
abstract final class AppDateUtils {
  // ── Fiscal Year ───────────────────────────────────────────────────────

  /// Returns the starting calendar year of the current Indian fiscal year.
  ///
  /// For example, if today is January 2026 the current fiscal year is
  /// FY 2025-26 and this returns `2025`.
  static int currentFiscalYear() {
    final now = DateTime.now();
    return now.month >= 4 ? now.year : now.year - 1;
  }

  /// Returns the start and end [DateTime] of the Indian fiscal year
  /// identified by its starting calendar [year].
  ///
  /// `fiscalYearRange(2025)` → 1 Apr 2025 – 31 Mar 2026.
  static ({DateTime start, DateTime end}) fiscalYearRange(int year) {
    return (
      start: DateTime(year, 4),
      end: DateTime(year + 1, 3, 31, 23, 59, 59, 999),
    );
  }

  // ── Month Range ───────────────────────────────────────────────────────

  /// Returns the first and last moment of the month containing [date].
  static ({DateTime start, DateTime end}) monthRange(DateTime date) {
    return (
      start: DateTime(date.year, date.month),
      end: DateTime(date.year, date.month + 1, 0, 23, 59, 59, 999),
    );
  }

  // ── Week Range (Monday–Sunday) ────────────────────────────────────────

  /// Returns the Monday and Sunday bounding the week containing [date].
  static ({DateTime start, DateTime end}) weekRange(DateTime date) {
    final monday = date.subtract(Duration(days: date.weekday - DateTime.monday));
    final mondayStart = DateTime(monday.year, monday.month, monday.day);
    final sunday = mondayStart.add(const Duration(days: 6));
    final sundayEnd = DateTime(sunday.year, sunday.month, sunday.day, 23, 59, 59, 999);
    return (start: mondayStart, end: sundayEnd);
  }

  // ── Relative Date ─────────────────────────────────────────────────────

  /// Returns a human-readable string describing how far [date] is from
  /// today.
  ///
  /// Examples: `'Today'`, `'Yesterday'`, `'3 days ago'`, `'Tomorrow'`,
  /// `'In 2 days'`.
  static String relativeDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(date.year, date.month, date.day);
    final diff = today.difference(target).inDays;

    if (diff == 0) return 'Today';
    if (diff == 1) return 'Yesterday';
    if (diff == -1) return 'Tomorrow';
    if (diff > 1 && diff <= 6) return '$diff days ago';
    if (diff < -1 && diff >= -6) return 'In ${diff.abs()} days';
    if (diff == 7) return '1 week ago';
    if (diff == -7) return 'In 1 week';

    // Fall back to dd/MM/yyyy.
    final d = target.day.toString().padLeft(2, '0');
    final m = target.month.toString().padLeft(2, '0');
    return '$d/$m/${target.year}';
  }

  // ── Formatting Helpers ────────────────────────────────────────────────

  /// Returns a fiscal-year label string such as `'FY 2025-26'`.
  static String fiscalYearLabel(int startYear) =>
      'FY $startYear-${(startYear + 1) % 100}';

  /// Short month names (Jan–Dec).
  static const List<String> shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  /// Returns the short month name for a 1-based [month] index.
  static String shortMonth(int month) {
    assert(month >= 1 && month <= 12, 'month must be 1–12');
    return shortMonths[month - 1];
  }
}
