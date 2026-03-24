import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';

part 'transaction.freezed.dart';
part 'transaction.g.dart';

/// A single financial transaction recorded by the user.
@freezed
class Transaction with _$Transaction {
  const factory Transaction({
    /// Unique identifier (UUID v4).
    required String id,

    /// Transaction amount in the primary (display) currency.
    required double amount,

    /// ISO 4217 code of the currency the user originally entered.
    @Default('INR') String originalCurrency,

    /// Amount in the original currency before conversion.
    double? originalAmount,

    /// Exchange rate used for conversion (original -> primary).
    double? exchangeRate,

    /// Whether this is income, expense, or a transfer.
    required TransactionType type,

    /// Foreign key to the category.
    required String categoryId,

    /// Foreign key to the source account.
    required String accountId,

    /// Destination account for transfers.
    String? toAccountId,

    /// User-provided note or description.
    @Default('') String note,

    /// Local file path of an attached receipt image.
    String? receiptImagePath,

    /// When the transaction actually occurred.
    required DateTime transactionDate,

    /// How the transaction was entered.
    @Default(InputSource.manual) InputSource inputSource,

    /// If generated from a recurring rule, references its id.
    String? recurringId,

    /// Cloud sync status.
    @Default(SyncStatus.pending) SyncStatus syncStatus,

    /// When the record was created locally.
    required DateTime createdAt,

    /// When the record was last updated.
    required DateTime updatedAt,

    /// Soft-delete flag.
    @Default(false) bool isDeleted,
  }) = _Transaction;

  factory Transaction.fromJson(Map<String, dynamic> json) =>
      _$TransactionFromJson(json);
}
