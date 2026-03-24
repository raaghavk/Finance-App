/// Convenience extensions on [String].
library;

extension StringExtensions on String {
  /// Capitalises the first character of the string.
  ///
  /// Returns the original string unchanged if it is empty.
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Truncates the string to [maxLength] characters and appends an
  /// ellipsis (`…`) if it exceeds that length.
  ///
  /// If [maxLength] is greater than or equal to the string length the
  /// original string is returned as-is.
  String truncate(int maxLength) {
    assert(maxLength > 0, 'maxLength must be positive');
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}…';
  }

  /// Converts the string to Title Case (first letter of each word
  /// capitalised, remaining letters lower-cased).
  String toTitleCase() {
    if (isEmpty) return this;
    return split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .map((word) => '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}')
        .join(' ');
  }
}
