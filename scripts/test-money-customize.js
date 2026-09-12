'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { localAccountBalances } = require('../lib/local-ledger');
const { zenithSafeAreaFallback, zenithApplyIosSafeArea } = require('../lib/ios-safe-area');

const root = path.join(__dirname, '..');
const add = fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8');
const profile = fs.readFileSync(path.join(root, 'components/Profile.jsx'), 'utf8');
const budget = fs.readFileSync(path.join(root, 'components/BudgetSetup.jsx'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const zenithHtml = fs.readFileSync(path.join(root, 'Zenith.html'), 'utf8');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const catsMgr = fs.readFileSync(path.join(root, 'components/CategoriesManager.jsx'), 'utf8');
const acctsMgr = fs.readFileSync(path.join(root, 'components/AccountsManager.jsx'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.jsx'), 'utf8');

assert.doesNotMatch(add, /\['UPI', 'Card', 'Cash'\]/);
assert.match(add, /overflowY: 'auto'/);
assert.match(add, /--zenith-pad-top/);
assert.match(add, /newAccount/);
assert.match(add, /newCategory/);
assert.match(add, /subcategory/);
assert.match(html, /MoneyForms\.jsx/);
assert.match(html, /ios-safe-area\.js/);
assert.match(html, /AccountsManager\.jsx/);
assert.match(html, /CategoriesManager\.jsx/);
assert.match(html, /--zenith-safe-top/);
assert.match(html, /100dvh/);
assert.match(html, /Loading Zenith/);
assert.doesNotMatch(html, /-webkit-fill-available/);
assert.doesNotMatch(html, /html, body \{/);
assert.match(zenithHtml, /ios-safe-area\.js/);
assert.match(profile, /manageAccounts/);
assert.match(profile, /manageCategories/);
assert.match(profile, /t\(locale, 'edit'\)/);
assert.match(profile, /ZenithScreenHeader/);
assert.match(profile, /--zenith-pad-top/);
assert.match(budget, /accountsTitle/);
assert.match(budget, /onSetAccountBudget/);
assert.match(catsMgr, /subcategory/);
assert.match(catsMgr, /addSubcategory/);
const moneyForms = fs.readFileSync(path.join(root, 'components/MoneyForms.jsx'), 'utf8');
assert.match(moneyForms, /EmojiPicker/);
assert.match(moneyForms, /pickAnyEmoji/);
assert.match(moneyForms, /pickEmojiHint/);
assert.match(acctsMgr, /addAccount/);
assert.match(app, /AccountsManagerScreen/);
assert.match(app, /CategoriesManagerScreen/);
assert.match(app, /reorderAccounts/);

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

const store = ctx.createInitialStore();
assert.ok(store.categories.some((c) => c.id === 'grp-food'));
assert.strictEqual(store.categories.find((c) => c.id === 'kirana').parentId, 'grp-food');
assert.strictEqual(store.showSubcategories, true);
assert.ok(ctx.parentCategories(store.categories, 'expense').some((c) => c.id === 'grp-food'));
assert.ok(ctx.childCategories(store.categories, 'grp-food').some((c) => c.id === 'kirana'));

store.transactions = [{ type: 'expense', categoryId: 'kirana', amount: 120, date: '2026-09-08' }];
assert.strictEqual(ctx.spentInCategory(store, 'kirana', '2026-09'), 120);
assert.strictEqual(ctx.spentInCategory(store, 'grp-food', '2026-09'), 120);

const moved = ctx.moveIndex([{ id: 'a' }, { id: 'b' }, { id: 'c' }], 0, 2);
assert.deepStrictEqual(moved.map((x) => x.id), ['b', 'c', 'a']);

const migrated = ctx.withCategoryTree([
  { id: 'kirana', name: 'Kirana', type: 'expense', group: 'food' },
  { id: 'salary', name: 'Salary', type: 'income', group: 'money' },
]);
assert.ok(migrated.some((c) => c.id === 'grp-food'));
assert.strictEqual(migrated.find((c) => c.id === 'kirana').parentId, 'grp-food');
assert.strictEqual(migrated.find((c) => c.id === 'salary').parentId, null);

const iphone14promax = zenithSafeAreaFallback({
  navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', standalone: true },
  matchMedia: () => ({ matches: true }),
  screen: { width: 430, height: 932 },
  document: { documentElement: { style: { setProperty() {} }, dataset: {} } },
});
assert.strictEqual(iphone14promax.top, 59);
assert.strictEqual(iphone14promax.bottom, 34);

const simulated = zenithSafeAreaFallback({
  location: { search: '?iphone=1' },
  navigator: { userAgent: 'Mozilla/5.0' },
  screen: { width: 1280, height: 800 },
  document: { documentElement: { style: { setProperty() {} }, dataset: {} } },
});
assert.strictEqual(simulated.top, 59);

const props = {};
const applied = zenithApplyIosSafeArea({
  location: { search: '?iphone=1' },
  navigator: { userAgent: 'Mozilla/5.0' },
  screen: { width: 1280, height: 800 },
  innerHeight: 932,
  document: {
    documentElement: { style: { setProperty(k, v) { props[k] = v; } }, dataset: {} },
    body: { style: {} },
    getElementById() { return { style: {} }; },
  },
});
assert.strictEqual(applied.top, 59);
assert.strictEqual(props['--zenith-safe-top'], '59px');
assert.strictEqual(props['--zenith-pad-top'], '73px');

console.log('custom accounts, categories, account budgets, add layout, iPhone safe area ok');
