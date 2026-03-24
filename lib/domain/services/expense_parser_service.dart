import 'package:paisa_track/core/constants/category_constants.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';

/// Core NLP engine for parsing natural language text into structured expenses.
/// Shared by voice input, chat input, and OCR pipelines.
class ExpenseParserService {
  /// Keyword → category ID mapping for Hindi, Hinglish, and English terms.
  static final Map<String, String> _keywordToCategory = {
    // Kirana / Groceries
    'kirana': 'cat_groceries',
    'grocery': 'cat_groceries',
    'groceries': 'cat_groceries',
    'sabzi': 'cat_groceries',
    'sabji': 'cat_groceries',
    'rashan': 'cat_groceries',
    'ration': 'cat_groceries',
    'supermarket': 'cat_groceries',
    'bigbasket': 'cat_groceries',
    'blinkit': 'cat_groceries',
    'zepto': 'cat_groceries',
    'dmart': 'cat_groceries',
    'reliance fresh': 'cat_groceries',
    'more': 'cat_groceries',

    // Chai / Snacks
    'chai': 'cat_chai_snacks',
    'tea': 'cat_chai_snacks',
    'coffee': 'cat_chai_snacks',
    'nashta': 'cat_chai_snacks',
    'nasta': 'cat_chai_snacks',
    'breakfast': 'cat_chai_snacks',
    'snack': 'cat_chai_snacks',
    'snacks': 'cat_chai_snacks',
    'samosa': 'cat_chai_snacks',
    'vada pav': 'cat_chai_snacks',
    'pakoda': 'cat_chai_snacks',
    'pakora': 'cat_chai_snacks',
    'biscuit': 'cat_chai_snacks',
    'chips': 'cat_chai_snacks',
    'namkeen': 'cat_chai_snacks',
    'starbucks': 'cat_chai_snacks',

    // Auto / Rickshaw
    'auto': 'cat_auto_rickshaw',
    'rickshaw': 'cat_auto_rickshaw',
    'auto rickshaw': 'cat_auto_rickshaw',
    'tuk tuk': 'cat_auto_rickshaw',
    'autorickshaw': 'cat_auto_rickshaw',
    'three wheeler': 'cat_auto_rickshaw',

    // Ola / Uber
    'ola': 'cat_ola_uber',
    'uber': 'cat_ola_uber',
    'cab': 'cat_ola_uber',
    'taxi': 'cat_ola_uber',
    'rapido': 'cat_ola_uber',
    'ride': 'cat_ola_uber',

    // Bus / Metro
    'bus': 'cat_bus_metro',
    'metro': 'cat_bus_metro',
    'train': 'cat_bus_metro',
    'railway': 'cat_bus_metro',
    'ticket': 'cat_bus_metro',
    'local': 'cat_bus_metro',
    'suburban': 'cat_bus_metro',

    // Petrol
    'petrol': 'cat_petrol',
    'diesel': 'cat_petrol',
    'fuel': 'cat_petrol',
    'pump': 'cat_petrol',
    'gas station': 'cat_petrol',
    'cng': 'cat_petrol',
    'ev charge': 'cat_petrol',
    'charging': 'cat_petrol',

    // Tiffin / Mess
    'tiffin': 'cat_tiffin_mess',
    'mess': 'cat_tiffin_mess',
    'khana': 'cat_tiffin_mess',
    'lunch': 'cat_tiffin_mess',
    'dinner': 'cat_tiffin_mess',
    'food': 'cat_tiffin_mess',
    'restaurant': 'cat_tiffin_mess',
    'hotel': 'cat_tiffin_mess',
    'dhaba': 'cat_tiffin_mess',
    'canteen': 'cat_tiffin_mess',
    'zomato': 'cat_tiffin_mess',
    'swiggy': 'cat_tiffin_mess',
    'biryani': 'cat_tiffin_mess',
    'pizza': 'cat_tiffin_mess',
    'burger': 'cat_tiffin_mess',
    'thali': 'cat_tiffin_mess',

    // Rent
    'rent': 'cat_rent',
    'kiraya': 'cat_rent',
    'makaan': 'cat_rent',
    'house rent': 'cat_rent',
    'flat rent': 'cat_rent',
    'pg': 'cat_rent',
    'hostel': 'cat_rent',

    // Electricity
    'bijli': 'cat_electricity',
    'electricity': 'cat_electricity',
    'light bill': 'cat_electricity',
    'electric bill': 'cat_electricity',
    'power bill': 'cat_electricity',

    // Water
    'paani': 'cat_water',
    'pani': 'cat_water',
    'water': 'cat_water',
    'water bill': 'cat_water',

    // Mobile Recharge
    'recharge': 'cat_mobile_recharge',
    'mobile': 'cat_mobile_recharge',
    'airtel': 'cat_mobile_recharge',
    'jio': 'cat_mobile_recharge',
    'vi': 'cat_mobile_recharge',
    'vodafone': 'cat_mobile_recharge',
    'bsnl': 'cat_mobile_recharge',
    'sim': 'cat_mobile_recharge',
    'data pack': 'cat_mobile_recharge',

    // WiFi / Broadband
    'wifi': 'cat_wifi_broadband',
    'broadband': 'cat_wifi_broadband',
    'internet': 'cat_wifi_broadband',
    'fiber': 'cat_wifi_broadband',
    'act fibernet': 'cat_wifi_broadband',

    // School Fees
    'school': 'cat_school_fees',
    'fees': 'cat_school_fees',
    'tuition': 'cat_school_fees',
    'coaching': 'cat_school_fees',
    'classes': 'cat_school_fees',
    'college': 'cat_school_fees',
    'university': 'cat_school_fees',
    'books': 'cat_school_fees',
    'stationery': 'cat_school_fees',

    // Medical / Doctor
    'doctor': 'cat_medical',
    'hospital': 'cat_medical',
    'clinic': 'cat_medical',
    'medical': 'cat_medical',
    'checkup': 'cat_medical',
    'consultation': 'cat_medical',
    'lab test': 'cat_medical',
    'blood test': 'cat_medical',
    'xray': 'cat_medical',
    'scan': 'cat_medical',

    // Medicines
    'dawai': 'cat_medicines',
    'dawa': 'cat_medicines',
    'medicine': 'cat_medicines',
    'medicines': 'cat_medicines',
    'pharmacy': 'cat_medicines',
    'medical store': 'cat_medicines',
    'chemist': 'cat_medicines',
    'tablet': 'cat_medicines',
    'apollo pharmacy': 'cat_medicines',
    'netmeds': 'cat_medicines',
    'pharmeasy': 'cat_medicines',
    '1mg': 'cat_medicines',

    // Clothing
    'kapde': 'cat_clothing',
    'kapda': 'cat_clothing',
    'clothes': 'cat_clothing',
    'clothing': 'cat_clothing',
    'shopping': 'cat_clothing',
    'dress': 'cat_clothing',
    'shirt': 'cat_clothing',
    'jeans': 'cat_clothing',
    'saree': 'cat_clothing',
    'sari': 'cat_clothing',
    'shoes': 'cat_clothing',
    'footwear': 'cat_clothing',
    'myntra': 'cat_clothing',
    'ajio': 'cat_clothing',

    // Festival / Gifts
    'tyohaar': 'cat_festival_gifts',
    'festival': 'cat_festival_gifts',
    'gift': 'cat_festival_gifts',
    'gifts': 'cat_festival_gifts',
    'shaadi': 'cat_festival_gifts',
    'wedding': 'cat_festival_gifts',
    'diwali': 'cat_festival_gifts',
    'holi': 'cat_festival_gifts',
    'rakhi': 'cat_festival_gifts',
    'birthday': 'cat_festival_gifts',
    'anniversary': 'cat_festival_gifts',
    'celebration': 'cat_festival_gifts',

    // Puja / Donation
    'mandir': 'cat_puja_donation',
    'temple': 'cat_puja_donation',
    'puja': 'cat_puja_donation',
    'pooja': 'cat_puja_donation',
    'daan': 'cat_puja_donation',
    'donation': 'cat_puja_donation',
    'charity': 'cat_puja_donation',
    'gurudwara': 'cat_puja_donation',
    'church': 'cat_puja_donation',
    'mosque': 'cat_puja_donation',

    // Entertainment
    'movie': 'cat_entertainment',
    'cinema': 'cat_entertainment',
    'film': 'cat_entertainment',
    'netflix': 'cat_entertainment',
    'hotstar': 'cat_entertainment',
    'prime video': 'cat_entertainment',
    'spotify': 'cat_entertainment',
    'youtube premium': 'cat_entertainment',
    'concert': 'cat_entertainment',
    'game': 'cat_entertainment',
    'gaming': 'cat_entertainment',
    'subscription': 'cat_entertainment',

    // Online Shopping
    'amazon': 'cat_online_shopping',
    'flipkart': 'cat_online_shopping',
    'online': 'cat_online_shopping',
    'meesho': 'cat_online_shopping',
    'snapdeal': 'cat_online_shopping',
    'order': 'cat_online_shopping',

    // EMI / Loan
    'emi': 'cat_emi_loan',
    'loan': 'cat_emi_loan',
    'kist': 'cat_emi_loan',
    'installment': 'cat_emi_loan',
    'credit card bill': 'cat_emi_loan',
    'home loan': 'cat_emi_loan',
    'car loan': 'cat_emi_loan',
    'personal loan': 'cat_emi_loan',

    // Insurance
    'bima': 'cat_insurance',
    'insurance': 'cat_insurance',
    'lic': 'cat_insurance',
    'premium': 'cat_insurance',
    'health insurance': 'cat_insurance',
    'car insurance': 'cat_insurance',
    'term plan': 'cat_insurance',

    // Mutual Fund / SIP
    'sip': 'cat_mutual_fund_sip',
    'mutual fund': 'cat_mutual_fund_sip',
    'invest': 'cat_mutual_fund_sip',
    'investment': 'cat_mutual_fund_sip',
    'groww': 'cat_mutual_fund_sip',
    'zerodha': 'cat_mutual_fund_sip',
    'stock': 'cat_mutual_fund_sip',
    'shares': 'cat_mutual_fund_sip',
    'nifty': 'cat_mutual_fund_sip',
    'demat': 'cat_mutual_fund_sip',

    // Gold / Jewellery
    'sona': 'cat_gold_jewellery',
    'gold': 'cat_gold_jewellery',
    'jewellery': 'cat_gold_jewellery',
    'jewelry': 'cat_gold_jewellery',
    'chandi': 'cat_gold_jewellery',
    'silver': 'cat_gold_jewellery',
    'tanishq': 'cat_gold_jewellery',

    // Domestic Help
    'kaamwali': 'cat_domestic_help',
    'kamwali': 'cat_domestic_help',
    'maid': 'cat_domestic_help',
    'bai': 'cat_domestic_help',
    'domestic help': 'cat_domestic_help',
    'servant': 'cat_domestic_help',
    'cook': 'cat_domestic_help',
    'driver': 'cat_domestic_help',
    'watchman': 'cat_domestic_help',
    'guard': 'cat_domestic_help',

    // LPG Gas
    'gas': 'cat_lpg_gas',
    'lpg': 'cat_lpg_gas',
    'cylinder': 'cat_lpg_gas',
    'indane': 'cat_lpg_gas',
    'bharat gas': 'cat_lpg_gas',
    'hp gas': 'cat_lpg_gas',

    // Vegetables / Fruit
    'vegetables': 'cat_vegetables_fruit',
    'vegetable': 'cat_vegetables_fruit',
    'fruit': 'cat_vegetables_fruit',
    'fruits': 'cat_vegetables_fruit',
    'phal': 'cat_vegetables_fruit',
    'fal': 'cat_vegetables_fruit',

    // Dairy / Milk
    'doodh': 'cat_dairy_milk',
    'dudh': 'cat_dairy_milk',
    'milk': 'cat_dairy_milk',
    'dairy': 'cat_dairy_milk',
    'curd': 'cat_dairy_milk',
    'dahi': 'cat_dairy_milk',
    'paneer': 'cat_dairy_milk',
    'amul': 'cat_dairy_milk',
    'mother dairy': 'cat_dairy_milk',

    // Salon / Beauty
    'salon': 'cat_salon_beauty',
    'parlour': 'cat_salon_beauty',
    'parlor': 'cat_salon_beauty',
    'haircut': 'cat_salon_beauty',
    'beauty': 'cat_salon_beauty',
    'facial': 'cat_salon_beauty',
    'spa': 'cat_salon_beauty',
    'nails': 'cat_salon_beauty',
    'barber': 'cat_salon_beauty',

    // Gym
    'gym': 'cat_gym',
    'fitness': 'cat_gym',
    'yoga': 'cat_gym',
    'exercise': 'cat_gym',
    'cult fit': 'cat_gym',

    // Income categories
    'salary': 'cat_salary',
    'tankhwah': 'cat_salary',
    'naukri': 'cat_salary',
    'freelance': 'cat_freelance',
    'freelancing': 'cat_freelance',
    'business': 'cat_business',
    'karobar': 'cat_business',
    'dukaan': 'cat_business',
    'interest': 'cat_interest',
    'byaaj': 'cat_interest',
    'dividend': 'cat_dividend',
    'rental income': 'cat_rental_income',
    'cashback': 'cat_cashback',
    'reward': 'cat_cashback',
    'rewards': 'cat_cashback',
    'gift money': 'cat_gift_money',
    'shagun': 'cat_gift_money',
  };

