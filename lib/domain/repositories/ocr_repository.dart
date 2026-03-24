import 'package:paisa_track/domain/models/parsed_expense.dart';

/// Contract for optical character recognition on receipt images.
abstract class OcrRepository {
  /// Extract raw text from an image at [imagePath].
  Future<String> recognizeText(String imagePath);

  /// Extract and parse expense data from an image at [imagePath].
  Future<ParsedExpense> extractExpense(String imagePath);
}
