import 'package:paisa_track/domain/models/user_settings.dart';

/// Contract for app settings / key-value storage.
abstract class SettingsRepository {
  /// Get a single setting value by [key]. Returns null if not set.
  Future<String?> get(String key);

  /// Set a single setting [key] to [value].
  Future<void> set(String key, String value);

  /// Stream updates for a specific setting [key].
  Stream<String?> watch(String key);

  /// Get the complete user settings object.
  Future<UserSettings> getUserSettings();

  /// Persist updated user settings.
  Future<void> updateUserSettings(UserSettings settings);
}
