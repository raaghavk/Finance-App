import 'package:paisa_track/domain/models/budget.dart';
import 'package:paisa_track/domain/models/transaction.dart' as domain;
import 'package:paisa_track/core/enums/transaction_type.dart';

/// Analyzes spending patterns and suggests budgets.
/// Premium feature: uses 3+ months of transaction history.
class BudgetAnalysisService {
  /// Analyze transactions and suggest budgets per category.
  ///
  /// Strategy: calculate average monthly spending per category over the
  /// provided period, then add a 10% buffer for the suggested limit.
  List<BudgetSuggestion> suggestBudgets(
    List<domain.Transaction> transactions, {
    int minimumTransactions = 3,
    double bufferPercentage = 0.10,
  }) {
    // Filter to expenses only
    final expenses = transactions
        .where((t) => t.type == TransactionType.expense && !t.isDeleted)
        .toList();

    if (expenses.isEmpty) return [];

    // Group by category
    final Map<String, List<domain.Transaction>> byCategory = {};
    for (final tx in expenses) {
      byCategory.putIfAbsent(tx.categoryId, () => []).add(tx);
    }

    // Calculate date range
    final dates = expenses.map((t) => t.transactionDate).toList()..sort();
    final earliest = dates.first;
    final latest = dates.last;
    final monthSpan = _monthsBetween(earliest, latest).clamp(1, 12);

    final suggestions = <BudgetSuggestion>[];

    for (final entry in byCategory.entries) {
      final categoryTransactions = entry.value;

      // Skip categories with too few transactions
      if (categoryTransactions.length < minimumTransactions) continue;

      final totalSpent =
          categoryTransactions.fold(0.0, (sum, tx) => sum + tx.amount);
      final monthlyAverage = totalSpent / monthSpan;

      // Suggest limit = average + buffer
      final suggestedLimit = monthlyAverage * (1 + bufferPercentage);

      // Round to nearest 100 for clean numbers
      final roundedLimit = (suggestedLimit / 100).ceil() * 100.0;

      // Calculate monthly breakdown
      final monthlySpending = _getMonthlySpending(categoryTransactions);

      suggestions.add(BudgetSuggestion(
        categoryId: entry.key,
        monthlyAverage: monthlyAverage,
        suggestedLimit: roundedLimit,
        totalSpent: totalSpent,
        transactionCount: categoryTransactions.length,
        monthSpan: monthSpan,
        monthlySpending: monthlySpending,
      ));
    }

    // Sort by monthly average descending (highest spending first)
    suggestions.sort((a, b) => b.monthlyAverage.compareTo(a.monthlyAverage));

    return suggestions;
  }

  /// Convert suggestions to Budget domain objects.
  List<Budget> suggestionsTobudgets(List<BudgetSuggestion> suggestions) {
    return suggestions.map((s) {
      return Budget(
        id: '', // Will be assigned on creation
        name: '${s.categoryId} Budget',
        limitAmount: s.suggestedLimit,
        period: 'monthly',
        startDate: DateTime(DateTime.now().year, DateTime.now().month, 1),
        endDate: null,
        mode: 'ai_assisted',
        isActive: true,
        categoryIds: [s.categoryId],
        syncStatus: null,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        isDeleted: false,
      );
    }).toList();
  }

  int _monthsBetween(DateTime from, DateTime to) {
    return (to.year - from.year) * 12 + to.month - from.month + 1;
  }

  Map<String, double> _getMonthlySpending(
      List<domain.Transaction> transactions) {
    final Map<String, double> monthly = {};
    for (final tx in transactions) {
      final key =
          '${tx.transactionDate.year}-${tx.transactionDate.month.toString().padLeft(2, '0')}';
      monthly[key] = (monthly[key] ?? 0) + tx.amount;
    }
    return monthly;
  }
}

/// Represents a budget suggestion from the analysis engine.
class BudgetSuggestion {
  final String categoryId;
  final double monthlyAverage;
  final double suggestedLimit;
  final double totalSpent;
  final int transactionCount;
  final int monthSpan;
  final Map<String, double> monthlySpending;

  const BudgetSuggestion({
    required this.categoryId,
    required this.monthlyAverage,
    required this.suggestedLimit,
    required this.totalSpent,
    required this.transactionCount,
    required this.monthSpan,
    required this.monthlySpending,
  });

  /// Percentage of suggested limit that average spending represents.
  double get utilizationRate => monthlyAverage / suggestedLimit;
}
