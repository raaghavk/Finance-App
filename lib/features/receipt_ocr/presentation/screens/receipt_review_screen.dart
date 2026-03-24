import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:paisa_track/core/constants/app_constants.dart';
import 'package:paisa_track/domain/models/parsed_expense.dart';
import 'package:paisa_track/features/receipt_ocr/providers/ocr_provider.dart';
import 'package:paisa_track/features/receipt_ocr/presentation/widgets/extracted_fields.dart';

/// Review screen shown after a receipt image has been captured.
///
/// Displays the receipt image (zoomable), OCR-extracted fields in editable form,
/// a processing overlay, and a "Save Transaction" action button.
class ReceiptReviewScreen extends ConsumerStatefulWidget {
  const ReceiptReviewScreen({super.key});

  @override
  ConsumerState<ReceiptReviewScreen> createState() =>
      _ReceiptReviewScreenState();
}

class _ReceiptReviewScreenState extends ConsumerState<ReceiptReviewScreen> {
  late TextEditingController _amountController;
  late TextEditingController _merchantController;
  late TextEditingController _categoryController;
  late TextEditingController _dateController;
  late TextEditingController _accountController;

  @override
  void initState() {
    super.initState();
    _amountController = TextEditingController();
    _merchantController = TextEditingController();
    _categoryController = TextEditingController();
    _dateController = TextEditingController();
    _accountController = TextEditingController(text: 'Default');
  }

  @override
  void dispose() {
    _amountController.dispose();
    _merchantController.dispose();
    _categoryController.dispose();
    _dateController.dispose();
    _accountController.dispose();
    super.dispose();
  }

