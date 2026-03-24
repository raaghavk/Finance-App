/// Failure types used by the Result pattern in the domain layer.
///
/// Each [Failure] subclass corresponds to a category of error that the
/// UI layer can react to (show a snackbar, navigate to upgrade screen,
/// etc.).
library;

/// Sealed base class representing a handled domain-layer failure.
///
/// Use the [when] method for exhaustive pattern matching.
sealed class Failure {
  const Failure(this.message);

  /// Human-readable failure description suitable for logging or display.
  final String message;

  /// Exhaustive pattern-match over all failure subtypes.
  T when<T>({
    required T Function(DatabaseFailure) database,
    required T Function(NetworkFailure) network,
    required T Function(ParseFailure) parse,
    required T Function(FeatureLimitFailure) featureLimit,
    required T Function(PremiumRequiredFailure) premiumRequired,
    required T Function(UnexpectedFailure) unexpected,
  }) {
    return switch (this) {
      final DatabaseFailure f => database(f),
      final NetworkFailure f => network(f),
      final ParseFailure f => parse(f),
      final FeatureLimitFailure f => featureLimit(f),
      final PremiumRequiredFailure f => premiumRequired(f),
      final UnexpectedFailure f => unexpected(f),
    };
  }

  @override
  String toString() => '$runtimeType: $message';
}

/// A local database operation failed.
class DatabaseFailure extends Failure {
  const DatabaseFailure([super.message = 'Database operation failed.']);
}

/// A network operation failed.
class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Network request failed.']);
}

/// Data parsing or deserialisation failed.
class ParseFailure extends Failure {
  const ParseFailure([super.message = 'Failed to parse data.']);
}

/// A free-tier usage limit has been reached.
class FeatureLimitFailure extends Failure {
  const FeatureLimitFailure([
    super.message = 'Feature limit reached. Upgrade to premium.',
  ]);
}

/// The requested feature requires a premium subscription.
class PremiumRequiredFailure extends Failure {
  const PremiumRequiredFailure([
    super.message = 'This feature requires a premium subscription.',
  ]);
}

/// An unexpected / uncategorised error.
class UnexpectedFailure extends Failure {
  const UnexpectedFailure([super.message = 'An unexpected error occurred.']);
}
