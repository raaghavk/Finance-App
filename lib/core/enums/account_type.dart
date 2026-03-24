/// The kind of financial account.
enum AccountType {
  /// Physical cash / wallet.
  cash,

  /// Bank savings account.
  savings,

  /// Bank current / checking account.
  current,

  /// Credit card account.
  creditCard,

  /// Digital wallet (Paytm, PhonePe, Google Pay, etc.).
  wallet,

  /// Other / user-defined account type.
  other,
}