  /// Category ID → display name mapping
  static final Map<String, String> _categoryNames = {
    for (final cat in CategoryConstants.defaultExpenseCategories)
      cat.id: cat.name,
    for (final cat in CategoryConstants.defaultIncomeCategories)
      cat.id: cat.name,
  };

  /// Amount extraction patterns
  static final List<RegExp> _amountPatterns = [
    // ₹450, Rs.450, Rs 450, rs450
    RegExp(r'[₹]\s*(\d+[,\d]*\.?\d*)', caseSensitive: false),
    RegExp(r'(?:rs\.?|rupees?|rupaye?|rupaiya)\s*(\d+[,\d]*\.?\d*)',
        caseSensitive: false),
    // 450 rupees, 450 rs, 450₹
    RegExp(r'(\d+[,\d]*\.?\d*)\s*(?:₹|rs\.?|rupees?|rupaye?|rupaiya)',
        caseSensitive: false),
    // Standalone number (fallback, lower confidence)
    RegExp(r'\b(\d+[,\d]*\.?\d+)\b'),
    RegExp(r'\b(\d{2,})\b'), // At least 2 digits for standalone numbers
  ];

  /// Date keywords (Hindi + English)
  static final Map<String, int> _dateOffsets = {
    'aaj': 0,
    'today': 0,
    'abhi': 0,
    'kal': -1, // Default to yesterday for expenses
    'yesterday': -1,
    'parso': -2,
    'parson': -2,
    'day before yesterday': -2,
    'day before': -2,
    'last week': -7,
    'pichhle hafte': -7,
  };

  /// Parse natural language text into a structured ParsedExpense.
  ParsedExpense parse(String text) {
    final normalizedText = text.toLowerCase().trim();

    final amount = _extractAmount(normalizedText);
    final categoryResult = _matchCategory(normalizedText);
    final date = _extractDate(normalizedText);
    final note = _extractNote(normalizedText, amount, categoryResult?.key);

    final confidence = _calculateConfidence(amount, categoryResult, date);

    return ParsedExpense(
      amount: amount,
      currency: 'INR',
      categoryId: categoryResult?.value,
      categoryName: categoryResult != null
          ? _categoryNames[categoryResult.value]
          : null,
      accountId: null,
      note: note,
      date: date,
      source: 'text',
      confidence: confidence,
      rawText: text,
    );
  }

  /// Extract monetary amount from text.
  double? _extractAmount(String text) {
    for (final pattern in _amountPatterns) {
      final match = pattern.firstMatch(text);
      if (match != null) {
        final amountStr = match.group(1)!.replaceAll(',', '');
        final amount = double.tryParse(amountStr);
        if (amount != null && amount > 0 && amount < 10000000) {
          return amount;
        }
      }
    }
    return null;
  }

  /// Match text against category keywords using exact and fuzzy matching.
  MapEntry<String, String>? _matchCategory(String text) {
    // First pass: exact multi-word keyword match (longer keywords first)
    final sortedKeywords = _keywordToCategory.keys.toList()
      ..sort((a, b) => b.length.compareTo(a.length));

    for (final keyword in sortedKeywords) {
      if (text.contains(keyword)) {
        return MapEntry(keyword, _keywordToCategory[keyword]!);
      }
    }

    // Second pass: fuzzy match individual words
    final words = text.split(RegExp(r'\s+'));
    for (final word in words) {
      if (word.length < 3) continue;
      for (final entry in _keywordToCategory.entries) {
        if (entry.key.length < 3) continue;
        if (_levenshteinDistance(word, entry.key) <= 1) {
          return MapEntry(entry.key, entry.value);
        }
      }
    }

    return null;
  }

