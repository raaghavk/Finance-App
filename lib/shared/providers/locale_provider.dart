/// Manages the current application locale and persists the choice.
library;

import 'dart:ui';

import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'locale_provider.g.dart';

/// Notifier that holds and updates the current [Locale].
///
/// The default locale is English (`en`). Changes are persisted to the
/// settings database so the choice survives app restarts.
@riverpod
class LocaleNotifier extends _$LocaleNotifier {
  @override
  Locale build() {
    // TODO: Read persisted locale from settings DB on first build.
    return const Locale('en');
  }

  /// Replaces the current locale with [locale].
  void setLocale(Locale locale) {
    state = locale;
    _persist(locale);
  }

  /// Toggles between English and Hindi.
  void toggleLocale() {
    final next = state.languageCode == 'en'
        ? const Locale('hi')
        : const Locale('en');
    state = next;
    _persist(next);
  }

  /// Persists the selected locale's language code to the settings DB.
  void _persist(Locale locale) {
    // TODO: Write locale.languageCode to settings database.
    // e.g. ref.read(settingsRepositoryProvider).setLocale(locale.languageCode);
  }
}
