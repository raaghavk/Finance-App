/// How a budget's spending limits are determined.
library;

/// Determines whether budget limits are set manually by the user or
/// suggested by the AI engine based on spending patterns.
enum BudgetMode {
  /// The user defines all budget limits manually.
  manual('Manual', 'मैनुअल'),

  /// The AI engine analyses past spending and suggests limits.
  aiAssisted('AI Assisted', 'एआई सहायित');

  const BudgetMode(this.label, this.labelHi);

  /// English display label.
  final String label;

  /// Hindi display label.
  final String labelHi;
}
