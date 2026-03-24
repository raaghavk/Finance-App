import 'package:paisa_track/domain/models/parsed_expense.dart';

/// Parses UPI transaction SMS messages to auto-detect expenses.
/// Premium feature, Android only.
class SmsReaderService {
  /// UPI SMS patterns from Indian banks and payment apps.
  static final List<RegExp> _upiDebitPatterns = [
    // "Rs.450.00 debited from A/c XX1234 on 24-Mar-26"
    RegExp(
      r'(?:rs\.?|inr)\s*(\d+[,\d]*\.?\d*)\s*(?:debited|sent|paid|transferred)',
      caseSensitive: false,
    ),
    // "You've sent Rs 200 to Merchant via UPI"
    RegExp(
      r'(?:sent|paid|transferred)\s*(?:rs\.?|inr)?\s*(\d+[,\d]*\.?\d*)',
      caseSensitive: false,
    ),
    // "UPI txn of Rs 500 from HDFC Bank"
    RegExp(
      r'(?:upi|imps|neft)\s*(?:txn|transaction)?\s*(?:of)?\s*(?:rs\.?|inr)?\s*(\d+[,\d]*\.?\d*)',
      caseSensitive: false,
    ),
    // Google Pay / PhonePe style: "Paid ₹200 to Grocery Store"
    RegExp(
      r'paid\s*[₹]\s*(\d+[,\d]*\.?\d*)\s*to\s+(.+?)(?:\s+on|\s+ref|\s*$)',
      caseSensitive: false,
    ),
  ];

  /// UPI credit patterns for income detection.
  static final List<RegExp> _upiCreditPatterns = [
    RegExp(
      r'(?:rs\.?|inr)\s*(\d+[,\d]*\.?\d*)\s*(?:credited|received)',
      caseSensitive: false,
    ),
    RegExp(
      r'(?:received|credited)\s*(?:rs\.?|inr)?\s*(\d+[,\d]*\.?\d*)',
      caseSensitive: false,
    ),
  ];

  /// Merchant extraction pattern.
  static final RegExp _merchantPattern = RegExp(
    r'(?:to|from|at|merchant:?)\s+([A-Za-z][A-Za-z0-9\s&\-.]+?)(?:\s+(?:on|ref|upi|via|txn|$))',
    caseSensitive: false,
  );

  /// UPI reference pattern.
  static final RegExp _upiRefPattern = RegExp(
    r'(?:ref\.?\s*(?:no\.?)?\s*|upi\s*ref\s*:?\s*)(\d{10,12})',
    caseSensitive: false,
  );

  /// Check if an SMS is a UPI/bank transaction message.
  bool isTransactionSms(String message) {
    final lowerMsg = message.toLowerCase();
    return lowerMsg.contains('upi') ||
        lowerMsg.contains('debited') ||
        lowerMsg.contains('credited') ||
        lowerMsg.contains('neft') ||
        lowerMsg.contains('imps') ||
        (lowerMsg.contains('rs') && lowerMsg.contains('a/c')) ||
        (lowerMsg.contains('₹') &&
            (lowerMsg.contains('paid') || lowerMsg.contains('received')));
  }

  /// Parse a transaction SMS into a ParsedExpense.
  /// Returns null if the SMS cannot be parsed.
  ParsedExpense? parseSms(String message, {String? sender}) {
    if (!isTransactionSms(message)) return null;

    final lowerMsg = message.toLowerCase();
    final isCredit = _isCredit(lowerMsg);
    final amount = _extractAmount(message, isCredit);

    if (amount == null) return null;

    final merchant = _extractMerchant(message);
    final upiRef = _extractUpiRef(message);

    return ParsedExpense(
      amount: amount,
      currency: 'INR',
      categoryId: null, // Will be inferred by ExpenseParserService from merchant
      categoryName: null,
      accountId: null,
      note: merchant ?? (sender != null ? 'SMS from $sender' : 'UPI Transaction'),
      date: DateTime.now(),
      source: 'sms',
      confidence: merchant != null ? 0.7 : 0.5,
      rawText: message,
    );
  }

  bool _isCredit(String lowerMsg) {
    return lowerMsg.contains('credited') ||
        lowerMsg.contains('received') ||
        lowerMsg.contains('deposited');
  }

  double? _extractAmount(String message, bool isCredit) {
    final patterns = isCredit ? _upiCreditPatterns : _upiDebitPatterns;

    for (final pattern in patterns) {
      final match = pattern.firstMatch(message);
      if (match != null) {
        final amountStr = match.group(1)!.replaceAll(',', '');
        final amount = double.tryParse(amountStr);
        if (amount != null && amount > 0) return amount;
      }
    }

    // Fallback: find any amount with Rs/₹ prefix
    final fallback = RegExp(r'(?:rs\.?|₹|inr)\s*(\d+[,\d]*\.?\d*)',
        caseSensitive: false);
    final match = fallback.firstMatch(message);
    if (match != null) {
      final amountStr = match.group(1)!.replaceAll(',', '');
      return double.tryParse(amountStr);
    }

    return null;
  }

  String? _extractMerchant(String message) {
    final match = _merchantPattern.firstMatch(message);
    if (match != null) {
      return match.group(1)!.trim();
    }
    return null;
  }

  String? _extractUpiRef(String message) {
    final match = _upiRefPattern.firstMatch(message);
    return match?.group(1);
  }
}
