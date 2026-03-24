/// Language selection settings screen.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:paisa_track/features/settings/providers/settings_provider.dart';

/// Supported language options.
class _LanguageOption {
  const _LanguageOption({
    required this.code,
    required this.name,
    required this.nativeName,
    required this.icon,
  });

  final String code;
  final String name;
  final String nativeName;
  final String icon;
}

const _languages = [
  _LanguageOption(
    code: 'en',
    name: 'English',
    nativeName: 'English',
    icon: '🇬🇧',
  ),
  _LanguageOption(
    code: 'hi',
    name: 'Hindi',
    nativeName: '\u0939\u093F\u0928\u094D\u0926\u0940',
    icon: '🇮🇳',
  ),
];

/// Allows the user to choose the app interface language.
class LanguageSettingsScreen extends ConsumerWidget {
  const LanguageSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(userSettingsProvider);
    final currentLocale = settings.locale;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Language')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'App interface will change to selected language',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            ...List.generate(_languages.length, (index) {
              final lang = _languages[index];
              final isSelected = lang.code == currentLocale;

              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: RadioListTile<String>(
                  value: lang.code,
                  groupValue: currentLocale,
                  onChanged: (value) {
                    if (value != null) {
                      ref
                          .read(settingsNotifierProvider.notifier)
                          .updateLocale(value);
                    }
                  },
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.outlineVariant,
                      width: isSelected ? 2 : 1,
                    ),
                  ),
                  title: Row(
                    children: [
                      Text(lang.icon, style: const TextStyle(fontSize: 24)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang.nativeName,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          ),
                          if (lang.name != lang.nativeName)
                            Text(
                              lang.name,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                  selected: isSelected,
                  activeColor: theme.colorScheme.primary,
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