  /// Extract date from text using Hindi/English keywords.
  DateTime? _extractDate(String text) {
    // Check keyword-based dates
    for (final entry in _dateOffsets.entries) {
      if (text.contains(entry.key)) {
        return DateTime.now().add(Duration(days: entry.value));
      }
    }

    // Check explicit date patterns (dd/mm/yyyy, dd-mm-yyyy)
    final datePatterns = [
      RegExp(r'(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})'),
      RegExp(
          r'(\d{1,2})\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})',
          caseSensitive: false),
    ];

    for (final pattern in datePatterns) {
      final match = pattern.firstMatch(text);
      if (match != null) {
        try {
          final day = int.parse(match.group(1)!);
          final month = int.parse(match.group(2)!);
          var year = int.parse(match.group(3)!);
          if (year < 100) year += 2000;
          final date = DateTime(year, month, day);
          if (date.isBefore(DateTime.now().add(const Duration(days: 1)))) {
            return date;
          }
        } catch (_) {
          // Invalid date, continue
        }
      }
    }

    // Default to today if no date found
    return DateTime.now();
  }

  /// Extract remaining text as note after removing amount and category keywords.
  String _extractNote(String text, double? amount, String? matchedKeyword) {
    var note = text;

    // Remove amount patterns
    if (amount != null) {
      for (final pattern in _amountPatterns) {
        note = note.replaceFirst(pattern, ' ');
      }
    }

    // Remove date keywords
    for (final keyword in _dateOffsets.keys) {
      note = note.replaceAll(keyword, ' ');
    }

    // Remove common filler words
    final fillerWords = [
      'spent',
      'paid',
      'gave',
      'for',
      'on',
      'in',
      'at',
      'the',
      'a',
      'an',
      'mein',
      'pe',
      'ko',
      'ka',
      'ki',
      'ke',
      'se',
      'ne',
      'par',
      'diya',
      'diye',
      'lage',
      'laga',
      'kharch',
      'kharcha',
      'kharche',
    ];

    final words = note.split(RegExp(r'\s+'));
    final filteredWords =
        words.where((w) => w.isNotEmpty && !fillerWords.contains(w)).toList();

    return filteredWords.join(' ').trim();
  }

  /// Calculate confidence score based on what was extracted.
  double _calculateConfidence(
    double? amount,
    MapEntry<String, String>? category,
    DateTime? date,
  ) {
    var score = 0.0;
    if (amount != null) score += 0.4;
    if (category != null) score += 0.4;
    if (date != null) score += 0.2;
    return score;
  }

  /// Levenshtein distance for fuzzy matching.
  int _levenshteinDistance(String a, String b) {
    if (a == b) return 0;
    if (a.isEmpty) return b.length;
    if (b.isEmpty) return a.length;

    final matrix = List.generate(
      a.length + 1,
      (i) => List.generate(b.length + 1, (j) => 0),
    );

    for (var i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }
    for (var j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (var i = 1; i <= a.length; i++) {
      for (var j = 1; j <= b.length; j++) {
        final cost = a[i - 1] == b[j - 1] ? 0 : 1;
        matrix[i][j] = [
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        ].reduce((a, b) => a < b ? a : b);
      }
    }

    return matrix[a.length][b.length];
  }
}
