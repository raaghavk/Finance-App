import 'package:drift/drift.dart';
import 'package:paisa_track/data/local/database/app_database.dart';
import 'package:paisa_track/data/local/database/tables/settings_table.dart';

part 'settings_dao.g.dart';

@DriftAccessor(tables: [SettingsTable])
class SettingsDao extends DatabaseAccessor<AppDatabase>
    with _$SettingsDaoMixin {
  SettingsDao(super.db);

  /// Read a setting value by [key]. Returns `null` if not set.
  Future<String?> getSetting(String key) async {
    final row = await (select(settingsTable)
          ..where((s) => s.key.equals(key)))
        .getSingleOrNull();
    return row?.value;
  }

  /// Insert or update a setting.
  Future<void> setSetting(String key, String value) {
    return into(settingsTable).insertOnConflictUpdate(
      SettingsTableCompanion(
        key: Value(key),
        value: Value(value),
      ),
    );
  }

  /// Watch a single setting value reactively.
  Stream<String?> watchSetting(String key) {
    return (select(settingsTable)
          ..where((s) => s.key.equals(key)))
        .watchSingleOrNull()
        .map((row) => row?.value);
  }
}
