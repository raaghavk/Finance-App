import 'dart:io';

import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';
import 'package:paisa_track/domain/repositories/ocr_repository.dart';

/// ML Kit-backed implementation of [OcrRepository].
class OcrRepositoryImpl implements OcrRepository {
  OcrRepositoryImpl();

  final TextRecognizer _textRecognizer = TextRecognizer();

  // ── Regex patterns for receipt parsing ───────────────────────────────

  /// Matches common total/amount lines on receipts.
  static final _amountPatterns = [
    // "Total: Rs 1,234.56" or "Total Rs1234.56"
    RegExp(
      r'(?:total|amount|grand\s*total|net\s*amount|payable)\s*:?\s*(?:rs\.?|inr|₹)?\s*([\d,]+\.?\d*)',
      caseSensitive: false,
    ),
    // "₹1,234.56" or "Rs. 1234"
    RegExp(
      r'(?:rs\.?|inr|₹)\s*([\d,]+\.?\d*)',
      caseSensitive: false,
    ),
  ];

  /// Matches common date formats on receipts.
  static final _datePatterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    RegExp(r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})'),
    // YYYY-MM-DD
    RegExp(r'(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})'),
    // "12 Jan 2024" or "12 January 2024"
    RegExp(
      r'(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{2,4})',
      caseSensitive: false,
    ),
  ];

  static const _monthMap = {
    'jan': 1, 'january': 1,
    'feb': 2, 'february': 2,
    'mar': 3, 'march': 3,
    'apr': 4, 'april': 4,
    'may': 5,
    'jun': 6, 'june': 6,
    'jul': 7, 'july': 7,
    'aug': 8, 'august': 8,
    'sep': 9, 'september': 9,
    'oct': 10, 'october': 10,
    'nov': 11, 'november': 11,
    'dec': 12, 'december': 12,
  };

  // ── Public API ───────────────────────────────────────────────────────

  @override
  Future<String> recognizeText(String imagePath) async {
    final inputImage = InputImage.fromFile(File(imagePath));
    final recognised = await _textRecognizer.processImage(inputImage);
    return recognised.text;
  }

  @override
  Future<ParsedExpense> extractExpense(String imagePath) async {
    final rawText = await recognizeText(imagePath);
    final lines = rawText.split('\n').map((l) => l.trim()).toList();

    final amount = _extractAmount(rawText);
    final merchant = _extractMerchant(lines);
    final date = _extractDate(rawText);

    return ParsedExpense(
      amount: amount,
      currency: 'INR',
      note: merchant,
      date: date,
      source: 'ocr',
      confidence: _calculateConfidence(amount: amount, date: date),
      rawText: rawText,
    );
  }

  // ── Private helpers ──────────────────────────────────────────────────

  double? _extractAmount(String text) {
    for (final pattern in _amountPatterns) {
      final matches = pattern.allMatches(text);
      // Prefer later matches (receipts usually have sub-totals before the
      // grand total).
      double? best;
      for (final match in matches) {
        final raw = match.group(1)?.replaceAll(',', '');
        final parsed = double.tryParse(raw ?? '');
        if (parsed != null && parsed > 0) {
          best = parsed;
        }
      }
      if (best != null) return best;
    }
    return null;
  }

  /// The merchant name is usually the first non-empty, non-numeric line at the
  /// top of the receipt.
  String? _extractMerchant(List<String> lines) {
    for (final line in lines.take(5)) {
      if (line.isEmpty) continue;
      // Skip lines that are purely numeric or look like dates/amounts.
      if (RegExp(r'^[\d\s,./:₹\-]+$').hasMatch(line)) continue;
      return line;
    }
    return null;
  }

  DateTime? _extractDate(String text) {
    // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
    final ddmmyyyy = _datePatterns[0].firstMatch(text);
    if (ddmmyyyy != null) {
      final day = int.tryParse(ddmmyyyy.group(1) ?? '');
      final month = int.tryParse(ddmmyyyy.group(2) ?? '');
      var year = int.tryParse(ddmmyyyy.group(3) ?? '');
      if (day != null && month != null && year != null) {
        if (year < 100) year += 2000;
        return _safeDate(year, month, day);
      }
    }

    // Pattern 2: YYYY-MM-DD
    final yyyymmdd = _datePatterns[1].firstMatch(text);
    if (yyyymmdd != null) {
      final year = int.tryParse(yyyymmdd.group(1) ?? '');
      final month = int.tryParse(yyyymmdd.group(2) ?? '');
      final day = int.tryParse(yyyymmdd.group(3) ?? '');
      if (year != null && month != null && day != null) {
        return _safeDate(year, month, day);
      }
    }

    // Pattern 3: "12 Jan 2024"
    final namedMonth = _datePatterns[2].firstMatch(text);
    if (namedMonth != null) {
      final day = int.tryParse(namedMonth.group(1) ?? '');
      final monthStr = namedMonth.group(2)?.toLowerCase();
      var year = int.tryParse(namedMonth.group(3) ?? '');
      final month = _monthMap[monthStr];
      if (day != null && month != null && year != null) {
        if (year < 100) year += 2000;
        return _safeDate(year, month, day);
      }
    }

    return null;
  }

  /// Returns a valid [DateTime] or null if the values are out of range.
  DateTime? _safeDate(int year, int month, int day) {
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    try {
      return DateTime(year, month, day);
    } catch (_) {
      return null;
    }
  }

  double _calculateConfidence({double? amount, DateTime? date}) {
    double score = 0.0;
    if (amount != null) score += 0.6;
    if (date != null) score += 0.3;
    // A bit of base confidence for having recognised text at all.
    score += 0.1;
    return score.clamp(0.0, 1.0);
  }
}
