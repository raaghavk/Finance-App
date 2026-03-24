import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/errors/failure.dart';

void main() {
  group('Failure', () {
    test('DatabaseFailure has default message', () {
      const failure = DatabaseFailure();
      expect(failure.message, 'Database operation failed.');
    });

    test('NetworkFailure has default message', () {
      const failure = NetworkFailure();
      expect(failure.message, 'Network request failed.');
    });

    test('ParseFailure with custom message preserves it', () {
      const failure = ParseFailure('Custom parse error');
      expect(failure.message, 'Custom parse error');
    });

    test('FeatureLimitFailure has default message', () {
      const failure = FeatureLimitFailure();
      expect(failure.message, contains('Feature limit'));
    });

    test('PremiumRequiredFailure has default message', () {
      const failure = PremiumRequiredFailure();
      expect(failure.message, contains('premium'));
    });

    test('UnexpectedFailure has default message', () {
      const failure = UnexpectedFailure();
      expect(failure.message, contains('unexpected'));
    });

    test('when pattern matches correctly for each subtype', () {
      const failures = <Failure>[
        DatabaseFailure(),
        NetworkFailure(),
        ParseFailure(),
        FeatureLimitFailure(),
        PremiumRequiredFailure(),
        UnexpectedFailure(),
      ];

      final types = failures.map((f) => f.when(
            database: (_) => 'database',
            network: (_) => 'network',
            parse: (_) => 'parse',
            featureLimit: (_) => 'featureLimit',
            premiumRequired: (_) => 'premiumRequired',
            unexpected: (_) => 'unexpected',
          ));

      expect(types.toList(), [
        'database',
        'network',
        'parse',
        'featureLimit',
        'premiumRequired',
        'unexpected',
      ]);
    });

    test('toString includes runtimeType and message', () {
      const failure = DatabaseFailure();
      expect(failure.toString(), 'DatabaseFailure: Database operation failed.');
    });
  });
}
