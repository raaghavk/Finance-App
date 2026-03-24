import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';

part 'category.freezed.dart';
part 'category.g.dart';

/// A category used to classify transactions (e.g. Groceries, Salary).
@freezed
class Category with _$Category {
  const factory Category({
    /// Unique identifier (UUID v4 or slug for defaults).
    required String id,

    /// Display name in English.
    required String name,

    /// Display name in Hindi (Devanagari).
    @Default('') String nameHi,

    /// Material icon name or codepoint identifier.
    required String icon,

    /// ARGB colour value used in the UI.
    required int color,

    /// Parent category id for sub-categories. Null for top-level.
    String? parentId,

    /// Whether the category applies to income, expense, or transfer.
    required TransactionType type,

    /// Whether this category ships with the app.
    @Default(false) bool isDefault,

    /// Whether this category is visible in pickers.
    @Default(true) bool isActive,

    /// User-defined ordering weight.
    @Default(0) int sortOrder,

    /// When the record was created.
    required DateTime createdAt,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) =>
      _$CategoryFromJson(json);
}
