/// How a transaction was entered into the app.
enum InputSource {
  /// Manually typed by the user.
  manual,

  /// Entered via voice input.
  voice,

  /// Entered via chat / AI text input.
  chat,

  /// Scanned from a receipt image.
  ocr,

  /// Detected from an SMS notification.
  sms,
}
