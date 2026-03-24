import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/extensions/date_extensions.dart';

void main() {
  group('toIndianFiscalYear', () {
    test('June 2025 returns 2025', () {
      expect(DateTime(2025, 6, 15).toIndianFiscalYear, 2025);
    });

    test('January 2026 returns 2025', () {
      expect(DateTime(2026, 1, 10).toIndianFiscalYear, 2025);
    });

    test('April 2025 returns 2025', () {
      expect(DateTime(2025, 4, 1).toIndianFiscalYear, 2025);
    });

    test('March 2025 returns 2024', () {
      expect(DateTime(2025, 3, 31).toIndianFiscalYear, 2024);
    });
  });

  group('indianFiscalQuarter', () {
    test('April returns Q1', () {
      expect(DateTime(2025, 4, 1).indianFiscalQuarter, 1);
    });

    test('June returns Q1', () {
      expect(DateTime(2025, 6, 30).indianFiscalQuarter, 1);
    });

    test('July returns Q2', () {
      expect(DateTime(2025, 7, 1).indianFiscalQuarter, 2);
    });

    test('September returns Q2', () {
      expect(DateTime(2025, 9, 30).indianFiscalQuarter, 2);
    });

    test('October returns Q3', () {
      expect(DateTime(2025, 10, 1).indianFiscalQuarter, 3);
    });

    test('December returns Q3', () {
      expect(DateTime(2025, 12, 31).indianFiscalQuarter, 3);
    });

    test('January returns Q4', () {
      expect(DateTime(2026, 1, 1).indianFiscalQuarter, 4);
    });

    test('March returns Q4', () {
      expect(DateTime(2026, 3, 31).indianFiscalQuarter, 4);
    });
  });

  group('startOfMonth', () {
    test('returns first day of month at midnight', () {
      final date = DateTime(2025, 3, 15, 14, 30);
      final start = date.startOfMonth;
      expect(start, DateTime(2025, 3));
      expect(start.day, 1);
      expect(start.hour, 0);
    });
  });

  group('endOfMonth', () {
    test('returns last day with time 23:59:59.999', () {
      final date = DateTime(2025, 1, 15);
      final end = date.endOfMonth;
      expect(end.day, 31);
      expect(end.hour, 23);
      expect(end.minute, 59);
      expect(end.second, 59);
      expect(end.millisecond, 999);
    });

    test('February non-leap year returns day 28', () {
      expect(DateTime(2025, 2, 10).endOfMonth.day, 28);
    });

    test('February leap year returns day 29', () {
      expect(DateTime(2024, 2, 10).endOfMonth.day, 29);
    });
  });

  group('startOfWeek', () {
    test('Wednesday returns previous Monday', () {
      // 2025-03-19 is a Wednesday
      final date = DateTime(2025, 3, 19);
      expect(date.startOfWeek, DateTime(2025, 3, 17));
    });

    test('Monday returns itself', () {
      final date = DateTime(2025, 3, 17);
      expect(date.startOfWeek, DateTime(2025, 3, 17));
    });
  });

  group('isToday', () {
    test('DateTime.now() isToday is true', () {
      expect(DateTime.now().isToday, isTrue);
    });

    test('yesterday isToday is false', () {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      expect(yesterday.isToday, isFalse);
    });
  });

  group('isYesterday', () {
    test('yesterday isYesterday is true', () {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      expect(yesterday.isYesterday, isTrue);
    });

    test('today isYesterday is false', () {
      expect(DateTime.now().isYesterday, isFalse);
    });
  });

  group('relativeLabel', () {
    test('today returns "Today"', () {
      expect(DateTime.now().relativeLabel, 'Today');
    });

    test('yesterday returns "Yesterday"', () {
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      expect(yesterday.relativeLabel, 'Yesterday');
    });

    test('3 days ago returns "3 days ago"', () {
      final date = DateTime.now().subtract(const Duration(days: 3));
      expect(date.relativeLabel, '3 days ago');
    });

    test('14 days ago returns "2 weeks ago"', () {
      final date = DateTime.now().subtract(const Duration(days: 14));
      expect(date.relativeLabel, '2 weeks ago');
    });

    test('45 days ago returns "1 month ago"', () {
      final date = DateTime.now().subtract(const Duration(days: 45));
      expect(date.relativeLabel, '1 month ago');
    });
  });
}
