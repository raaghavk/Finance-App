import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/errors/failure.dart';
import 'package:paisa_track/core/utils/result.dart';

void main() {
  group('Result.success', () {
    test('isSuccess returns true', () {
      final result = Result.success(42);
      expect(result.isSuccess, isTrue);
    });

    test('isError returns false', () {
      final result = Result.success(42);
      expect(result.isError, isFalse);
    });

    test('dataOrNull returns the data', () {
      final result = Result.success(42);
      expect(result.dataOrNull, 42);
    });

    test('failureOrNull returns null', () {
      final result = Result.success(42);
      expect(result.failureOrNull, isNull);
    });

    test('toString shows Success(value)', () {
      final result = Result.success(42);
      expect(result.toString(), 'Success(42)');
    });

    test('two Success with same data are equal', () {
      expect(Result.success(42), equals(Result.success(42)));
    });

    test('two Success with different data are not equal', () {
      expect(Result.success(42), isNot(equals(Result.success(99))));
    });
  });

  group('Result.error', () {
    test('isSuccess returns false', () {
      final result = Result<int>.error(const DatabaseFailure());
      expect(result.isSuccess, isFalse);
    });

    test('isError returns true', () {
      final result = Result<int>.error(const DatabaseFailure());
      expect(result.isError, isTrue);
    });

    test('dataOrNull returns null', () {
      final result = Result<int>.error(const DatabaseFailure());
      expect(result.dataOrNull, isNull);
    });

    test('failureOrNull returns the failure', () {
      const failure = DatabaseFailure();
      final result = Result<int>.error(failure);
      expect(result.failureOrNull, failure);
    });

    test('toString shows Error(failure)', () {
      final result = Result<int>.error(const DatabaseFailure());
      expect(result.toString(), contains('Error'));
      expect(result.toString(), contains('DatabaseFailure'));
    });

    test('two Error with same failure are equal', () {
      expect(
        Result<int>.error(const DatabaseFailure()),
        equals(Result<int>.error(const DatabaseFailure())),
      );
    });
  });

  group('when', () {
    test('calls success callback for Success', () {
      final result = Result.success(42);
      final value = result.when(
        success: (data) => 'got $data',
        error: (failure) => 'failed',
      );
      expect(value, 'got 42');
    });

    test('calls error callback for Error', () {
      final result = Result<int>.error(const NetworkFailure());
      final value = result.when(
        success: (data) => 'got $data',
        error: (failure) => 'failed: ${failure.message}',
      );
      expect(value, contains('failed'));
    });
  });

  group('fold', () {
    test('is an alias for when — success case', () {
      final result = Result.success(42);
      final value = result.fold(
        onSuccess: (data) => data * 2,
        onError: (failure) => -1,
      );
      expect(value, 84);
    });

    test('is an alias for when — error case', () {
      final result = Result<int>.error(const ParseFailure());
      final value = result.fold(
        onSuccess: (data) => data * 2,
        onError: (failure) => -1,
      );
      expect(value, -1);
    });
  });

  group('map', () {
    test('transforms Success value', () {
      final result = Result.success(42);
      final mapped = result.map((data) => data.toString());
      expect(mapped.dataOrNull, '42');
    });

    test('passes Error through unchanged', () {
      const failure = DatabaseFailure();
      final result = Result<int>.error(failure);
      final mapped = result.map((data) => data.toString());
      expect(mapped.isError, isTrue);
      expect(mapped.failureOrNull, failure);
    });
  });

  group('flatMap', () {
    test('chains Success into another Success', () {
      final result = Result.success(42);
      final chained = result.flatMap((data) => Result.success(data * 2));
      expect(chained.dataOrNull, 84);
    });

    test('chains Success into Error', () {
      final result = Result.success(42);
      final chained = result.flatMap<int>(
        (data) => Result.error(const NetworkFailure()),
      );
      expect(chained.isError, isTrue);
    });

    test('passes original Error through unchanged', () {
      const failure = DatabaseFailure();
      final result = Result<int>.error(failure);
      final chained = result.flatMap((data) => Result.success(data * 2));
      expect(chained.failureOrNull, failure);
    });
  });
}
