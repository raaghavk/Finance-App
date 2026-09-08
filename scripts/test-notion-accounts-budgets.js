'use strict';

const assert = require('assert');
const map = require('../lib/notion/map');

const accountPage = {
  id: 'acct-1',
  url: 'https://notion.so/acct-1',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Primary debit' }] },
    Notes: { type: 'rich_text', rich_text: [{ plain_text: 'Salary wallet' }] },
    'Opening balance': { type: 'number', number: 12000 },
  },
};

const mappedAcct = map.mapNotionPageToAccount(accountPage);
assert.strictEqual(mappedAcct.id, 'acct-1');
assert.strictEqual(mappedAcct.name, 'Primary debit');
assert.strictEqual(mappedAcct.notes, 'Salary wallet');
assert.strictEqual(mappedAcct.openingBalance, 12000);

const emptyOpening = map.mapNotionPageToAccount({
  id: 'acct-empty',
  url: '',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Corporate' }] },
    Notes: { type: 'rich_text', rich_text: [] },
    'Opening balance': { type: 'number', number: null },
  },
});
assert.strictEqual(emptyOpening.openingBalance, null);
assert.strictEqual(map.asNumber({ type: 'number', number: 0 }), 0);
assert.strictEqual(map.asNumber({ type: 'number', number: null }), null);

const budgetPage = {
  id: 'bud-1',
  url: 'https://notion.so/bud-1',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Food' }] },
    Category: { type: 'select', select: { name: 'Food' } },
    'Monthly cap': { type: 'number', number: 15000 },
    Notes: { type: 'rich_text', rich_text: [{ plain_text: 'Starter cap' }] },
  },
};
const mappedBud = map.mapNotionPageToBudget(budgetPage);
assert.strictEqual(mappedBud.category, 'Food');
assert.strictEqual(mappedBud.monthlyCap, 15000);

assert.strictEqual(map.NOTION_ACCOUNTS_DATA_SOURCE_ID, '2c0de472-1d21-4243-bcd8-1fb19ab89bba');
assert.strictEqual(map.NOTION_BUDGETS_DATA_SOURCE_ID, '3f8d31df-d13d-49a2-a9ac-f5b8489f737f');
assert.deepStrictEqual(map.EXPENSE_ACCOUNTS, ['Cash', 'UPI', 'Primary debit', 'Primary credit', 'Corporate']);
assert.ok(map.SAMPLE_NOTION_ACCOUNTS.length >= 5);
assert.ok(map.SAMPLE_NOTION_BUDGETS.length === 10);
assert.ok(map.SAMPLE_NOTION_BUDGETS.every((b) => map.EXPENSE_CATEGORIES.indexOf(b.category) >= 0));

const now = new Date('2026-09-08T12:00:00');
const expenses = [
  { name: 'Tiffin', amount: 220, date: '2026-09-05', category: 'Food', account: 'UPI' },
  { name: 'Metro', amount: 60, date: '2026-09-04', category: 'Transport', account: 'UPI' },
  { name: 'Dinner', amount: 2400, date: '2026-09-03', category: 'Food', account: 'Primary credit' },
  { name: 'Null fare', amount: null, date: '2026-09-02', category: 'Transport', account: 'UPI' },
  { name: 'August stay', amount: 5000, date: '2026-08-12', category: 'Stay', account: 'Cash' },
];

const accounts = [
  { id: 'a-upi', url: '', name: 'UPI', notes: '', openingBalance: 5000 },
  { id: 'a-credit', url: '', name: 'Primary credit', notes: 'owed', openingBalance: 0 },
  { id: 'a-cash', url: '', name: 'Cash', notes: '', openingBalance: 2000 },
  { id: 'a-corp', url: '', name: 'Corporate', notes: '', openingBalance: null },
];

const balances = map.buildAccountBalances(accounts, expenses);
const upi = balances.find((b) => b.name === 'UPI');
assert.ok(upi);
assert.strictEqual(upi.spent, 220 + 60, 'null Amount excluded from account delta');
assert.strictEqual(upi.balance, 5000 - 280);
assert.strictEqual(upi.openingMissing, false);

const credit = balances.find((b) => b.name === 'Primary credit');
assert.strictEqual(credit.balance, 0 - 2400, 'credit spend is opening minus expenses (owed)');

const cash = balances.find((b) => b.name === 'Cash');
assert.strictEqual(cash.spent, 5000, 'account balance uses all tagged spend, not only this month');
assert.strictEqual(cash.balance, 2000 - 5000);

const corp = balances.find((b) => b.name === 'Corporate');
assert.strictEqual(corp.openingMissing, true);
assert.strictEqual(corp.openingBalance, null);
assert.strictEqual(corp.balance, 0, 'null opening treated as 0');

