import 'package:paisa_track/core/enums/transaction_type.dart';

class Category {
  const Category({
    required this.id,
    required this.name,
    this.nameHi = '',
    required this.icon,
    required this.color,
    required this.type,
    this.isDefault = false,
    this.isActive = true,
    this.sortOrder = 0,
  });

  final String id;
  final String name;
  final String nameHi;
  final String icon;
  final int color;
  final TransactionType type;
  final bool isDefault;
  final bool isActive;
  final int sortOrder;

  Category copyWith({
    String? id,
    String? name,
    String? nameHi,
    String? icon,
    int? color,
    TransactionType? type,
    bool? isDefault,
    bool? isActive,
    int? sortOrder,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      nameHi: nameHi ?? this.nameHi,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      type: type ?? this.type,
      isDefault: isDefault ?? this.isDefault,
      isActive: isActive ?? this.isActive,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'name_hi': nameHi,
      'icon': icon,
      'color': color,
      'type': type.name,
      'is_default': isDefault ? 1 : 0,
      'is_active': isActive ? 1 : 0,
      'sort_order': sortOrder,
    };
  }

  factory Category.fromMap(Map<String, dynamic> map) {
    return Category(
      id: map['id'] as String,
      name: map['name'] as String,
      nameHi: (map['name_hi'] as String?) ?? '',
      icon: map['icon'] as String,
      color: map['color'] as int,
      type: TransactionType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => TransactionType.expense,
      ),
      isDefault: (map['is_default'] as int) == 1,
      isActive: (map['is_active'] as int) == 1,
      sortOrder: (map['sort_order'] as int?) ?? 0,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Category && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
