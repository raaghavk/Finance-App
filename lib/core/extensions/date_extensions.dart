/// Convenience extensions on [DateTime] for Indian fiscal-year handling,
/// week/month boundaries, and human-readable relative labels.
library;

extension DateExtensions on DateTime {
  // ── Indian Fiscal Year (April – March) ────────────────────────────────

  /// Returns the Indian fiscal year that this date falls in.
  ///
  /// The fiscal year starting April 2025 is referred to as FY 2025-26.
  /// This getter returns the *starting* calendar year (e.g. `2025`).
  int get toIndianFiscalYear => month >= 4 ? year : year - 1;

  /// Returns the Indian fiscal quarter (1–4) for this date.
  ///
  /// * Q1: Apr – Jun
  /// * Q2: Jul – Sep
  /// * Q3: Oct – Dec
  /// * Q4: Jan – Mar
  int get indianFiscalQuarter {
    return switch (month) {
      >= 4 && <= 6 => 1,
      >= 7 && <= 9 => 2,
      >= 10 && <= 12 => 3,
      _ => 4, // Jan – Mar
    };
  }

  // ── Month Boundaries ──────────────────────────────────────────────────

  /// The first moment of this date's month.
  DateTime get startOfMonth => DateTime(year, month);

  /// The last moment (23:59:59.999) of this date's month.
  DateTime get endOfMonth => DateTime(year, month + 1, 0, 23, 59, 59, 999);

  // ── Week Boundaries (Monday start) ────────────────────────────────────

  /// The Monday of the week containing this date.
  DateTime get startOfWeek {
    final diff = weekday - DateTime.monday;
    return DateTime(year, month, day - diff);
  }

  // ── Relative Checks ───────────────────────────────────────────────────

  /// Whether this date is today (date-only comparison).
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Whether this date is yesterday (date-only comparison).
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  // ── Human-readable Label ──────────────────────────────────────────────

  /// Returns a human-friendly relative label such as *Today*, *Yesterday*,
  /// or *3 days ago*.
  String get relativeLabel {
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final thisDay = DateTime(year, month, day);
    final diff = today.difference(thisDay).inDays;

    if (diff > 0 && diff <= 6) return '$diff days ago';
    if (diff == 7) return '1 week ago';
    if (diff > 7 && diff <= 29) return '${(diff / 7).floor()} weeks ago';
    if (diff >= 30 && diff <= 59) return '1 month ago';
    if (diff >= 60 && diff <= 364) return '${(diff / 30).floor()} months ago';
    if (diff >= 365) return '${(diff / 365).floor()} year${(diff / 365).floor() > 1 ? 's' : ''} ago';

    // Future dates
    final futureDiff = thisDay.difference(today).inDays;
    if (futureDiff == 1) return 'Tomorrow';
    if (futureDiff > 1 && futureDiff <= 6) return 'In $futureDiff days';
    return '${day.toString().padLeft(2, '0')}/${month.toString().padLeft(2, '0')}/$year';
  }
}
