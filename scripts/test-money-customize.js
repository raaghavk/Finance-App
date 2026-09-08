'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { localAccountBalances } = require('../lib/local-ledger');

const root = path.join(__dirname, '..');
const add = fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8');
const profile = fs.readFileSync(path.join(root, 'components/Profile.jsx'), 'utf8');
const budget = fs.readFileSync(path.join(root, 'components/BudgetSetup.jsx'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

assert.doesNotMatch(add, /\['UPI', 'Card', 'Cash'\]/);
assert.match(add, /overflowY: 'auto'/);
assert.match(add, /--zenith-pad-top/);
assert.match(add, /newAccount/);
assert.match(add, /newCategory/);
assert.match(html, /MoneyForms\.jsx/);
assert.match(profile, /addAccount/);
assert.match(profile, /addCategory/);
assert.match(budget, /accountsTitle/);
assert.match(budget, /onSetAccountBudget/);

assert.match(readme, /zenith-raaghavks-projects\.vercel\.app/);
assert.doesNotMatch(readme, /ivory-one/);
assert.strictEqual((readme.match(/https:\/\/zenith[^\s)]+/g) || []).length, 1);

const ctx = {
  Date, JSON, Math, Number, String, Object, Array, parseFloat, parseInt, isNaN,
  localStorage: { getItem: () => null, setItem: () => {} },
};
ctx.window = ctx;
vm.runInNewContext(fs.readFileSync(path.join(root, 'state.js'), 'utf8'), ctx);

assert.strictEqual(ctx.methodForAccount({ id: 'cash', name: 'Cash' }), 'Cash');
assert.strictEqual(ctx.methodForAccount({ id: 'bank', name: 'Bank' }), 'UPI');
assert.strictEqual(ctx.methodForAccount({ id: 'card', name: 'Credit card' }), 'Card');
assert.strictEqual(
  ctx.accountBudgetLimit({ budgets: [{ accountId: 'bank', monthKey: '2026-09', limit: 20000 }] }, 'bank', '2026-09'),
  20000
);
assert.strictEqual(
  ctx.totalBudgetLimit({ budgets: [
    { categoryId: 'kirana', monthKey: '2026-09', limit: 1000 },
    { accountId: 'bank', monthKey: '2026-09', limit: 20000 },
  ] }, '2026-09'),
  1000
);
const id = ctx.newMoneyId('acct', 'HDFC Savings');
assert.match(id, /^acct-hdfcsavings-/);

const bals = localAccountBalances({
  openingCash: 0,
  accounts: [{ id: 'bank', name: 'Bank', opening: 80000 }, { id: 'hdfc', name: 'HDFC', opening: 5000 }],
  transactions: [{ accountId: 'hdfc', type: 'expense', amount: 500 }],
});
assert.strictEqual(bals.find((r) => r.id === 'bank').balance, 80000);
assert.strictEqual(bals.find((r) => r.id === 'hdfc').balance, 4500);

console.log('custom accounts, categories, account budgets, add layout ok');
