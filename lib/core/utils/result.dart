/// A functional Result type for error handling without exceptions.
///
/// Wraps either a [Success] value or an [Error] containing a [Failure],
/// enabling railway-oriented programming in the domain layer.
library;

import 'package:paisa_track/core/errors/failure.dart';

/// Sealed result type that is either [Success] or [Error].
sealed class Result<T> {
  const Result._();

  /// Creates a successful result wrapping [data].
  const factory Result.success(T data) = Success<T>;

  /// Creates an error result wrapping [failure].
  const factory Result.error(Failure failure) = Error<T>;

  /// Whether this result is a [Success].
  bool get isSuccess => this is Success<T>;

  /// Whether this result is an [Error].
  bool get isError => this is Error<T>;

  /// Pattern-matches on the result, calling [success] or [error]
  /// depending on the variant and returning the value produced.
  R when<R>({
    required R Function(T data) success,
    required R Function(Failure failure) error,
  }) {
    return switch (this) {
      Success<T>(:final data) => success(data),
      Error<T>(:final failure) => error(failure),
    };
  }

  /// Alias for [when] using fold-style naming.
  R fold<R>({
    required R Function(T data) onSuccess,
    required R Function(Failure failure) onError,
  }) {
    return when(success: onSuccess, error: onError);
  }

  /// Returns the success data or `null` if this is an [Error].
  T? get dataOrNull => switch (this) {
        Success<T>(:final data) => data,
        Error<T>() => null,
      };

  /// Returns the failure or `null` if this is a [Success].
  Failure? get failureOrNull => switch (this) {
        Success<T>() => null,
        Error<T>(:final failure) => failure,
      };

  /// Transforms the success value using [transform], passing errors through.
  Result<R> map<R>(R Function(T data) transform) {
    return switch (this) {
      Success<T>(:final data) => Result.success(transform(data)),
      Error<T>(:final failure) => Result.error(failure),
    };
  }

  /// Chains another Result-returning operation on success.
  Result<R> flatMap<R>(Result<R> Function(T data) transform) {
    return switch (this) {
      Success<T>(:final data) => transform(data),
      Error<T>(:final failure) => Result.error(failure),
    };
  }
}

/// A successful result containing [data].
class Success<T> extends Result<T> {
  const Success(this.data) : super._();

  /// The success value.
  final T data;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Success<T> && runtimeType == other.runtimeType && data == other.data;

  @override
  int get hashCode => data.hashCode;

  @override
  String toString() => 'Success($data)';
}

/// An error result containing a [failure].
class Error<T> extends Result<T> {
  const Error(this.failure) : super._();

  /// The failure describing what went wrong.
  final Failure failure;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Error<T> &&
          runtimeType == other.runtimeType &&
          failure == other.failure;

  @override
  int get hashCode => failure.hashCode;

  @override
  String toString() => 'Error($failure)';
}
