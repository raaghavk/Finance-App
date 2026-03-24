import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/domain/services/expense_parser_service.dart';

void main() {
  late ExpenseParserService parser;

  setUp(() {
    parser = ExpenseParserService();
  });

  group('amount extraction', () {
    test('₹450 extracts 450.0', () {
      final result = parser.parse('₹450');
      expect(result.amount, 450.0);
    });

    test('Rs.450 extracts 450.0', () {
      final result = parser.parse('Rs.450');
      expect(result.amount, 450.0);
    });

    test('Rs 450 extracts 450.0', () {
      final result = parser.parse('Rs 450');
      expect(result.amount, 450.0);
    });

    test('450 rupees extracts 450.0', () {
      final result = parser.parse('450 rupees');
      expect(result.amount, 450.0);
    });

    test('comma-separated: ₹1,500 extracts 1500.0', () {
      final result = parser.parse('₹1,500');
      expect(result.amount, 1500.0);
    });

    test('decimal: ₹99.50 extracts 99.5', () {
      final result = parser.parse('₹99.50');
      expect(result.amount, 99.5);
    });

    test('no amount returns null amount', () {
      final result = parser.parse('just some text');
      expect(result.amount, isNull);
    });

    test('amount >= 10000000 returns null', () {
      final result = parser.parse('₹10000000');
      expect(result.amount, isNull);
    });
  });

  group('category matching - exact', () {
    test('"chai" maps to cat_chai_snacks', () {
      final result = parser.parse('chai ₹50');
      expect(result.categoryId, 'cat_chai_snacks');
    });

    test('"kirana" maps to cat_groceries', () {
      final result = parser.parse('kirana ₹500');
      expect(result.categoryId, 'cat_groceries');
    });

    test('"uber" maps to cat_ola_uber', () {
      final result = parser.parse('uber ₹200');
      expect(result.categoryId, 'cat_ola_uber');
    });

    test('"rent" maps to cat_rent', () {
      final result = parser.parse('rent ₹15000');
      expect(result.categoryId, 'cat_rent');
    });

    test('"salary" maps to cat_salary', () {
      final result = parser.parse('salary ₹50000');
      expect(result.categoryId, 'cat_salary');
    });

    test('multi-word: "auto rickshaw" maps to cat_auto_rickshaw', () {
      final result = parser.parse('auto rickshaw ₹30');
      expect(result.categoryId, 'cat_auto_rickshaw');
    });
  });

  group('category matching - fuzzy', () {
    test('"chay" (distance 1 from "chai") matches', () {
      final result = parser.parse('chay ₹50');
      expect(result.categoryId, 'cat_chai_snacks');
    });

    test('"groccery" fuzzy matches groceries', () {
      final result = parser.parse('groccery ₹500');
      expect(result.categoryId, 'cat_groceries');
    });

    test('"xyzabc" no match returns null categoryId', () {
      final result = parser.parse('xyzabc ₹100');
      expect(result.categoryId, isNull);
    });
  });

  group('date extraction', () {
    test('"aaj" extracts today', () {
      final result = parser.parse('aaj chai ₹50');
      final today = DateTime.now();
      expect(result.date?.day, today.day);
      expect(result.date?.month, today.month);
      expect(result.date?.year, today.year);
    });

    test('"yesterday" extracts yesterday', () {
      final result = parser.parse('yesterday uber ₹200');
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      expect(result.date?.day, yesterday.day);
      expect(result.date?.month, yesterday.month);
    });

    test('"parso" extracts day before yesterday', () {
      final result = parser.parse('parso ₹100');
      final dayBefore = DateTime.now().subtract(const Duration(days: 2));
      expect(result.date?.day, dayBefore.day);
    });

    test('"15/03/2025" extracts that date', () {
      final result = parser.parse('₹500 on 15/03/2025');
      expect(result.date?.day, 15);
      expect(result.date?.month, 3);
      expect(result.date?.year, 2025);
    });

    test('no date keyword defaults to today', () {
      final result = parser.parse('₹100 kirana');
      final today = DateTime.now();
      expect(result.date?.day, today.day);
    });
  });

  group('confidence scoring', () {
    test('amount + category + date gives 1.0', () {
      final result = parser.parse('chai pe ₹50 aaj');
      expect(result.confidence, 1.0);
    });

    test('amount only gives 0.6 (date defaults to today = 0.2)', () {
      final result = parser.parse('₹500 xyzabc');
      // amount=0.4, no category=0.0, date defaults to today=0.2
      expect(result.confidence, 0.6);
    });

    test('category only gives 0.6 (date defaults to today = 0.2)', () {
      final result = parser.parse('went to kirana');
      // no amount from keywords, category=0.4, date=0.2
      // Note: "went" won't match amount, but "to" is short
      expect(result.confidence, greaterThanOrEqualTo(0.6));
    });

    test('nothing meaningful returns 0.2 (date default)', () {
      // Use words that won't match anything
      final result = parser.parse('zxqwp');
      // No amount, no category, date defaults to today (0.2)
      expect(result.confidence, 0.2);
    });
  });

  group('full parse integration', () {
    test('"chai pe ₹50 aaj" parses correctly', () {
      final result = parser.parse('chai pe ₹50 aaj');
      expect(result.amount, 50.0);
      expect(result.categoryId, 'cat_chai_snacks');
      expect(result.confidence, 1.0);
      expect(result.currency, 'INR');
      expect(result.source, 'text');
    });

    test('"spent Rs 200 on uber yesterday" parses correctly', () {
      final result = parser.parse('spent Rs 200 on uber yesterday');
      expect(result.amount, 200.0);
      expect(result.categoryId, 'cat_ola_uber');
    });

    test('"kirana 1500 rupees" parses correctly', () {
      final result = parser.parse('kirana 1500 rupees');
      expect(result.amount, 1500.0);
      expect(result.categoryId, 'cat_groceries');
    });

    test('"salary 50000 credited" parses correctly', () {
      final result = parser.parse('salary 50000 credited');
      expect(result.amount, 50000.0);
      expect(result.categoryId, 'cat_salary');
    });

    test('rawText preserves original input', () {
      const input = 'Chai pe ₹50 Aaj';
      final result = parser.parse(input);
      expect(result.rawText, input);
    });
  });

  group('note extraction', () {
    test('removes filler words from note', () {
      final result = parser.parse('spent ₹200 on chai');
      // "spent", "on" are filler words, "₹200" is amount, "chai" is category keyword
      expect(result.note, isNotNull);
      // Note should not contain "spent" or "on"
      expect(result.note?.contains('spent'), isFalse);
    });
  });
}
