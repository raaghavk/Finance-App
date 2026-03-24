import 'package:flutter_test/flutter_test.dart';
import 'package:paisa_track/core/extensions/string_extensions.dart';

void main() {
  group('capitalize', () {
    test('capitalizes first letter of lowercase string', () {
      expect('hello'.capitalize(), 'Hello');
    });

    test('returns empty string unchanged', () {
      expect(''.capitalize(), '');
    });

    test('single character string', () {
      expect('h'.capitalize(), 'H');
    });

    test('already capitalized string is unchanged', () {
      expect('Hello'.capitalize(), 'Hello');
    });

    test('preserves rest of string', () {
      expect('hELLO'.capitalize(), 'HELLO');
    });
  });

  group('truncate', () {
    test('string shorter than maxLength returned as-is', () {
      expect('hi'.truncate(5), 'hi');
    });

    test('string exactly at maxLength returned as-is', () {
      expect('hello'.truncate(5), 'hello');
    });

    test('string longer than maxLength is truncated with ellipsis', () {
      expect('hello world'.truncate(5), 'hello…');
    });

    test('truncate to 1 character', () {
      expect('hello'.truncate(1), 'h…');
    });
  });

  group('toTitleCase', () {
    test('"hello world" becomes "Hello World"', () {
      expect('hello world'.toTitleCase(), 'Hello World');
    });

    test('empty string returns empty', () {
      expect(''.toTitleCase(), '');
    });

    test('single word gets capitalized', () {
      expect('hello'.toTitleCase(), 'Hello');
    });

    test('mixed case is normalized', () {
      expect('hELLO wORLD'.toTitleCase(), 'Hello World');
    });
  });
}
