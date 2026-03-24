/// Export data screen with format selection and premium gating.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/core/enums/subscription_tier.dart';
import 'package:paisa_track/core/router/routes.dart';
import 'package:paisa_track/features/settings/providers/settings_provider.dart';

/// Supported export formats.
enum ExportFormat { csv, pdf }

/// Supported export date range presets.
enum ExportRange { lastMonth, lastThreeMonths, lastSixMonths, allTime }

/// Screen that lets users export their transaction data.
class ExportScreen extends ConsumerStatefulWidget {
  const ExportScreen({super.key});

  @override
  ConsumerState<ExportScreen> createState() => _ExportScreenState();
}

class _ExportScreenState extends ConsumerState<ExportScreen> {
  ExportFormat _format = ExportFormat.csv;
  ExportRange _range = ExportRange.lastMonth;
  bool _isExporting = false;

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(userSettingsProvider);
    final isPremium = settings.subscriptionTier == SubscriptionTier.premium;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Export Data')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Date Range ──────────────────────────────────────────────
          Text(
            'Date Range',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          _RangeOption(
            label: 'Last month',
            value: ExportRange.lastMonth,
            groupValue: _range,
            onChanged: (v) => setState(() => _range = v!),
          ),
          _RangeOption(
            label: 'Last 3 months',
            value: ExportRange.lastThreeMonths,
            groupValue: _range,
            onChanged: isPremium
                ? (v) => setState(() => _range = v!)
                : null,
            isPremiumLocked: !isPremium,
          ),
          _RangeOption(
            label: 'Last 6 months',
            value: ExportRange.lastSixMonths,
            groupValue: _range,
            onChanged: isPremium
                ? (v) => setState(() => _range = v!)
                : null,
            isPremiumLocked: !isPremium,
          ),
          _RangeOption(
            label: 'Full history',
            value: ExportRange.allTime,
            groupValue: _range,
            onChanged: isPremium
                ? (v) => setState(() => _range = v!)
                : null,
            isPremiumLocked: !isPremium,
          ),
          if (!isPremium) ...[
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.only(left: 16),
              child: GestureDetector(
                onTap: () => context.go(AppRoutes.premium),
                child: Text(
                  'Upgrade to Premium for full history export',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: const Color(0xFFFF6B35),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),

          // ── Format ──────────────────────────────────────────────────
          Text(
            'Format',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          RadioListTile<ExportFormat>(
            value: ExportFormat.csv,
            groupValue: _format,
            onChanged: (v) => setState(() => _format = v!),
            title: const Text('CSV'),
            subtitle: const Text('Spreadsheet-compatible format'),
          ),
          RadioListTile<ExportFormat>(
            value: ExportFormat.pdf,
            groupValue: _format,
            onChanged: (v) => setState(() => _format = v!),
            title: const Text('PDF'),
            subtitle: const Text('Formatted report with charts'),
          ),
          const SizedBox(height: 24),

          // ── Preview ─────────────────────────────────────────────────
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Export Preview',
                    style: theme.textTheme.titleSmall
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  _PreviewRow(
                    label: 'Transactions',
                    value: '-- records', // Placeholder count
                  ),
                  _PreviewRow(
                    label: 'Date range',
                    value: _rangeLabel(),
                  ),
                  _PreviewRow(
                    label: 'Format',
                    value: _format == ExportFormat.csv ? 'CSV' : 'PDF',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // ── Export Button ───────────────────────────────────────────
          FilledButton.icon(
            onPressed: _isExporting ? null : _handleExport,
            icon: _isExporting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.file_download),
            label: Text(_isExporting ? 'Exporting...' : 'Export'),
          ),
        ],
      ),
    );
  }

  String _rangeLabel() {
    switch (_range) {
      case ExportRange.lastMonth:
        return 'Last ${AppConstants.freeExportMonths} month';
      case ExportRange.lastThreeMonths:
        return 'Last 3 months';
      case ExportRange.lastSixMonths:
        return 'Last 6 months';
      case ExportRange.allTime:
        return 'All time';
    }
  }

  Future<void> _handleExport() async {
    setState(() => _isExporting = true);

    // TODO: Implement actual export logic.
    // 1. Query transactions for the selected date range.
    // 2. Generate CSV or PDF file.
    // 3. Open the system share sheet with the file.
    await Future<void>.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isExporting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Export generated successfully')),
      );
    }
  }
}

class _RangeOption extends StatelessWidget {
  const _RangeOption({
    required this.label,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    this.isPremiumLocked = false,
  });

  final String label;
  final ExportRange value;
  final ExportRange groupValue;
  final ValueChanged<ExportRange?>? onChanged;
  final bool isPremiumLocked;

  @override
  Widget build(BuildContext context) {
    return RadioListTile<ExportRange>(
      value: value,
      groupValue: groupValue,
      onChanged: onChanged,
      title: Row(
        children: [
          Text(label),
          if (isPremiumLocked) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B35),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'PRO',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PreviewRow extends StatelessWidget {
  const _PreviewRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: theme.colorScheme.onSurfaceVariant),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium
                ?.copyWith(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
