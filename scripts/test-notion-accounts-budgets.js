'use strict';

const assert = require('assert');
const map = require('../lib/notion/map');

const accountPage = {
  id: 'acct-1',
  url: 'https://notion.so/acct-1',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'IDFC (UPI/debit)' }] },
    Notes: { type: 'rich_text', rich_text: [{ plain_text: 'IDFC First savings' }] },
    'Opening balance': { type: 'number', number: 0 },
  },
};

const mappedAcct = map.mapNotionPageToAccount(accountPage);
assert.strictEqual(mappedAcct.id, 'acct-1');
assert.strictEqual(mappedAcct.name, 'IDFC (UPI/debit)');
assert.strictEqual(mappedAcct.notes, 'IDFC First savings');
assert.strictEqual(mappedAcct.openingBalance, 0);

const emptyOpening = map.mapNotionPageToAccount({
  id: 'acct-empty',
  url: '',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'IDFC (UPI/debit)' }] },
    Notes: { type: 'rich_text', rich_text: [] },
    'Opening balance': { type: 'number', number: null },
  },
});
assert.strictEqual(emptyOpening.openingBalance, null);
assert.strictEqual(map.asNumber({ type: 'number', number: 0 }), 0);
assert.strictEqual(map.asNumber({ type: 'number', number: null }), null);

const cashLive = map.mapNotionPageToAccount({
  id: 'acct-cash',
  url: '',
  properties: {
    Name: { type: 'title', title: [{ plain_text: 'Cash' }] },
    'Opening balance': { type: 'number', number: 15000 },
  },
});
assert.strictEqual(cashLive.openingBalance, 15000);

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
assert.deepStrictEqual(map.EXPENSE_ACCOUNTS, ['Cash', 'IDFC (UPI/debit)', 'Kamlesh UPI']);
assert.ok(map.isInactiveAccountName('(inactive) UPI'));
assert.ok(map.isInactiveAccountName('Primary debit'));
assert.ok(map.isInactiveAccountName('Corporate'));
assert.ok(map.isActiveWalletName('Cash'));
assert.ok(map.isActiveWalletName('IDFC (UPI/debit)'));
assert.ok(map.isSpendOnlyAccount('Kamlesh UPI'));
assert.ok(!map.isActiveWalletName('(inactive) Corporate'));
assert.ok(map.SAMPLE_NOTION_ACCOUNTS.length >= 3);
assert.ok(map.SAMPLE_NOTION_BUDGETS.length === 10);

const now = new Date('2026-09-08T12:00:00');
const expenses = [
  { name: 'Tiffin', amount: 220, date: '2026-09-05', category: 'Food', account: 'Kamlesh UPI' },
  { name: 'Metro', amount: 60, date: '2026-09-04', category: 'Transport', account: 'IDFC (UPI/debit)' },
  { name: 'Dinner', amount: 2400, date: '2026-09-03', category: 'Food', account: 'IDFC (UPI/debit)' },
  { name: 'Null fare', amount: null, date: '2026-09-02', category: 'Transport', account: 'IDFC (UPI/debit)' },
  { name: 'August stay', amount: 5000, date: '2026-08-12', category: 'Stay', account: 'Cash' },
];

const accounts = [
  { id: 'a-idfc', url: '', name: 'IDFC (UPI/debit)', notes: 'pending', openingBalance: 0 },
  { id: 'a-kamlesh', url: '', name: 'Kamlesh UPI', notes: 'spend only', openingBalance: 0 },
  { id: 'a-cash', url: '', name: 'Cash', notes: '', openingBalance: 15000 },
  { id: 'a-inactive', url: '', name: '(inactive) UPI', notes: '', openingBalance: 0 },
  { id: 'a-legacy', url: '', name: 'Primary credit', notes: '', openingBalance: 0 },
];

const balances = map.buildAccountBalances(accounts, expenses);
assert.strictEqual(balances.length, 3, 'inactive and legacy wallets filtered');
assert.ok(!balances.find((b) => b.name.indexOf('(inactive)') === 0));
assert.ok(!balances.find((b) => b.name === 'Primary credit'));

const idfc = balances.find((b) => b.name === 'IDFC (UPI/debit)');
assert.ok(idfc);
assert.strictEqual(idfc.spent, 60 + 2400, 'null Amount excluded from account delta');
assert.strictEqual(idfc.openingMissing, true, 'IDFC opening 0 is still pending');
assert.strictEqual(idfc.balance, 0 - 2460);
assert.strictEqual(idfc.spendOnly, false);

const kamlesh = balances.find((b) => b.name === 'Kamlesh UPI');
assert.strictEqual(kamlesh.spendOnly, true);
assert.strictEqual(kamlesh.spent, 220);
assert.strictEqual(kamlesh.balance, null, 'Kamlesh is spend-only — no wallet balance');
assert.strictEqual(kamlesh.openingMissing, false);

const cash = balances.find((b) => b.name === 'Cash');
assert.strictEqual(cash.spent, 5000, 'account balance uses all tagged spend, not only this month');
assert.strictEqual(cash.balance, 15000 - 5000);
assert.strictEqual(cash.openingMissing, false);

const withGhost = map.buildAccountBalances(
  [{ id: 'only-cash', url: '', name: 'Cash', notes: '', openingBalance: 15000 }],
  [
    { name: 'Corp lunch', amount: 900, date: '2026-09-01', account: 'Corporate' },
    { name: 'Online', amount: 80, date: '2026-09-01', account: 'Kamlesh UPI' },
  ]
);
assert.ok(!withGhost.find((b) => b.name === 'Corporate'), 'legacy spend does not create a wallet');
const ghostKamlesh = withGhost.find((b) => b.name === 'Kamlesh UPI');
assert.ok(ghostKamlesh && ghostKamlesh.spendOnly && ghostKamlesh.spent === 80);

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
assert.strictEqual(mockAcct.balances.length, 3);
assert.ok(!mockAcct.balances.find((b) => /inactive/i.test(b.name)));
const mockCash = mockAcct.balances.find((b) => b.name === 'Cash');
assert.strictEqual(mockCash.openingBalance, 15000);
assert.ok(mockCash.spent > 0);
assert.strictEqual(mockCash.balance, 15000 - mockCash.spent);
const mockIdfc = mockAcct.balances.find((b) => b.name === 'IDFC (UPI/debit)');
assert.strictEqual(mockIdfc.openingMissing, true);
const mockKamlesh = mockAcct.balances.find((b) => b.name === 'Kamlesh UPI');
assert.strictEqual(mockKamlesh.spendOnly, true);
assert.strictEqual(mockKamlesh.balance, null);
assert.ok(mockKamlesh.spent > 0);

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
    assert.ok(Array.isArray(accountsRes.json.balances) && accountsRes.json.balances.length === 3);
    assert.ok(accountsRes.json.balances.every((b) => map.isActiveWalletName(b.name)));
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
