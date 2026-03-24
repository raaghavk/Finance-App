import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/domain/models/transaction.dart';
import 'package:paisa_track/features/transactions/providers/transaction_form_provider.dart';
import 'package:paisa_track/features/transactions/providers/transactions_provider.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/amount_input.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/category_picker.dart';
import 'package:paisa_track/features/transactions/presentation/widgets/date_picker.dart';

/// Screen for adding a new transaction or editing an existing one.
class AddTransactionScreen extends ConsumerStatefulWidget {
  const AddTransactionScreen({
    super.key,
    this.editTransaction,
  });

  /// If non-null, the screen is in edit mode.
  final Transaction? editTransaction;

  @override
  ConsumerState<AddTransactionScreen> createState() =>
      _AddTransactionScreenState();
}

class _AddTransactionScreenState extends ConsumerState<AddTransactionScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _noteController = TextEditingController();
  final _imagePicker = ImagePicker();

  static const _types = [
    TransactionType.expense,
    TransactionType.income,
    TransactionType.transfer,
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    // If editing, pre-fill form.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final notifier = ref.read(transactionFormNotifierProvider.notifier);
      if (widget.editTransaction != null) {
        notifier.loadForEditing(widget.editTransaction!);
        final typeIndex = _types.indexOf(widget.editTransaction!.type);
        _tabController.animateTo(typeIndex >= 0 ? typeIndex : 0);
        _noteController.text = widget.editTransaction!.note;
      } else {
        notifier.reset();
        _noteController.clear();
      }
    });

    _tabController.addListener(_onTabChanged);
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    ref
        .read(transactionFormNotifierProvider.notifier)
        .setType(_types[_tabController.index]);
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  String _appBarTitle(TransactionType type) {
    switch (type) {
      case TransactionType.expense:
        return 'Add Expense';
      case TransactionType.income:
        return 'Add Income';
      case TransactionType.transfer:
        return 'Add Transfer';
    }
  }

  Future<void> _pickReceiptImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () => Navigator.of(ctx).pop(ImageSource.camera),
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () => Navigator.of(ctx).pop(ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == null) return;

    final xFile = await _imagePicker.pickImage(
      source: source,
      maxWidth: 1200,
      imageQuality: 80,
    );
    if (xFile != null) {
      ref
          .read(transactionFormNotifierProvider.notifier)
          .setReceiptImage(xFile.path);
    }
  }

  Future<void> _save() async {
    final formNotifier = ref.read(transactionFormNotifierProvider.notifier);
    final transaction = await formNotifier.submit();
    if (transaction != null && mounted) {
      // Refresh list
      await ref.read(transactionsNotifierProvider.notifier).loadTransactions();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.editTransaction != null
                  ? 'Transaction updated'
                  : 'Transaction added',
            ),
          ),
        );
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final formState = ref.watch(transactionFormNotifierProvider);
    final formNotifier = ref.read(transactionFormNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          formState.isEditing
              ? 'Edit Transaction'
              : _appBarTitle(formState.type),
        ),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Expense'),
            Tab(text: 'Income'),
            Tab(text: 'Transfer'),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Amount Input ──────────────────────────────────────────
            AmountInput(
              amount: formState.amount,
              onAmountChanged: formNotifier.setAmount,
            ),
            const SizedBox(height: 24),

            // ── Category Picker ───────────────────────────────────────
            Text(
              'Category',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            CategoryPicker(
              transactionType: formState.type,
              selectedCategoryId: formState.categoryId,
              onCategorySelected: formNotifier.setCategory,
            ),
            const SizedBox(height: 24),

            // ── Account Picker ────────────────────────────────────────
            Text(
              formState.type == TransactionType.transfer
                  ? 'From Account'
                  : 'Account',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            _AccountDropdown(
              selectedAccountId: formState.accountId,
              onChanged: (id) {
                if (id != null) formNotifier.setAccount(id);
              },
              label: 'Select account',
            ),

            if (formState.type == TransactionType.transfer) ...[
              const SizedBox(height: 16),
              Text(
                'To Account',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              _AccountDropdown(
                selectedAccountId: formState.toAccountId,
                onChanged: (id) {
                  if (id != null) formNotifier.setToAccount(id);
                },
                label: 'Select destination account',
              ),
            ],
            const SizedBox(height: 24),

            // ── Date Picker ───────────────────────────────────────────
            Text(
              'Date',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            TransactionDatePicker(
              selectedDate: formState.date ?? DateTime.now(),
              onDateSelected: formNotifier.setDate,
            ),
            const SizedBox(height: 24),

            // ── Note Input ────────────────────────────────────────────
            TextField(
              controller: _noteController,
              decoration: const InputDecoration(
                labelText: 'Note',
                hintText: 'Add a note...',
                prefixIcon: Icon(Icons.notes),
              ),
              maxLines: 2,
              textCapitalization: TextCapitalization.sentences,
              onChanged: formNotifier.setNote,
            ),
            const SizedBox(height: 24),

            // ── Receipt Image ─────────────────────────────────────────
            OutlinedButton.icon(
              onPressed: _pickReceiptImage,
              icon: const Icon(Icons.camera_alt),
              label: Text(
                formState.receiptImagePath != null
                    ? 'Change Receipt Photo'
                    : 'Attach Receipt Photo',
              ),
            ),
            if (formState.receiptImagePath != null) ...[
              const SizedBox(height: 8),
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.asset(
                      formState.receiptImagePath!,
                      height: 120,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 120,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Center(
                          child: Icon(Icons.image, size: 48),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: IconButton.filledTonal(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: () => formNotifier.setReceiptImage(null),
                    ),
                  ),
                ],
              ),
            ],

            // ── Error message ─────────────────────────────────────────
            if (formState.errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline,
                        color: theme.colorScheme.error, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        formState.errorMessage!,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onErrorContainer,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: formState.isSubmitting ? null : _save,
            child: formState.isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(formState.isEditing ? 'Update' : 'Save'),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Account Dropdown (placeholder until accounts feature is wired up)
// ---------------------------------------------------------------------------

class _AccountDropdown extends StatelessWidget {
  const _AccountDropdown({
    required this.selectedAccountId,
    required this.onChanged,
    required this.label,
  });

  final String? selectedAccountId;
  final ValueChanged<String?> onChanged;
  final String label;

  // Placeholder accounts until the accounts feature provides real data.
  static const _placeholderAccounts = <String, String>{
    'cash': 'Cash',
    'savings': 'Savings Account',
    'current': 'Current Account',
    'credit_card': 'Credit Card',
    'paytm': 'Paytm Wallet',
    'gpay': 'Google Pay',
  };

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: selectedAccountId,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.account_balance_wallet),
      ),
      items: _placeholderAccounts.entries
          .map(
            (e) => DropdownMenuItem(
              value: e.key,
              child: Text(e.value),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}
