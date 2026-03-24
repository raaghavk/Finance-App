import 'package:drift/drift.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';

/// Predefined and user-created categories for organising transactions.
class CategoriesTable extends Table {
  @override
  String get tableName => 'categories';

  /// Unique identifier (UUID v4 or slug for defaults).
  TextColumn get id => text()();

  /// Display name in English.
  TextColumn get name => text()();

  /// Display name in Hindi (Devanagari).
  TextColumn get nameHi => text()();

  /// Material icon name or codepoint identifier.
  TextColumn get icon => text()();

  /// ARGB colour value used in the UI.
  IntColumn get color => integer()();

  /// Self-referencing FK for sub-categories. Null for top-level.
  TextColumn get parentId => text().nullable()();

  /// Whether the category applies to income, expense, or transfer.
  IntColumn get type => intEnum<TransactionType>()();

  /// Whether this category ships with the app.
  BoolColumn get isDefault =>
      boolean().withDefault(const Constant(false))();

  /// Soft-active flag – hidden categories are not shown in pickers.
  BoolColumn get isActive =>
      boolean().withDefault(const Constant(true))();

  /// User-defined ordering weight.
  IntColumn get sortOrder =>
      integer().withDefault(const Constant(0))();

  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
