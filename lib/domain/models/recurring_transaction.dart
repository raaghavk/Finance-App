import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/recurrence.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';

part 'recurring_transaction.freezed.dart';
part 'recurring_transaction.g.dart';

/// A rule that automatically generates transactions on a schedule.
@freezed
class RecurringTransaction with _$RecurringTransaction {
  const factory RecurringTransaction({
    /// Unique identifier (UUID v4).
    required String id,

    /// Transaction amount in the primary currency.
    required double amount,

    /// Whether this generates income, expense, or transfer transactions.
    required TransactionType type,

    /// Foreign key to the category.
    required String categoryId,

    /// Foreign key to the source account.
    required String accountId,

    /// User-provided note carried over to generated transactions.
    @Default('') String note,

    /// How often the transaction repeats.
    required Recurrence recurrence,

    /// When the recurring rule becomes effective.
    required DateTime startDate,

    /// The next scheduled date for generating a transaction.
    required DateTime nextDate,

    /// Optional end date after which the rule stops.
    DateTime? endDate,

    /// Whether the recurring rule is active.
    @Default(true) bool isActive,

    /// When the record was created locally.
    required DateTime createdAt,
  }) = _RecurringTransaction;

  factory RecurringTransaction.fromJson(Map<String, dynamic> json) =>
      _$RecurringTransactionFromJson(json);
}
