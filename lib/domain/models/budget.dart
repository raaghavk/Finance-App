class Budget {
  const Budget({
    required this.id,
    required this.name,
    required this.limitAmount,
    required this.startDate,
    this.isActive = true,
    this.categoryIds = const [],
    required this.createdAt,
    this.isDeleted = false,
    this.spentAmount = 0.0,
  });

  final String id;
  final String name;
  final double limitAmount;
  final DateTime startDate;
  final bool isActive;
  final List<String> categoryIds;
  final DateTime createdAt;
  final bool isDeleted;

  /// Computed — filled in by the provider, not stored in DB.
  final double spentAmount;

  double get remainingAmount => limitAmount - spentAmount;
  double get progressPercent =>
      limitAmount == 0 ? 0 : (spentAmount / limitAmount).clamp(0.0, 1.0);
  bool get isOverBudget => spentAmount > limitAmount;

  Budget copyWith({
    String? id,
    String? name,
    double? limitAmount,
    DateTime? startDate,
    bool? isActive,
    List<String>? categoryIds,
    DateTime? createdAt,
    bool? isDeleted,
    double? spentAmount,
  }) {
    return Budget(
      id: id ?? this.id,
      name: name ?? this.name,
      limitAmount: limitAmount ?? this.limitAmount,
      startDate: startDate ?? this.startDate,
      isActive: isActive ?? this.isActive,
      categoryIds: categoryIds ?? this.categoryIds,
      createdAt: createdAt ?? this.createdAt,
      isDeleted: isDeleted ?? this.isDeleted,
      spentAmount: spentAmount ?? this.spentAmount,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'limit_amount': limitAmount,
      'start_date': startDate.toIso8601String(),
      'is_active': isActive ? 1 : 0,
      'category_ids': categoryIds.join(','),
      'created_at': createdAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory Budget.fromMap(Map<String, dynamic> map) {
    final catStr = (map['category_ids'] as String?) ?? '';
    return Budget(
      id: map['id'] as String,
      name: map['name'] as String,
      limitAmount: (map['limit_amount'] as num).toDouble(),
      startDate: DateTime.parse(map['start_date'] as String),
      isActive: (map['is_active'] as int) == 1,
      categoryIds: catStr.isEmpty ? [] : catStr.split(','),
      createdAt: DateTime.parse(map['created_at'] as String),
      isDeleted: (map['is_deleted'] as int) == 1,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Budget && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
