import 'package:freezed_annotation/freezed_annotation.dart';

part 'parsed_expense.freezed.dart';
part 'parsed_expense.g.dart';

/// The result of parsing a natural-language expense input (voice, chat, or OCR).
@freezed
class ParsedExpense with _$ParsedExpense {
  const factory ParsedExpense({
    /// Extracted amount. Null if the parser could not find a number.
    double? amount,

    /// ISO 4217 currency code detected in the input.
    String? currency,

    /// Matched category ID based on keyword analysis.
    String? categoryId,

    /// Human-readable category name suggestion.
    String? categoryName,

    /// Matched account ID if mentioned in input.
    String? accountId,

    /// Remaining text used as a transaction note.
    String? note,

    /// Extracted date. Null if no date was detected.
    DateTime? date,

    /// How the input was provided: "voice", "chat", or "ocr".
    required String source,

    /// Confidence score of the parse (0.0 – 1.0).
    @Default(0.0) double confidence,

    /// The original raw text that was parsed.
    @Default('') String rawText,
  }) = _ParsedExpense;

  factory ParsedExpense.fromJson(Map<String, dynamic> json) =>
      _$ParsedExpenseFromJson(json);
}
