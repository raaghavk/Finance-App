'use strict';

const assert = require('assert');
const map = require('../lib/notion/map');

const page = {
  id: 'page-1',
  url: 'https://notion.so/page-1',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Cafe coffee' }, { plain_text: ' + tip' }] },
    Amount: { type: 'number', number: 185.5 },
    Date: { type: 'date', date: { start: '2026-09-07', end: null } },
    Category: { type: 'select', select: { name: 'Food' } },
    Kind: { type: 'select', select: { name: 'Everyday' } },
    Payment: { type: 'select', select: { name: 'UPI' } },
    Status: { type: 'select', select: { name: 'Logged' } },
    Trip: { type: 'select', select: null },
    Notes: { type: 'rich_text', rich_text: [{ plain_text: 'Filter coffee' }] },
    Receipt: { type: 'url', url: 'https://example.com/r.jpg' },
    Reimbursable: { type: 'checkbox', checkbox: true },
  },
};

const mapped = map.mapNotionPageToExpense(page);
assert.strictEqual(mapped.id, 'page-1');
assert.strictEqual(mapped.name, 'Cafe coffee + tip');
assert.strictEqual(mapped.amount, 185.5);
assert.strictEqual(mapped.date, '2026-09-07');
assert.strictEqual(mapped.category, 'Food');
assert.strictEqual(mapped.kind, 'Everyday');
assert.strictEqual(mapped.payment, 'UPI');
assert.strictEqual(mapped.status, 'Logged');
assert.strictEqual(mapped.trip, null);
assert.strictEqual(mapped.notes, 'Filter coffee');
assert.strictEqual(mapped.receipt, 'https://example.com/r.jpg');
assert.strictEqual(mapped.reimbursable, true);

const empty = map.mapNotionPageToExpense({
  id: 'empty',
  url: '',
  properties: {
    Name: { type: 'title', title: [] },
    Amount: { type: 'number', number: null },
    Date: { type: 'date', date: null },
    Category: { type: 'select', select: null },
    Kind: { type: 'select', select: null },
    Payment: { type: 'select', select: null },
    Status: { type: 'select', select: null },
    Trip: { type: 'select', select: null },
    Notes: { type: 'rich_text', rich_text: [] },
    Receipt: { type: 'url', url: null },
    Reimbursable: { type: 'checkbox', checkbox: false },
  },
});
assert.strictEqual(empty.name, '');
assert.strictEqual(empty.amount, null);
assert.strictEqual(empty.date, null);
assert.strictEqual(empty.reimbursable, false);

assert.deepStrictEqual(map.EXPENSE_CATEGORIES, [
  'Food', 'Transport', 'Shopping', 'Bills', 'Health',
  'Entertainment', 'Travel', 'Stay', 'Subscriptions', 'Other',
]);
assert.deepStrictEqual(map.EXPENSE_KINDS, ['Everyday', 'Travel', 'Receipt']);
assert.deepStrictEqual(map.EXPENSE_PAYMENTS, ['UPI', 'Card', 'Cash', 'Other']);
assert.deepStrictEqual(map.EXPENSE_STATUSES, ['Logged', 'Needs receipt', 'Submitted', 'Reimbursed']);
assert.deepStrictEqual(map.EXPENSE_TRIPS, ['Vietnam Sep 2026', 'Varanasi Sep 2026', 'Other trip']);

const now = new Date('2026-09-08T12:00:00');
const report = map.buildMonthReport(map.SAMPLE_NOTION_EXPENSES, now);
assert.strictEqual(report.monthKey, '2026-09');
assert.strictEqual(report.currency, 'INR');
assert.strictEqual(report.count, 5);
assert.strictEqual(report.total, 220 + 60 + 649 + 340 + 1139);
assert.ok(report.byCategory.find((r) => r.key === 'Food' && r.total === 220));
assert.ok(report.byKind.find((r) => r.key === 'Everyday'));
assert.ok(report.byKind.find((r) => r.key === 'Travel' && r.total === 1139));
assert.ok(report.byTrip.find((r) => r.key === 'Varanasi Sep 2026' && r.total === 1139));
assert.ok(!report.byTrip.find((r) => r.key === 'Vietnam Sep 2026'), 'August Vietnam spend must not land in September');

assert.strictEqual(map.fmtInr(1139), '₹1,139');
assert.strictEqual(map.fmtInr(185.5), '₹185.50');
assert.strictEqual(map.fmtInr(null), '₹—');

assert.throws(() => map.createNotionExpense({ name: 'x' }), /Expense Tracker/);

const mock = map.mockNotionSnapshot(now);
assert.strictEqual(mock.source, 'mock');
assert.ok(String(mock.warning).includes('NOTION_TOKEN'));

const client = require('../lib/notion/client');
assert.strictEqual(client.isNotionConfigured(), false);

const handleExpenses = require('../api/expenses');

async function testApiHandler() {
  await new Promise(function (resolve, reject) {
    handleExpenses(
      { method: 'GET' },
      {
        statusCode: 0,
        headers: {},
        setHeader: function (k, v) { this.headers[k] = v; },
        end: function (body) {
          try {
            const parsed = JSON.parse(body);
            assert.strictEqual(this.statusCode, 200);
            assert.strictEqual(parsed.source, 'mock');
            assert.ok(Array.isArray(parsed.expenses) && parsed.expenses.length > 0);
            assert.ok(parsed.warning);
            assert.ok(parsed.report && parsed.report.currency === 'INR');
            resolve();
          } catch (err) {
            reject(err);
          }
        },
      }
    ).catch(reject);
  });
}

testApiHandler()
  .then(function () {
    console.log('ok — notion expenses mapper, report, schema enums, mock snapshot, GET /api/expenses');
  })
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });
