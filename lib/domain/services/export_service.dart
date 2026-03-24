import 'dart:typed_data';

import 'package:csv/csv.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:paisa_track/domain/models/transaction.dart' as domain;
import 'package:paisa_track/core/enums/transaction_type.dart';
import 'package:paisa_track/core/utils/indian_number_format.dart';

/// Exports transaction data to CSV and PDF formats.
class ExportService {
  static final _dateFormat = DateFormat('dd/MM/yyyy');
  static final _dateTimeFormat = DateFormat('dd/MM/yyyy HH:mm');

  /// Export transactions to CSV string.
  String exportToCsv(List<domain.Transaction> transactions) {
    final rows = <List<dynamic>>[
      // Header row
      [
        'Date',
        'Type',
        'Amount (₹)',
        'Category',
        'Account',
        'Note',
        'Input Source',
        'Original Currency',
        'Original Amount',
      ],
      // Data rows
      ...transactions.map((tx) => [
            _dateFormat.format(tx.transactionDate),
            tx.type.name,
            tx.amount.toStringAsFixed(2),
            tx.categoryId, // Ideally resolved to name by caller
            tx.accountId, // Ideally resolved to name by caller
            tx.note,
            tx.inputSource,
            tx.originalCurrency,
            tx.originalAmount?.toStringAsFixed(2) ?? '',
          ]),
    ];

    return const ListToCsvConverter().convert(rows);
  }

  /// Export transactions to CSV with resolved category and account names.
  String exportToCsvWithNames(
    List<domain.Transaction> transactions, {
    required Map<String, String> categoryNames,
    required Map<String, String> accountNames,
  }) {
    final rows = <List<dynamic>>[
      [
        'Date',
        'Type',
        'Amount (₹)',
        'Category',
        'Account',
        'Note',
        'Input Source',
      ],
      ...transactions.map((tx) => [
            _dateFormat.format(tx.transactionDate),
            tx.type.name.toUpperCase(),
            tx.amount.toStringAsFixed(2),
            categoryNames[tx.categoryId] ?? tx.categoryId,
            accountNames[tx.accountId] ?? tx.accountId,
            tx.note,
            tx.inputSource,
          ]),
    ];

    return const ListToCsvConverter().convert(rows);
  }

