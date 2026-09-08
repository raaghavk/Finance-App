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
    Account: { type: 'select', select: { name: 'Primary debit' } },
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
assert.strictEqual(mapped.account, 'Primary debit');
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
    Account: { type: 'select', select: null },
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
assert.strictEqual(empty.account, null);
assert.strictEqual(empty.reimbursable, false);

assert.deepStrictEqual(map.EXPENSE_CATEGORIES, [
  'Food', 'Transport', 'Shopping', 'Bills', 'Health',
  'Entertainment', 'Travel', 'Stay', 'Subscriptions', 'Other',
]);
assert.deepStrictEqual(map.EXPENSE_KINDS, ['Everyday', 'Travel', 'Receipt']);
assert.deepStrictEqual(map.EXPENSE_PAYMENTS, ['UPI', 'Card', 'Cash', 'Other']);
assert.deepStrictEqual(map.EXPENSE_STATUSES, ['Logged', 'Needs receipt', 'Submitted', 'Reimbursed']);
assert.deepStrictEqual(map.EXPENSE_TRIPS, ['Vietnam Sep 2026', 'Varanasi Sep 2026', 'Other trip']);
assert.deepStrictEqual(map.EXPENSE_ACCOUNTS, ['Cash', 'UPI', 'Primary debit', 'Primary credit', 'Corporate']);
assert.notStrictEqual(map.EXPENSE_PAYMENTS, map.EXPENSE_ACCOUNTS, 'Payment is instrument; Account is wallet');

const corporateCard = map.mapNotionPageToExpense({
  id: 'corp',
  url: '',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Client dinner' }] },
    Amount: { type: 'number', number: 2400 },
    Date: { type: 'date', date: { start: '2026-09-03' } },
    Payment: { type: 'select', select: { name: 'Card' } },
    Account: { type: 'select', select: { name: 'Corporate' } },
  },
});
assert.strictEqual(corporateCard.payment, 'Card');
assert.strictEqual(corporateCard.account, 'Corporate');
assert.ok(map.EXPENSE_ACCOUNTS.indexOf('Cash') >= 0);
assert.ok(map.EXPENSE_ACCOUNTS.indexOf('UPI') >= 0);
assert.ok(map.EXPENSE_ACCOUNTS.indexOf('Primary debit') >= 0);
assert.ok(map.EXPENSE_ACCOUNTS.indexOf('Primary credit') >= 0);
assert.ok(map.EXPENSE_ACCOUNTS.indexOf('Corporate') >= 0);
assert.strictEqual(map.fromOwnerFixture({ Name: 'Taxi', Amount: 80, date: '2026-09-01', Payment: 'Cash', Account: 'Primary credit' }).account, 'Primary credit');
assert.strictEqual(map.fromOwnerFixture({ Name: 'Taxi', Amount: 80, date: '2026-09-01', Payment: 'Cash', Account: 'Primary credit' }).payment, 'Cash');

assert.strictEqual(map.asCheckbox(true), true);
assert.strictEqual(map.asCheckbox('__YES__'), true);
assert.strictEqual(map.asCheckbox('__NO__'), false);
assert.strictEqual(map.asCheckbox({ type: 'checkbox', checkbox: true }), true);
assert.strictEqual(map.asCheckbox({ type: 'checkbox', checkbox: '__YES__' }), true);
assert.strictEqual(map.asCheckbox({ type: 'checkbox', checkbox: '__NO__' }), false);
assert.strictEqual(map.fromOwnerFixture({ Name: 'Corp lunch', Amount: 10, date: '2026-09-01', Reimbursable: '__YES__' }).reimbursable, true);
assert.strictEqual(map.fromOwnerFixture({ Name: 'Self', Amount: 10, date: '2026-09-01', Reimbursable: '__NO__' }).reimbursable, false);

