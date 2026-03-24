import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:paisa_track/core/enums/account_type.dart';
import 'package:paisa_track/core/enums/sync_status.dart';

part 'account.freezed.dart';
part 'account.g.dart';

/// A financial account such as a bank account, wallet, or credit card.
@freezed
class Account with _$Account {
  const factory Account({
    /// Unique identifier (UUID v4).
    required String id,

    /// User-facing name (e.g. "SBI Savings", "Cash").
    required String name,

    /// The kind of account.
    required AccountType type,

    /// Starting balance when the account was added.
    @Default(0.0) double initialBalance,

    /// ISO 4217 currency code.
    @Default('INR') String currency,

    /// Material icon name or codepoint identifier.
    @Default('account_balance_wallet') String icon,

    /// ARGB colour value used in the UI.
    @Default(0xFF4CAF50) int color,

    /// Whether the account is visible and usable.
    @Default(true) bool isActive,

    /// User-defined ordering weight.
    @Default(0) int sortOrder,

    /// Computed current balance (initialBalance + income - expenses).
    @Default(0.0) double currentBalance,

    /// Cloud sync status.
    @Default(SyncStatus.pending) SyncStatus syncStatus,

    /// When the record was created locally.
    required DateTime createdAt,

    /// When the record was last updated.
    required DateTime updatedAt,

    /// Soft-delete flag.
    @Default(false) bool isDeleted,
  }) = _Account;

  factory Account.fromJson(Map<String, dynamic> json) =>
      _$AccountFromJson(json);
}