  /// Export transactions to PDF document bytes.
  Future<Uint8List> exportToPdf(
    List<domain.Transaction> transactions, {
    required DateTime startDate,
    required DateTime endDate,
    Map<String, String>? categoryNames,
    Map<String, String>? accountNames,
  }) async {
    final pdf = pw.Document();

    // Calculate summary
    final totalIncome = transactions
        .where((t) => t.type == TransactionType.income)
        .fold(0.0, (sum, t) => sum + t.amount);
    final totalExpense = transactions
        .where((t) => t.type == TransactionType.expense)
        .fold(0.0, (sum, t) => sum + t.amount);
    final netSavings = totalIncome - totalExpense;

    // Split transactions into pages of 25
    const rowsPerPage = 25;
    final pages = <List<domain.Transaction>>[];
    for (var i = 0; i < transactions.length; i += rowsPerPage) {
      final end = (i + rowsPerPage < transactions.length)
          ? i + rowsPerPage
          : transactions.length;
      pages.add(transactions.sublist(i, end));
    }

    // Title page with summary
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(40),
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(
              'PaisaTrack - Expense Report',
              style: pw.TextStyle(
                fontSize: 24,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Text(
              '${_dateFormat.format(startDate)} - ${_dateFormat.format(endDate)}',
              style: const pw.TextStyle(fontSize: 14, color: PdfColors.grey700),
            ),
            pw.SizedBox(height: 24),
            pw.Divider(),
            pw.SizedBox(height: 16),

            // Summary section
            pw.Text(
              'Summary',
              style: pw.TextStyle(
                  fontSize: 18, fontWeight: pw.FontWeight.bold),
            ),
            pw.SizedBox(height: 12),
            _buildSummaryRow(
                'Total Income', IndianNumberFormat.format(totalIncome),
                color: PdfColors.green700),
            pw.SizedBox(height: 6),
            _buildSummaryRow(
                'Total Expenses', IndianNumberFormat.format(totalExpense),
                color: PdfColors.red700),
            pw.SizedBox(height: 6),
            pw.Divider(),
            pw.SizedBox(height: 6),
            _buildSummaryRow(
              'Net Savings',
              IndianNumberFormat.format(netSavings),
              color: netSavings >= 0 ? PdfColors.green700 : PdfColors.red700,
            ),
            pw.SizedBox(height: 8),
            pw.Text(
              'Total Transactions: ${transactions.length}',
              style: const pw.TextStyle(fontSize: 12, color: PdfColors.grey600),
            ),
            pw.SizedBox(height: 32),

            // Spending by category
            pw.Text(
              'Spending by Category',
              style: pw.TextStyle(
                  fontSize: 18, fontWeight: pw.FontWeight.bold),
            ),
            pw.SizedBox(height: 12),
            ..._buildCategoryBreakdown(
                transactions, categoryNames ?? {}),
          ],
        ),
      ),
    );

    // Transaction detail pages
    for (var pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      final pageTransactions = pages[pageIdx];
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(40),
          build: (context) => pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(
                'Transactions (Page ${pageIdx + 1} of ${pages.length})',
                style: pw.TextStyle(
                    fontSize: 16, fontWeight: pw.FontWeight.bold),
              ),
              pw.SizedBox(height: 12),
              pw.TableHelper.fromTextArray(
                headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                headerDecoration:
                    const pw.BoxDecoration(color: PdfColors.grey200),
                cellHeight: 24,
                cellAlignments: {
                  0: pw.Alignment.centerLeft,
                  1: pw.Alignment.center,
                  2: pw.Alignment.centerRight,
                  3: pw.Alignment.centerLeft,
                  4: pw.Alignment.centerLeft,
                },
                headers: ['Date', 'Type', 'Amount', 'Category', 'Note'],
                data: pageTransactions.map((tx) {
                  final catName =
                      categoryNames?[tx.categoryId] ?? tx.categoryId;
                  return [
                    _dateFormat.format(tx.transactionDate),
                    tx.type.name[0].toUpperCase(),
                    IndianNumberFormat.format(tx.amount),
                    catName.length > 15
                        ? '${catName.substring(0, 15)}...'
                        : catName,
                    tx.note.length > 20
                        ? '${tx.note.substring(0, 20)}...'
                        : tx.note,
                  ];
                }).toList(),
              ),
            ],
          ),
        ),
      );
    }

    return pdf.save();
  }

  pw.Widget _buildSummaryRow(String label, String value,
      {PdfColor? color}) {
    return pw.Row(
      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
      children: [
        pw.Text(label, style: const pw.TextStyle(fontSize: 14)),
        pw.Text(
          value,
          style: pw.TextStyle(
            fontSize: 14,
            fontWeight: pw.FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  List<pw.Widget> _buildCategoryBreakdown(
    List<domain.Transaction> transactions,
    Map<String, String> categoryNames,
  ) {
    final expenses =
        transactions.where((t) => t.type == TransactionType.expense).toList();

    final Map<String, double> byCategory = {};
    for (final tx in expenses) {
      final name = categoryNames[tx.categoryId] ?? tx.categoryId;
      byCategory[name] = (byCategory[name] ?? 0) + tx.amount;
    }

    final sorted = byCategory.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return sorted.take(15).map((entry) {
      return pw.Padding(
        padding: const pw.EdgeInsets.symmetric(vertical: 2),
        child: pw.Row(
          mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
          children: [
            pw.Text(entry.key, style: const pw.TextStyle(fontSize: 12)),
            pw.Text(
              IndianNumberFormat.format(entry.value),
              style: pw.TextStyle(
                  fontSize: 12, fontWeight: pw.FontWeight.bold),
            ),
          ],
        ),
      );
    }).toList();
  }
}
