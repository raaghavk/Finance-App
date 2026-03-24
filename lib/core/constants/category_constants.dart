/// Default expense and income categories for PaisaTrack.
///
/// All categories are India-specific and include both English and
/// Hindi (Devanagari) names for localisation.
library;

import 'package:flutter/material.dart';

/// Represents a single default category entry.
@immutable
class DefaultCategory {
  const DefaultCategory({
    required this.id,
    required this.name,
    required this.nameHi,
    required this.iconName,
    required this.color,
    required this.type,
  });

  /// Stable UUID-v4 identifier for this default category.
  final String id;

  /// English display name.
  final String name;

  /// Hindi (Devanagari) display name.
  final String nameHi;

  /// Material icon name (maps to [Icons] via helper).
  final String iconName;

  /// 32-bit ARGB colour value (e.g. `0xFFFF6B35`).
  final int color;

  /// Either `'expense'` or `'income'`.
  final String type;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DefaultCategory &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'DefaultCategory(id: $id, name: $name, type: $type)';
}

/// Provides the built-in expense and income categories.
abstract final class CategoryConstants {
  // ── Expense Categories (30+) ──────────────────────────────────────────

  static const List<DefaultCategory> defaultExpenseCategories = [
    DefaultCategory(
      id: 'a1b2c3d4-0001-4000-8000-000000000001',
      name: 'Kirana / Groceries',
      nameHi: 'किराना / ग्रोसरी',
      iconName: 'shopping_cart',
      color: 0xFF4CAF50,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0002-4000-8000-000000000002',
      name: 'Chai / Snacks',
      nameHi: 'चाय / नाश्ता',
      iconName: 'local_cafe',
      color: 0xFF795548,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0003-4000-8000-000000000003',
      name: 'Auto / Rickshaw',
      nameHi: 'ऑटो / रिक्शा',
      iconName: 'electric_rickshaw',
      color: 0xFFFFC107,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0004-4000-8000-000000000004',
      name: 'Ola / Uber',
      nameHi: 'ओला / उबर',
      iconName: 'local_taxi',
      color: 0xFF9C27B0,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0005-4000-8000-000000000005',
      name: 'Bus / Metro',
      nameHi: 'बस / मेट्रो',
      iconName: 'directions_bus',
      color: 0xFF2196F3,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0006-4000-8000-000000000006',
      name: 'Petrol',
      nameHi: 'पेट्रोल',
      iconName: 'local_gas_station',
      color: 0xFFFF5722,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0007-4000-8000-000000000007',
      name: 'Tiffin / Mess',
      nameHi: 'टिफ़िन / मेस',
      iconName: 'lunch_dining',
      color: 0xFFFF9800,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0008-4000-8000-000000000008',
      name: 'Rent',
      nameHi: 'किराया',
      iconName: 'home',
      color: 0xFF607D8B,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0009-4000-8000-000000000009',
      name: 'Electricity',
      nameHi: 'बिजली',
      iconName: 'bolt',
      color: 0xFFFDD835,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0010-4000-8000-000000000010',
      name: 'Water',
      nameHi: 'पानी',
      iconName: 'water_drop',
      color: 0xFF29B6F6,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0011-4000-8000-000000000011',
      name: 'Mobile Recharge',
      nameHi: 'मोबाइल रिचार्ज',
      iconName: 'smartphone',
      color: 0xFF7C4DFF,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0012-4000-8000-000000000012',
      name: 'WiFi / Broadband',
      nameHi: 'वाईफ़ाई / ब्रॉडबैंड',
      iconName: 'wifi',
      color: 0xFF00ACC1,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0013-4000-8000-000000000013',
      name: 'School Fees',
      nameHi: 'स्कूल फ़ीस',
      iconName: 'school',
      color: 0xFF3F51B5,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0014-4000-8000-000000000014',
      name: 'Medical / Doctor',
      nameHi: 'डॉक्टर / इलाज',
      iconName: 'local_hospital',
      color: 0xFFF44336,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0015-4000-8000-000000000015',
      name: 'Medicines',
      nameHi: 'दवाइयाँ',
      iconName: 'medication',
      color: 0xFFE91E63,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0016-4000-8000-000000000016',
      name: 'Clothing',
      nameHi: 'कपड़े',
      iconName: 'checkroom',
      color: 0xFFAB47BC,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0017-4000-8000-000000000017',
      name: 'Festival / Gifts',
      nameHi: 'त्यौहार / उपहार',
      iconName: 'card_giftcard',
      color: 0xFFFF7043,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0018-4000-8000-000000000018',
      name: 'Puja / Donation',
      nameHi: 'पूजा / दान',
      iconName: 'temple_hindu',
      color: 0xFFFFB300,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0019-4000-8000-000000000019',
      name: 'Entertainment',
      nameHi: 'मनोरंजन',
      iconName: 'movie',
      color: 0xFFEC407A,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0020-4000-8000-000000000020',
      name: 'Online Shopping',
      nameHi: 'ऑनलाइन शॉपिंग',
      iconName: 'shopping_bag',
      color: 0xFF8D6E63,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0021-4000-8000-000000000021',
      name: 'EMI / Loan',
      nameHi: 'ईएमआई / लोन',
      iconName: 'account_balance',
      color: 0xFF546E7A,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0022-4000-8000-000000000022',
      name: 'Insurance',
      nameHi: 'बीमा',
      iconName: 'security',
      color: 0xFF5C6BC0,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0023-4000-8000-000000000023',
      name: 'Mutual Fund / SIP',
      nameHi: 'म्यूचुअल फंड / एसआईपी',
      iconName: 'trending_up',
      color: 0xFF26A69A,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0024-4000-8000-000000000024',
      name: 'Gold / Jewellery',
      nameHi: 'सोना / ज्वेलरी',
      iconName: 'diamond',
      color: 0xFFFFD54F,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0025-4000-8000-000000000025',
      name: 'Domestic Help',
      nameHi: 'घरेलू सहायक',
      iconName: 'cleaning_services',
      color: 0xFF78909C,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0026-4000-8000-000000000026',
      name: 'LPG Gas',
      nameHi: 'एलपीजी गैस',
      iconName: 'propane_tank',
      color: 0xFFEF5350,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0027-4000-8000-000000000027',
      name: 'Vegetables / Fruit',
      nameHi: 'सब्ज़ी / फल',
      iconName: 'spa',
      color: 0xFF66BB6A,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0028-4000-8000-000000000028',
      name: 'Dairy / Milk',
      nameHi: 'दूध / डेयरी',
      iconName: 'water_drop',
      color: 0xFFBBDEFB,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0029-4000-8000-000000000029',
      name: 'Salon / Beauty',
      nameHi: 'सैलून / ब्यूटी',
      iconName: 'content_cut',
      color: 0xFFCE93D8,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0030-4000-8000-000000000030',
      name: 'Gym',
      nameHi: 'जिम',
      iconName: 'fitness_center',
      color: 0xFF42A5F5,
      type: 'expense',
    ),
    DefaultCategory(
      id: 'a1b2c3d4-0031-4000-8000-000000000031',
      name: 'Others',
      nameHi: 'अन्य',
      iconName: 'more_horiz',
      color: 0xFF9E9E9E,
      type: 'expense',
    ),
  ];

