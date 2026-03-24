import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/utils/date_utils.dart';

void main() {
  group('fiscalYearRange', () {
    test('year 2025 returns Apr 1 2025 to Mar 31 2026', () {
      final range = AppDateUtils.fiscalYearRange(2025);
      expect(range.start, DateTime(2025, 4));
      expect(range.end.year, 2026);
      expect(range.end.month, 3);
      expect(range.end.day, 31);
    });

    test('year 2024 returns Apr 1 2024 to Mar 31 2025', () {
      final range = AppDateUtils.fiscalYearRange(2024);
      expect(range.start, DateTime(2024, 4));
      expect(range.end.year, 2025);
      expect(range.end.month, 3);
      expect(range.end.day, 31);
    });

    test('end date has time 23:59:59.999', () {
      final range = AppDateUtils.fiscalYearRange(2025);
      expect(range.end.hour, 23);
      expect(range.end.minute, 59);
      expect(range.end.second, 59);
      expect(range.end.millisecond, 999);
    });
  });

  group('monthRange', () {
    test('returns first to last day of given month', () {
      final range = AppDateUtils.monthRange(DateTime(2025, 3, 15));
      expect(range.start, DateTime(2025, 3));
      expect(range.end.day, 31);
    });

    test('handles February in non-leap year (28 days)', () {
      final range = AppDateUtils.monthRange(DateTime(2025, 2, 10));
      expect(range.end.day, 28);
    });

    test('handles February in leap year (29 days)', () {
      final range = AppDateUtils.monthRange(DateTime(2024, 2, 10));
      expect(range.end.day, 29);
    });

    test('end has time 23:59:59.999', () {
      final range = AppDateUtils.monthRange(DateTime(2025, 1, 15));
      expect(range.end.hour, 23);
      expect(range.end.minute, 59);
      expect(range.end.second, 59);
      expect(range.end.millisecond, 999);
    });
  });

  group('weekRange', () {
    test('returns Monday to Sunday for a Wednesday', () {
      // 2025-03-19 is a Wednesday
      final range = AppDateUtils.weekRange(DateTime(2025, 3, 19));
      expect(range.start.weekday, DateTime.monday);
      expect(range.end.weekday, DateTime.sunday);
    });

    test('Monday returns itself as start', () {
      // 2025-03-17 is a Monday
      final range = AppDateUtils.weekRange(DateTime(2025, 3, 17));
      expect(range.start, DateTime(2025, 3, 17));
    });

    test('Sunday returns the preceding Monday as start', () {
      // 2025-03-23 is a Sunday
      final range = AppDateUtils.weekRange(DateTime(2025, 3, 23));
      expect(range.start, DateTime(2025, 3, 17));
    });

    test('end has time 23:59:59.999', () {
      final range = AppDateUtils.weekRange(DateTime(2025, 3, 19));
      expect(range.end.hour, 23);
      expect(range.end.minute, 59);
      expect(range.end.second, 59);
      expect(range.end.millisecond, 999);
    });
  });

  group('relativeDate', () {
    test('today returns "Today"', () {
      expect(AppDateUtils.relativeDate(DateTime.now()), 'Today');
    });

    test('yesterday returns "Yesterday"', () {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      expect(AppDateUtils.relativeDate(yesterday), 'Yesterday');
    });

    test('tomorrow returns "Tomorrow"', () {
      final tomorrow = DateTime.now().add(const Duration(days: 1));
      expect(AppDateUtils.relativeDate(tomorrow), 'Tomorrow');
    });

    test('3 days ago returns "3 days ago"', () {
      final date = DateTime.now().subtract(const Duration(days: 3));
      expect(AppDateUtils.relativeDate(date), '3 days ago');
    });

    test('7 days ago returns "1 week ago"', () {
      final date = DateTime.now().subtract(const Duration(days: 7));
      expect(AppDateUtils.relativeDate(date), '1 week ago');
    });

    test('In 2 days for future date', () {
      final date = DateTime.now().add(const Duration(days: 2));
      expect(AppDateUtils.relativeDate(date), 'In 2 days');
    });

    test('far past date returns dd/MM/yyyy format', () {
      final result = AppDateUtils.relativeDate(DateTime(2020, 1, 15));
      expect(result, '15/01/2020');
    });
  });

  group('fiscalYearLabel', () {
    test('2025 produces "FY 2025-26"', () {
      expect(AppDateUtils.fiscalYearLabel(2025), 'FY 2025-26');
    });

    test('1999 produces "FY 1999-0"', () {
      expect(AppDateUtils.fiscalYearLabel(1999), 'FY 1999-0');
    });
  });

  group('shortMonth', () {
    test('1 returns "Jan"', () {
      expect(AppDateUtils.shortMonth(1), 'Jan');
    });

    test('12 returns "Dec"', () {
      expect(AppDateUtils.shortMonth(12), 'Dec');
    });

    test('6 returns "Jun"', () {
      expect(AppDateUtils.shortMonth(6), 'Jun');
    });
  });
}
