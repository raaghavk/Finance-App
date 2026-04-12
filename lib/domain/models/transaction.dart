import 'package:paisa_track/core/enums/transaction_type.dart';

class Transaction {
  const Transaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.categoryId,
    required this.accountId,
    this.note = '',
    this.receiptImagePath,
    required this.transactionDate,
    required this.createdAt,
    this.isDeleted = false,
  });

  final String id;
  final double amount;
  final TransactionType type;
  final String categoryId;
  final String accountId;
  final String note;
  final String? receiptImagePath;
  final DateTime transactionDate;
  final DateTime createdAt;
  final bool isDeleted;

  Transaction copyWith({
    String? id,
    double? amount,
    TransactionType? type,
    String? categoryId,
    String? accountId,
    String? note,
    String? receiptImagePath,
    DateTime? transactionDate,
    DateTime? createdAt,
    bool? isDeleted,
  }) {
    return Transaction(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      categoryId: categoryId ?? this.categoryId,
      accountId: accountId ?? this.accountId,
      note: note ?? this.note,
      receiptImagePath: receiptImagePath ?? this.receiptImagePath,
      transactionDate: transactionDate ?? this.transactionDate,
      createdAt: createdAt ?? this.createdAt,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'amount': amount,
      'type': type.name,
      'category_id': categoryId,
      'account_id': accountId,
      'note': note,
      'receipt_image_path': receiptImagePath,
      'transaction_date': transactionDate.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory Transaction.fromMap(Map<String, dynamic> map) {
    return Transaction(
      id: map['id'] as String,
      amount: (map['amount'] as num).toDouble(),
      type: TransactionType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => TransactionType.expense,
      ),
      categoryId: map['category_id'] as String,
      accountId: map['account_id'] as String,
      note: (map['note'] as String?) ?? '',
      receiptImagePath: map['receipt_image_path'] as String?,
      transactionDate: DateTime.parse(map['transaction_date'] as String),
      createdAt: DateTime.parse(map['created_at'] as String),
      isDeleted: (map['is_deleted'] as int) == 1,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Transaction && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
