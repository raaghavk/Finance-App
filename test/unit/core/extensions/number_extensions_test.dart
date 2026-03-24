import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/extensions/number_extensions.dart';

void main() {
  group('toINR', () {
    test('formats 1000 as ₹1,000.00', () {
      expect(1000.toINR(), '₹1,000.00');
    });

    test('formats 1234567.89 as ₹12,34,567.89', () {
      expect(1234567.89.toINR(), '₹12,34,567.89');
    });

    test('decimals=0 omits decimal part', () {
      expect(1000.toINR(decimals: 0), '₹1,000');
    });
  });

  group('toLakhCrore', () {
    test('100000 (1 lakh) returns "1L"', () {
      expect(100000.toLakhCrore(), '1L');
    });

    test('150000 returns "1.5L"', () {
      expect(150000.toLakhCrore(), '1.5L');
    });

    test('10000000 (1 crore) returns "1Cr"', () {
      expect(10000000.toLakhCrore(), '1Cr');
    });

    test('23000000 returns "2.3Cr"', () {
      expect(23000000.toLakhCrore(), '2.3Cr');
    });

    test('99999 returns as-is with 2 decimals', () {
      expect(99999.toLakhCrore(), '99999.00');
    });

    test('negative value preserves minus sign', () {
      expect((-10000000).toLakhCrore(), '-1Cr');
    });

    test('negative lakh value preserves minus sign', () {
      expect((-200000).toLakhCrore(), '-2L');
    });
  });

  group('toCompact', () {
    test('large values use lakh/crore notation', () {
      expect(150000.toCompact(), '1.5L');
    });

    test('small values use Indian comma format without symbol', () {
      expect(1234.toCompact(), '1,234.00');
    });
  });
}
