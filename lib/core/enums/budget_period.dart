/// The recurring time period a budget covers.
enum BudgetPeriod {
  /// Budget resets every week.
  weekly,

  /// Budget resets every month.
  monthly,

  /// Budget resets every year.
  yearly,

  /// Budget covers a custom date range.
  custom,
}
