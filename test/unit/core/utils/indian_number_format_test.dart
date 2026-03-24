import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/utils/indian_number_format.dart';

void main() {
  group('IndianNumberFormat.format', () {
    test('formats 0 as ₹0.00', () {
      expect(IndianNumberFormat.format(0), '₹0.00');
    });

    test('formats 99 as ₹99.00', () {
      expect(IndianNumberFormat.format(99), '₹99.00');
    });

    test('formats 999 as ₹999.00', () {
      expect(IndianNumberFormat.format(999), '₹999.00');
    });

    test('formats 1000 as ₹1,000.00', () {
      expect(IndianNumberFormat.format(1000), '₹1,000.00');
    });

    test('formats 10000 as ₹10,000.00', () {
      expect(IndianNumberFormat.format(10000), '₹10,000.00');
    });

    test('formats 100000 (1 lakh) as ₹1,00,000.00', () {
      expect(IndianNumberFormat.format(100000), '₹1,00,000.00');
    });

    test('formats 1234567.89 as ₹12,34,567.89', () {
      expect(IndianNumberFormat.format(1234567.89), '₹12,34,567.89');
    });

    test('formats 10000000 (1 crore) as ₹1,00,00,000.00', () {
      expect(IndianNumberFormat.format(10000000), '₹1,00,00,000.00');
    });

    test('negative amount gets - prefix', () {
      expect(IndianNumberFormat.format(-1234), '-₹1,234.00');
    });

    test('custom symbol replaces ₹', () {
      expect(IndianNumberFormat.format(1000, symbol: '\$'), '\$1,000.00');
    });

    test('empty symbol produces no prefix', () {
      expect(IndianNumberFormat.format(1000, symbol: ''), '1,000.00');
    });

    test('decimals=0 omits decimal part', () {
      expect(IndianNumberFormat.format(1234, decimals: 0), '₹1,234');
    });

    test('decimals=3 shows three decimal places', () {
      expect(IndianNumberFormat.format(1000.123, decimals: 3), '₹1,000.123');
    });

    test('very small amount (0.01) formats correctly', () {
      expect(IndianNumberFormat.format(0.01), '₹0.01');
    });
  });
}
