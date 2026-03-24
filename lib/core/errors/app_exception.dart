/// Application-specific exception hierarchy.
///
/// All exceptions thrown within the app's domain layer extend
/// [AppException] so they can be caught and mapped to [Failure] objects
/// in the repository layer.
library;

/// Base exception for all application errors.
class AppException implements Exception {
  const AppException([this.message = 'An unexpected error occurred.', this.cause]);

  /// Human-readable error description.
  final String message;

  /// The original error or exception that caused this, if any.
  final Object? cause;

  @override
  String toString() => '$runtimeType: $message';
}

/// Thrown when a local database operation fails.
class DatabaseException extends AppException {
  const DatabaseException([super.message = 'Database operation failed.', super.cause]);
}

/// Thrown when a network request fails (timeout, no connectivity, etc.).
class NetworkException extends AppException {
  const NetworkException([super.message = 'Network request failed.', super.cause]);
}

/// Thrown when data parsing or deserialisation fails.
class ParseException extends AppException {
  const ParseException([super.message = 'Failed to parse data.', super.cause]);
}

/// Thrown when a free-tier usage limit has been reached.
class FeatureLimitException extends AppException {
  const FeatureLimitException([
    super.message = 'Feature limit reached. Upgrade to premium for unlimited access.',
    super.cause,
  ]);

  /// Creates a [FeatureLimitException] for a named feature and its limit.
  factory FeatureLimitException.forFeature(String feature, int limit) =>
      FeatureLimitException(
        '$feature limit of $limit reached. Upgrade to premium for unlimited access.',
      );
}

/// Thrown when a feature requires a premium subscription.
class PremiumRequiredException extends AppException {
  const PremiumRequiredException([
    super.message = 'This feature requires a premium subscription.',
    super.cause,
  ]);
}

/// Thrown when an authentication or authorisation error occurs.
class AuthException extends AppException {
  const AuthException([super.message = 'Authentication failed.', super.cause]);
}