const yesPage = map.mapNotionPageToExpense({
  id: 'yes',
  url: '',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Taxi' }] },
    Amount: { type: 'number', number: 400 },
    Date: { type: 'date', date: { start: '2026-09-01' } },
    Reimbursable: { type: 'checkbox', checkbox: '__YES__' },
  },
});
assert.strictEqual(yesPage.reimbursable, true);

assert.strictEqual(map.SAMPLE_NOTION_EXPENSES.length, 10);
const airlines = map.SAMPLE_NOTION_EXPENSES.find((e) => /Vietnam Airlines/.test(e.name));
assert.ok(airlines, 'Vietnam Airlines fixture');
assert.strictEqual(airlines.amount, null);
assert.ok(map.SAMPLE_NOTION_EXPENSES.every((e) => String(e.notes).indexOf('Example data') === 0));

const now = new Date('2026-09-08T12:00:00');
const report = map.buildMonthReport(map.SAMPLE_NOTION_EXPENSES, now);
assert.strictEqual(report.monthKey, '2026-09');
assert.strictEqual(report.currency, 'INR');
assert.strictEqual(report.count, 5);
assert.strictEqual(report.unpricedCount, 0);
assert.strictEqual(report.total, 1327 + 670 + 1139 + 2496 + 1000);
assert.ok(report.byCategory.find((r) => r.key === 'Food' && r.total === 670 + 2496));
assert.ok(report.byCategory.find((r) => r.key === 'Stay' && r.total === 1327 + 1139));
assert.ok(report.byKind.find((r) => r.key === 'Travel' && r.total === report.total));
assert.ok(report.byTrip.find((r) => r.key === 'Varanasi Sep 2026' && r.total === 670 + 1139 + 2496 + 1000));
assert.ok(report.byTrip.find((r) => r.key === 'Vietnam Sep 2026' && r.total === 1327));

const august = map.buildMonthReport(map.SAMPLE_NOTION_EXPENSES, new Date('2026-08-15T12:00:00'));
assert.strictEqual(august.monthKey, '2026-08');
assert.strictEqual(august.count, 4);
assert.strictEqual(august.unpricedCount, 1);
assert.strictEqual(august.total, 692 + 2441 + 561, 'null Amount excluded from sum');
assert.ok(august.byCategory.find((r) => r.key === 'Travel' && r.count === 3 && r.total === 692 + 2441));

assert.strictEqual(map.fmtInr(1139), '₹1,139');
assert.strictEqual(map.fmtInr(185.5), '₹185.50');
assert.strictEqual(map.fmtInr(null), '₹—');
assert.strictEqual(map.fmtInr(85273.14), '₹85,273.14');

assert.throws(() => map.createNotionExpense({ name: 'x' }), /Expense Tracker/);

const mock = map.mockNotionSnapshot(now);
assert.strictEqual(mock.source, 'mock');
assert.ok(String(mock.warning).includes('NOTION_TOKEN'));
assert.ok(String(mock.warning).includes('collection://b35c3e74-0bc7-432d-8309-80a7583d3601'));
assert.ok(String(mock.warning).toLowerCase().includes('live'));

const client = require('../lib/notion/client');
assert.strictEqual(client.isNotionConfigured(), false);

const handleExpenses = require('../api/expenses');

function fakeRes(onEnd) {
  return {
    statusCode: 0,
    headers: {},
    setHeader: function (k, v) { this.headers[k] = v; },
    end: function (body) { onEnd(this, body); },
  };
}

async function testApiHandler() {
  await new Promise(function (resolve, reject) {
    handleExpenses(
      { method: 'GET' },
      fakeRes(function (res, body) {
        try {
          const parsed = JSON.parse(body);
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(parsed.source, 'mock');
          assert.ok(Array.isArray(parsed.expenses) && parsed.expenses.length === 10);
          assert.ok(parsed.warning);
          assert.ok(parsed.report && parsed.report.currency === 'INR');
          assert.strictEqual(parsed.report.unpricedCount, 0);
          resolve();
        } catch (err) {
          reject(err);
        }
      })
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