  // ── Income Categories ─────────────────────────────────────────────────

  static const List<DefaultCategory> defaultIncomeCategories = [
    DefaultCategory(
      id: 'b2c3d4e5-0001-4000-8000-000000000001',
      name: 'Salary',
      nameHi: 'वेतन',
      iconName: 'account_balance_wallet',
      color: 0xFF4CAF50,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0002-4000-8000-000000000002',
      name: 'Freelance',
      nameHi: 'फ्रीलांस',
      iconName: 'work',
      color: 0xFF42A5F5,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0003-4000-8000-000000000003',
      name: 'Business',
      nameHi: 'व्यापार',
      iconName: 'store',
      color: 0xFFFF7043,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0004-4000-8000-000000000004',
      name: 'Interest',
      nameHi: 'ब्याज',
      iconName: 'savings',
      color: 0xFF26A69A,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0005-4000-8000-000000000005',
      name: 'Dividend',
      nameHi: 'लाभांश',
      iconName: 'pie_chart',
      color: 0xFF7E57C2,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0006-4000-8000-000000000006',
      name: 'Rental Income',
      nameHi: 'किराये की आय',
      iconName: 'apartment',
      color: 0xFF8D6E63,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0007-4000-8000-000000000007',
      name: 'Cashback',
      nameHi: 'कैशबैक',
      iconName: 'currency_rupee',
      color: 0xFFFFB300,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0008-4000-8000-000000000008',
      name: 'Gift Money',
      nameHi: 'उपहार राशि',
      iconName: 'redeem',
      color: 0xFFEC407A,
      type: 'income',
    ),
    DefaultCategory(
      id: 'b2c3d4e5-0009-4000-8000-000000000009',
      name: 'Others',
      nameHi: 'अन्य',
      iconName: 'more_horiz',
      color: 0xFF9E9E9E,
      type: 'income',
    ),
  ];

  /// All default categories (expense + income) combined.
  static const List<DefaultCategory> allDefaultCategories = [
    ...defaultExpenseCategories,
    ...defaultIncomeCategories,
  ];

  /// Look up a default category by its [id]. Returns `null` if not found.
  static DefaultCategory? findById(String id) {
    for (final category in allDefaultCategories) {
      if (category.id == id) return category;
    }
    return null;
  }
}
