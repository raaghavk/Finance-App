import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';

import 'package:paisa_track/core/enums/input_source.dart';
import 'package:paisa_track/core/enums/sync_status.dart';
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/transaction.dart';

part 'transaction_form_provider.g.dart';

// ---------------------------------------------------------------------------
// Form state model
// ---------------------------------------------------------------------------

/// Holds all form fields for adding or editing a transaction.
@immutable
class TransactionFormState {
  const TransactionFormState({
    this.id,
    this.amount = 0,
    this.type = TransactionType.expense,
    this.categoryId,
    this.accountId,
    this.toAccountId,
    this.note = '',
    this.date,
    this.receiptImagePath,
    this.inputSource = InputSource.manual,
    this.isSubmitting = false,
    this.errorMessage,
    this.isEditing = false,
  });

  /// Non-null when editing an existing transaction.
  final String? id;
  final double amount;
  final TransactionType type;
  final String? categoryId;
  final String? accountId;
  final String? toAccountId;
  final String note;
  final DateTime? date;
  final String? receiptImagePath;
  final InputSource inputSource;
  final bool isSubmitting;
  final String? errorMessage;
  final bool isEditing;

  TransactionFormState copyWith({
    String? Function()? id,
    double? amount,
    TransactionType? type,
    String? Function()? categoryId,
    String? Function()? accountId,
    String? Function()? toAccountId,
    String? note,
    DateTime? Function()? date,
    String? Function()? receiptImagePath,
    InputSource? inputSource,
    bool? isSubmitting,
    String? Function()? errorMessage,
    bool? isEditing,
  }) {
    return TransactionFormState(
      id: id != null ? id() : this.id,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      categoryId: categoryId != null ? categoryId() : this.categoryId,
      accountId: accountId != null ? accountId() : this.accountId,
      toAccountId: toAccountId != null ? toAccountId() : this.toAccountId,
      note: note ?? this.note,
      date: date != null ? date() : this.date,
      receiptImagePath: receiptImagePath != null
          ? receiptImagePath()
          : this.receiptImagePath,
      inputSource: inputSource ?? this.inputSource,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
      isEditing: isEditing ?? this.isEditing,
    );
  }

  /// Validate the form before submission. Returns null when valid.
  String? validate() {
    if (amount <= 0) return 'Please enter a valid amount';
    if (categoryId == null || categoryId!.isEmpty) {
      return 'Please select a category';
    }
    if (accountId == null || accountId!.isEmpty) {
      return 'Please select an account';
    }
    if (type == TransactionType.transfer &&
        (toAccountId == null || toAccountId!.isEmpty)) {
      return 'Please select a destination account';
    }
    if (type == TransactionType.transfer && accountId == toAccountId) {
      return 'Source and destination accounts must be different';
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lightweight ParsedExpense contract
// ---------------------------------------------------------------------------

/// A parsed expense from voice, chat, or OCR input.
/// This is a simple contract so the form can be pre-filled from any AI source.
@immutable
class ParsedExpense {
  const ParsedExpense({
    this.amount,
    this.categoryId,
    this.note,
    this.date,
    this.type,
    this.inputSource = InputSource.manual,
  });

  final double? amount;
  final String? categoryId;
  final String? note;
  final DateTime? date;
  final TransactionType? type;
  final InputSource inputSource;
}

// ---------------------------------------------------------------------------
// TransactionFormNotifier
// ---------------------------------------------------------------------------

@riverpod
class TransactionFormNotifier extends _$TransactionFormNotifier {
  static const _uuid = Uuid();

  @override
  TransactionFormState build() {
    return TransactionFormState(date: DateTime.now());
  }

  // ── Field setters ───────────────────────────────────────────────────────

  void setAmount(double amount) =>
      state = state.copyWith(amount: amount, errorMessage: () => null);

  void setType(TransactionType type) => state = state.copyWith(
        type: type,
        categoryId: () => null, // reset category on type change
        toAccountId: () => null,
        errorMessage: () => null,
      );

  void setCategory(String categoryId) =>
      state = state.copyWith(categoryId: () => categoryId, errorMessage: () => null);

  void setAccount(String accountId) =>
      state = state.copyWith(accountId: () => accountId, errorMessage: () => null);

  void setToAccount(String toAccountId) =>
      state = state.copyWith(toAccountId: () => toAccountId, errorMessage: () => null);

  void setNote(String note) =>
      state = state.copyWith(note: note, errorMessage: () => null);

  void setDate(DateTime date) =>
      state = state.copyWith(date: () => date, errorMessage: () => null);

  void setReceiptImage(String? path) =>
      state = state.copyWith(receiptImagePath: () => path, errorMessage: () => null);

  // ── Pre-fill from AI sources ───────────────────────────────────────────

  /// Pre-fill form fields from a parsed expense (voice / chat / OCR).
  void loadFromParsedExpense(ParsedExpense parsed) {
    state = state.copyWith(
      amount: parsed.amount ?? state.amount,
      type: parsed.type ?? state.type,
      categoryId: () => parsed.categoryId ?? state.categoryId,
      note: parsed.note ?? state.note,
      date: () => parsed.date ?? state.date,
      inputSource: parsed.inputSource,
      errorMessage: () => null,
    );
  }

  /// Load an existing transaction for editing.
  void loadForEditing(Transaction transaction) {
    state = TransactionFormState(
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId,
      note: transaction.note,
      date: transaction.transactionDate,
      receiptImagePath: transaction.receiptImagePath,
      inputSource: transaction.inputSource,
      isEditing: true,
    );
  }

  // ── Submit / Save ──────────────────────────────────────────────────────

  /// Validate and save the transaction. Returns the saved [Transaction] or
  /// null if validation fails.
  Future<Transaction?> submit() async {
    // Validate
    final error = state.validate();
    if (error != null) {
      state = state.copyWith(errorMessage: () => error);
      return null;
    }

    state = state.copyWith(isSubmitting: true, errorMessage: () => null);

    try {
      final now = DateTime.now();
      final transaction = Transaction(
        id: state.id ?? _uuid.v4(),
        amount: state.amount,
        type: state.type,
        categoryId: state.categoryId!,
        accountId: state.accountId!,
        toAccountId: state.toAccountId,
        note: state.note,
        receiptImagePath: state.receiptImagePath,
        transactionDate: state.date ?? now,
        inputSource: state.inputSource,
        syncStatus: SyncStatus.pending,
        createdAt: state.isEditing ? now : now, // preserve on edit via repo
        updatedAt: now,
      );

      // TODO: Replace with actual repository call once available.
      // final repo = ref.read(transactionRepositoryProvider);
      // if (state.isEditing) {
      //   await repo.update(transaction);
      // } else {
      //   await repo.insert(transaction);
      // }

      state = state.copyWith(isSubmitting: false);
      return transaction;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: () => 'Failed to save transaction: $e',
      );
      return null;
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────

  void reset() {
    state = TransactionFormState(date: DateTime.now());
  }
}