  /// Populate text controllers from the parsed expense.
  void _syncControllers(ParsedExpense expense) {
    if (_amountController.text.isEmpty && expense.amount != null) {
      _amountController.text = expense.amount!.toStringAsFixed(2);
    }
    if (_merchantController.text.isEmpty &&
        expense.note != null &&
        expense.note!.isNotEmpty) {
      _merchantController.text = expense.note!;
    }
    if (_categoryController.text.isEmpty &&
        expense.categoryName != null &&
        expense.categoryName!.isNotEmpty) {
      _categoryController.text = expense.categoryName!;
    }
    if (_dateController.text.isEmpty && expense.date != null) {
      _dateController.text = DateFormat('dd MMM yyyy').format(expense.date!);
    }
    if (_accountController.text == 'Default' &&
        expense.accountId != null &&
        expense.accountId!.isNotEmpty) {
      _accountController.text = expense.accountId!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ocrNotifierProvider);
    final notifier = ref.read(ocrNotifierProvider.notifier);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Keep controllers in sync with the latest parsed data.
    if (state.parsedExpense != null) {
      _syncControllers(state.parsedExpense!);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Receipt'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          // Usage counter
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: Text(
                '${state.usageCount}/${AppConstants.ocrMonthlyLimit}',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // ── Main content ─────────────────────────────────────────
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Receipt image ──────────────────────────────────
                if (state.imagePath != null)
                  SizedBox(
                    height: 260,
                    child: InteractiveViewer(
                      minScale: 0.5,
                      maxScale: 4.0,
                      child: Image.file(
                        File(state.imagePath!),
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),

                const SizedBox(height: 16),

                // ── Error state ────────────────────────────────────
                if (state.error != null) _buildError(state, notifier, theme),

                // ── Extracted fields (editable form) ───────────────
                if (state.parsedExpense != null && state.error == null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildEditableForm(
                      state.parsedExpense!,
                      theme,
                      colorScheme,
                    ),
                  ),

                // Fallback: if still processing and no result yet
                if (state.parsedExpense == null &&
                    !state.isProcessing &&
                    state.error == null)
                  Padding(
                    padding: const EdgeInsets.all(32),
                    child: Center(
                      child: Text(
                        'Capture or pick a receipt image to begin.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // ── Processing overlay ───────────────────────────────────
          if (state.isProcessing)
            Container(
              color: colorScheme.scrim.withOpacity(0.45),
              child: Center(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const CircularProgressIndicator(),
                        const SizedBox(height: 16),
                        Text(
                          'Processing receipt...',
                          style: theme.textTheme.bodyLarge,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // ── Bottom save button ───────────────────────────────────
          if (state.parsedExpense != null && !state.isProcessing)
            Positioned(
              left: 16,
              right: 16,
              bottom: MediaQuery.of(context).padding.bottom + 16,
              child: FilledButton.icon(
                onPressed: () => _saveTransaction(context, notifier),
                icon: const Icon(Icons.check),
                label: const Text('Save Transaction'),
              ),
            ),
        ],
      ),
    );
  }

  // ── Sub-builders ───────────────────────────────────────────────────────

  Widget _buildError(OcrState state, OcrNotifier notifier, ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
          const SizedBox(height: 12),
          Text(
            state.error!,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.error,
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () {
              if (state.imagePath != null) {
                notifier.processImage(state.imagePath!);
              } else {
                notifier.reset();
                if (context.mounted) context.pop();
              }
            },
            icon: const Icon(Icons.refresh),
            label: const Text('Try Again'),
          ),
        ],
      ),
    );
  }

  Widget _buildEditableForm(
    ParsedExpense expense,
    ThemeData theme,
    ColorScheme colorScheme,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Extracted Details',
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 16),
        // Amount
        _buildField(
          controller: _amountController,
          label: 'Amount (\u20B9)',
          icon: Icons.currency_rupee,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
        ),
        const SizedBox(height: 12),
        // Merchant / Note
        _buildField(
          controller: _merchantController,
          label: 'Merchant / Note',
          icon: Icons.store_outlined,
        ),
        const SizedBox(height: 12),
        // Category
        _buildField(
          controller: _categoryController,
          label: 'Category',
          icon: Icons.category_outlined,
          readOnly: true,
          onTap: () => _showCategoryPicker(context),
        ),
        const SizedBox(height: 12),
        // Date
        _buildField(
          controller: _dateController,
          label: 'Date',
          icon: Icons.calendar_today_outlined,
          readOnly: true,
          onTap: () => _showDatePicker(context),
        ),
        const SizedBox(height: 12),
        // Account
        _buildField(
          controller: _accountController,
          label: 'Account',
          icon: Icons.account_balance_wallet_outlined,
          readOnly: true,
          onTap: () => _showAccountPicker(context),
        ),
        const SizedBox(height: 24),
        // Inline extracted fields with confidence indicators.
        if (expense.rawText.isNotEmpty) ...[
          ExtractedFields(
            expense: expense,
            onAmountTap: () => _focusField(_amountController),
            onMerchantTap: () => _focusField(_merchantController),
            onCategoryTap: () => _showCategoryPicker(context),
            onDateTap: () => _showDatePicker(context),
            onAccountTap: () => _showAccountPicker(context),
          ),
          const SizedBox(height: 24),
        ],
      ],
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    bool readOnly = false,
    VoidCallback? onTap,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      readOnly: readOnly,
      onTap: onTap,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        suffixIcon: readOnly
            ? const Icon(Icons.arrow_drop_down)
            : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  // ── Pickers ────────────────────────────────────────────────────────────

  void _focusField(TextEditingController controller) {
    controller.selection = TextSelection(
      baseOffset: 0,
      extentOffset: controller.text.length,
    );
  }

  Future<void> _showDatePicker(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(now.year - 2),
      lastDate: now,
    );
    if (picked != null) {
      _dateController.text = DateFormat('dd MMM yyyy').format(picked);
    }
  }

  void _showCategoryPicker(BuildContext context) {
    // TODO: Show a bottom sheet or page with the list of categories.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Category picker coming soon')),
    );
  }

  void _showAccountPicker(BuildContext context) {
    // TODO: Show a bottom sheet or page with the list of accounts.
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Account picker coming soon')),
    );
  }

  // ── Save ───────────────────────────────────────────────────────────────

  void _saveTransaction(BuildContext context, OcrNotifier notifier) {
    // TODO: Build a Transaction from form values and persist via repository.
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid amount')),
      );
      return;
    }

    // TODO: final transaction = Transaction(...);
    // await ref.read(transactionRepositoryProvider).create(transaction);

    notifier.reset();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transaction saved!')),
      );
      // Pop back to the screen that opened the camera.
      context.pop();
      context.pop();
    }
  }
}
