import 'package:paisa_track/core/enums/account_type.dart';

class Account {
  const Account({
    required this.id,
    required this.name,
    required this.type,
    this.initialBalance = 0.0,
    this.currency = 'INR',
    this.icon = 'account_balance_wallet',
    this.color = 0xFF4CAF50,
    this.isActive = true,
    this.sortOrder = 0,
    this.currentBalance = 0.0,
    required this.createdAt,
    this.isDeleted = false,
  });

  final String id;
  final String name;
  final AccountType type;
  final double initialBalance;
  final String currency;
  final String icon;
  final int color;
  final bool isActive;
  final int sortOrder;
  final double currentBalance;
  final DateTime createdAt;
  final bool isDeleted;

  Account copyWith({
    String? id,
    String? name,
    AccountType? type,
    double? initialBalance,
    String? currency,
    String? icon,
    int? color,
    bool? isActive,
    int? sortOrder,
    double? currentBalance,
    DateTime? createdAt,
    bool? isDeleted,
  }) {
    return Account(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      initialBalance: initialBalance ?? this.initialBalance,
      currency: currency ?? this.currency,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      isActive: isActive ?? this.isActive,
      sortOrder: sortOrder ?? this.sortOrder,
      currentBalance: currentBalance ?? this.currentBalance,
      createdAt: createdAt ?? this.createdAt,
      isDeleted: isDeleted ?? this.isDeleted,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'initial_balance': initialBalance,
      'currency': currency,
      'icon': icon,
      'color': color,
      'is_active': isActive ? 1 : 0,
      'sort_order': sortOrder,
      'current_balance': currentBalance,
      'created_at': createdAt.toIso8601String(),
      'is_deleted': isDeleted ? 1 : 0,
    };
  }

  factory Account.fromMap(Map<String, dynamic> map) {
    return Account(
      id: map['id'] as String,
      name: map['name'] as String,
      type: AccountType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => AccountType.savings,
      ),
      initialBalance: (map['initial_balance'] as num).toDouble(),
      currency: (map['currency'] as String?) ?? 'INR',
      icon: (map['icon'] as String?) ?? 'account_balance_wallet',
      color: (map['color'] as int?) ?? 0xFF4CAF50,
      isActive: (map['is_active'] as int) == 1,
      sortOrder: (map['sort_order'] as int?) ?? 0,
      currentBalance: (map['current_balance'] as num?)?.toDouble() ?? 0.0,
      createdAt: DateTime.parse(map['created_at'] as String),
      isDeleted: (map['is_deleted'] as int) == 1,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Account && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
