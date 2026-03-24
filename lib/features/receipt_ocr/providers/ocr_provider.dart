import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:image_picker/image_picker.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';

part 'ocr_provider.g.dart';

// ---------------------------------------------------------------------------
// OcrState
// ---------------------------------------------------------------------------

@immutable
class OcrState {
  const OcrState({
    this.imagePath,
    this.isProcessing = false,
    this.recognizedText,
    this.parsedExpense,
    this.error,
    this.usageCount = 0,
  });

  /// Local path to the captured or picked receipt image.
  final String? imagePath;

  /// Whether OCR / parsing is running.
  final bool isProcessing;

  /// Raw text extracted by ML Kit text recognition.
  final String? recognizedText;

  /// The expense parsed from the recognised text.
  final ParsedExpense? parsedExpense;

  /// Human-readable error message.
  final String? error;

  /// Number of OCR scans used this month.
  final int usageCount;

  /// Remaining free-tier uses.
  int get remaining => AppConstants.ocrMonthlyLimit - usageCount;

  /// Whether the free-tier limit has been reached.
  bool get isLimitReached => usageCount >= AppConstants.ocrMonthlyLimit;

  OcrState copyWith({
    String? Function()? imagePath,
    bool? isProcessing,
    String? Function()? recognizedText,
    ParsedExpense? Function()? parsedExpense,
    String? Function()? error,
    int? usageCount,
  }) {
    return OcrState(
      imagePath: imagePath != null ? imagePath() : this.imagePath,
      isProcessing: isProcessing ?? this.isProcessing,
      recognizedText:
          recognizedText != null ? recognizedText() : this.recognizedText,
      parsedExpense:
          parsedExpense != null ? parsedExpense() : this.parsedExpense,
      error: error != null ? error() : this.error,
      usageCount: usageCount ?? this.usageCount,
    );
  }
}

// ---------------------------------------------------------------------------
// OcrNotifier
// ---------------------------------------------------------------------------

@riverpod
class OcrNotifier extends _$OcrNotifier {
  final ImagePicker _picker = ImagePicker();
  TextRecognizer? _textRecognizer;

  @override
  OcrState build() {
    ref.onDispose(() {
      _textRecognizer?.close();
    });
    return const OcrState();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /// Open the device camera and capture a receipt photo.
  Future<void> captureImage() async {
    if (state.isLimitReached) {
      state = state.copyWith(
        error: () =>
            'Monthly limit reached. Upgrade to Premium for unlimited scans.',
      );
      return;
    }

    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 90,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (photo == null) return; // user cancelled

      state = state.copyWith(
        imagePath: () => photo.path,
        error: () => null,
        recognizedText: () => null,
        parsedExpense: () => null,
      );

      await processImage(photo.path);
    } catch (e) {
      state = state.copyWith(
        error: () => 'Failed to capture image: $e',
      );
    }
  }

  /// Pick a receipt image from the device gallery.
  Future<void> pickFromGallery() async {
    if (state.isLimitReached) {
      state = state.copyWith(
        error: () =>
            'Monthly limit reached. Upgrade to Premium for unlimited scans.',
      );
      return;
    }

    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (image == null) return; // user cancelled

      state = state.copyWith(
        imagePath: () => image.path,
        error: () => null,
        recognizedText: () => null,
        parsedExpense: () => null,
      );

      await processImage(image.path);
    } catch (e) {
      state = state.copyWith(
        error: () => 'Failed to pick image: $e',
      );
    }
  }

  /// Run ML Kit text recognition on the given [path] then parse expenses.
  Future<void> processImage(String path) async {
    state = state.copyWith(isProcessing: true, error: () => null);

    try {
      // Initialize the text recognizer lazily.
      _textRecognizer ??= TextRecognizer();

      final inputImage = InputImage.fromFilePath(path);
      final RecognizedText result =
          await _textRecognizer!.processImage(inputImage);

      final rawText = result.text;

      if (rawText.trim().isEmpty) {
        state = state.copyWith(
          isProcessing: false,
          error: () => 'No text found in the image. Please try again.',
        );
        return;
      }

      state = state.copyWith(recognizedText: () => rawText);

      // TODO: Replace with actual expense parser call.
      // final parsed = await ref.read(expenseParserProvider).parse(
      //   rawText,
      //   source: 'ocr',
      // );
      final parsed = _parseReceiptText(rawText);

      state = state.copyWith(
        isProcessing: false,
        parsedExpense: () => parsed,
        usageCount: state.usageCount + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isProcessing: false,
        error: () => 'Failed to process image. Please try again.',
      );
    }
  }

  /// Clear all state and return to initial.
  void reset() {
    _textRecognizer?.close();
    _textRecognizer = null;
    state = const OcrState();
  }

  // ── Internals ────────────────────────────────────────────────────────────

  /// Basic heuristic parser for receipt text. In production this would be
  /// replaced by a proper NLP / rule-based parser.
  ParsedExpense _parseReceiptText(String text) {
    double? amount;
    String? merchant;
    DateTime? date;

    // Try to extract an amount (look for numbers preceded by ₹ or 'total').
    final amountRegex = RegExp(
      r'(?:total|amount|grand\s*total|net)[:\s]*[\u20B9Rs.]*\s*([0-9,]+(?:\.[0-9]{1,2})?)',
      caseSensitive: false,
    );
    final amountMatch = amountRegex.firstMatch(text);
    if (amountMatch != null) {
      final raw = amountMatch.group(1)?.replaceAll(',', '');
      amount = double.tryParse(raw ?? '');
    }

    // Fallback: find the largest number prefixed with ₹.
    if (amount == null) {
      final rupeeRegex = RegExp(r'[\u20B9]\s*([0-9,]+(?:\.[0-9]{1,2})?)');
      final matches = rupeeRegex.allMatches(text);
      double maxVal = 0;
      for (final m in matches) {
        final val =
            double.tryParse(m.group(1)?.replaceAll(',', '') ?? '') ?? 0;
        if (val > maxVal) maxVal = val;
      }
      if (maxVal > 0) amount = maxVal;
    }

    // Try to extract a date.
    final dateRegex = RegExp(
      r'(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})',
    );
    final dateMatch = dateRegex.firstMatch(text);
    if (dateMatch != null) {
      final day = int.tryParse(dateMatch.group(1) ?? '') ?? 1;
      final month = int.tryParse(dateMatch.group(2) ?? '') ?? 1;
      var year = int.tryParse(dateMatch.group(3) ?? '') ?? DateTime.now().year;
      if (year < 100) year += 2000;
      date = DateTime(year, month, day);
    }

    // First line is often the merchant name.
    final lines = text.split('\n').where((l) => l.trim().isNotEmpty).toList();
    if (lines.isNotEmpty) {
      merchant = lines.first.trim();
    }

    final confidence = (amount != null ? 0.4 : 0.0) +
        (merchant != null ? 0.2 : 0.0) +
        (date != null ? 0.2 : 0.0) +
        0.1; // baseline for having text at all

    return ParsedExpense(
      amount: amount,
      note: merchant,
      date: date ?? DateTime.now(),
      source: 'ocr',
      rawText: text,
      confidence: confidence.clamp(0.0, 1.0),
    );
  }
}
