/// Currency selection screen for the primary app currency.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:paisa_track/core/constants/currency_constants.dart';
import 'package:paisa_track/features/settings/providers/settings_provider.dart';

/// Allows the user to choose their primary currency from the supported list.
class CurrencySettingsScreen extends ConsumerWidget {
  const CurrencySettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentCode = ref.watch(currentCurrencyProvider);
    final currencies = CurrencyConstants.supportedCurrencies;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Currency')),
      body: ListView.builder(
        itemCount: currencies.length,
        itemBuilder: (context, index) {
          final currency = currencies[index];
          final isSelected = currency.code == currentCode;

          return RadioListTile<String>(
            value: currency.code,
            groupValue: currentCode,
            onChanged: (value) {
              if (value != null) {
                ref
                    .read(settingsNotifierProvider.notifier)
                    .updateCurrency(value);
              }
            },
            title: Row(
              children: [
                Text(
                  currency.flag,
                  style: const TextStyle(fontSize: 24),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      currency.code,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight:
                            isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    Text(
                      '${currency.name} (${currency.symbol})',
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
          );
        },
      ),
    );
  }
}
