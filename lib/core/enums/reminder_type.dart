/// Types of reminders the app can generate.
library;

/// Classifies the reason behind a scheduled reminder or notification.
enum ReminderType {
  /// A bill or recurring payment is due soon.
  billDue('Bill Due', 'बिल देय'),

  /// The user has exceeded or is close to exceeding a budget.
  overspendAlert('Overspend Alert', 'अधिक खर्च अलर्ट'),

  /// An account balance has fallen below a user-defined threshold.
  lowBalance('Low Balance', 'कम बैलेंस'),

  /// A user-created custom reminder.
  custom('Custom', 'कस्टम');

  const ReminderType(this.label, this.labelHi);

  /// English display label.
  final String label;

  /// Hindi display label.
  final String labelHi;
}
