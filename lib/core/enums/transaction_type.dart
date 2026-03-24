/// The type of a financial transaction.
library;

/// Classifies a transaction as income, expense, or a transfer between
/// accounts.
enum TransactionType {
  /// Money received (e.g. salary, freelance income).
  income('Income', 'आय'),

  /// Money spent (e.g. groceries, rent).
  expense('Expense', 'खर्च'),

  /// Money moved between the user's own accounts.
  transfer('Transfer', 'ट्रांसफर');

  const TransactionType(this.label, this.labelHi);

  /// English display label.
  final String label;

  /// Hindi display label.
  final String labelHi;

  /// Returns the [TransactionType] matching the given [name], or `null`.
  static TransactionType? tryFromName(String name) {
    final lower = name.toLowerCase();
    for (final type in values) {
      if (type.name == lower) return type;
    }
    return null;
  }
}