const withGhost = map.buildAccountBalances(
  [{ id: 'only-cash', url: '', name: 'Cash', notes: '', openingBalance: 0 }],
  [{ name: 'Corp lunch', amount: 900, date: '2026-09-01', account: 'Corporate' }]
);
assert.ok(withGhost.find((b) => b.name === 'Corporate' && b.spent === 900 && b.openingMissing));

const budgets = [
  { id: 'b-food', url: '', name: 'Food', category: 'Food', monthlyCap: 15000, notes: '' },
  { id: 'b-stay', url: '', name: 'Stay', category: 'Stay', monthlyCap: 10000, notes: '' },
  { id: 'b-other', url: '', name: 'Other', category: 'Other', monthlyCap: null, notes: '' },
];
const progress = map.buildBudgetProgress(budgets, expenses, now);
const food = progress.find((p) => p.category === 'Food');
assert.strictEqual(food.spent, 220 + 2400);
assert.strictEqual(food.left, 15000 - 2620);
assert.strictEqual(food.over, false);
assert.strictEqual(food.monthKey, '2026-09');

const stay = progress.find((p) => p.category === 'Stay');
assert.strictEqual(stay.spent, 0, 'August Stay does not count toward September left');
assert.strictEqual(stay.left, 10000);

const other = progress.find((p) => p.category === 'Other');
assert.strictEqual(other.capMissing, true);
assert.strictEqual(other.left, null);

const overspent = map.buildBudgetProgress(
  [{ id: 'b-ent', url: '', name: 'Entertainment', category: 'Entertainment', monthlyCap: 500, notes: '' }],
  [{ name: 'Cover', amount: 1000, date: '2026-09-06', category: 'Entertainment', account: 'Cash' }],
  now
)[0];
assert.strictEqual(overspent.left, -500);
assert.strictEqual(overspent.over, true);

const mockAcct = map.mockNotionAccountsSnapshot(now);
assert.strictEqual(mockAcct.source, 'mock');
assert.ok(String(mockAcct.warning).includes('2c0de472-1d21-4243-bcd8-1fb19ab89bba'));
assert.ok(mockAcct.balances.find((b) => b.name === 'Corporate' && b.openingMissing));
const mockCash = mockAcct.balances.find((b) => b.name === 'Cash');
assert.ok(mockCash.spent > 0);
assert.strictEqual(mockCash.balance, 0 - mockCash.spent);

const mockBud = map.mockNotionBudgetsSnapshot(now);
assert.strictEqual(mockBud.source, 'mock');
assert.ok(String(mockBud.warning).includes('3f8d31df-d13d-49a2-a9ac-f5b8489f737f'));
assert.strictEqual(mockBud.monthKey, '2026-09');
const mockFood = mockBud.progress.find((p) => p.category === 'Food');
assert.strictEqual(mockFood.spent, 670 + 2496);
assert.strictEqual(mockFood.left, 15000 - (670 + 2496));
const mockStay = mockBud.progress.find((p) => p.category === 'Stay');
assert.strictEqual(mockStay.spent, 1327 + 1139, 'this-month Stay only');

const handleAccounts = require('../api/accounts');
const handleBudgets = require('../api/budgets');

function fakeRes(onEnd) {
  return {
    statusCode: 0,
    headers: {},
    setHeader: function (k, v) { this.headers[k] = v; },
    end: function (body) { onEnd(this, body); },
  };
}

function call(handler) {
  return new Promise(function (resolve, reject) {
    handler(
      { method: 'GET' },
      fakeRes(function (res, body) {
        try {
          resolve({ res: res, json: JSON.parse(body) });
        } catch (err) {
          reject(err);
        }
      })
    ).catch(reject);
  });
}

Promise.all([call(handleAccounts), call(handleBudgets)])
  .then(function (results) {
    const accountsRes = results[0];
    const budgetsRes = results[1];
    assert.strictEqual(accountsRes.res.statusCode, 200);
    assert.strictEqual(accountsRes.json.source, 'mock');
    assert.ok(Array.isArray(accountsRes.json.balances) && accountsRes.json.balances.length >= 5);
    assert.strictEqual(budgetsRes.res.statusCode, 200);
    assert.strictEqual(budgetsRes.json.source, 'mock');
    assert.ok(Array.isArray(budgetsRes.json.progress) && budgetsRes.json.progress.length === 10);
    assert.ok(budgetsRes.json.monthKey);
    console.log('ok — notion accounts + budgets mappers, balances, left-this-month, mock APIs');
  })
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });
