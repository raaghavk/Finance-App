'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const map = require('../lib/notion/map');
const { localAccountBalances } = require('../lib/local-ledger');

assert.strictEqual(map.SAMPLE_NOTION_EXPENSES.length, 24);
assert.strictEqual(map.DEMO_SEED_ID, 'notion-snapshot-2026-09');
assert.ok(map.SAMPLE_NOTION_EXPENSES.every((e) => e.payee));
assert.ok(map.SAMPLE_NOTION_EXPENSES.every((e) => e.location));

const now = new Date('2026-09-14T12:00:00');
const seeded = map.seedZenithStoreFromNotionSnapshot({
  version: 1,
  user: { locale: 'en' },
  transactions: [],
}, now);

assert.strictEqual(seeded.demoSeed, map.DEMO_SEED_ID);
assert.strictEqual(seeded.onboardingComplete, true);
assert.strictEqual(seeded.user.name, 'Raaghav');
assert.strictEqual(seeded.openingCash, 15000);
assert.strictEqual(seeded.transactions.length, 24);
assert.ok(seeded.accounts.every((a) => ['cash', 'idfc', 'kamlesh'].indexOf(a.id) >= 0));
assert.ok(!seeded.accounts.some((a) => /inactive/i.test(a.name)));
assert.ok(seeded.transactions.some((tx) => tx.merchant === 'The Hazelnut Factory' && tx.amount === 700));
assert.ok(seeded.transactions.some((tx) => tx.merchant === 'Mangi Ferra @ Surya Kaiser Palace'));
assert.ok(seeded.transactions.some((tx) => tx.merchant === 'PVR snacks' && tx.payee === 'PVR INOX'));
const airlines = seeded.transactions.find((tx) => /Vietnam Airlines/.test(tx.merchant));
assert.strictEqual(airlines.amount, null);
assert.strictEqual(airlines.accountId, '');

const bals = localAccountBalances(seeded);
const cash = bals.find((b) => b.id === 'cash');
const idfc = bals.find((b) => b.id === 'idfc');
const kamlesh = bals.find((b) => b.id === 'kamlesh');
assert.strictEqual(cash.opening, 15000);
assert.strictEqual(cash.spent, 15653);
assert.strictEqual(cash.balance, 15000 - 15653);
assert.strictEqual(idfc.openingMissing, true);
assert.strictEqual(kamlesh.spendOnly, true);
assert.strictEqual(kamlesh.balance, null);
assert.strictEqual(kamlesh.spent, 1139);

assert.ok(!seeded.categories.some((c) => c.id === 'grp-ledger' && c.type === 'expense'));
const foodBudget = seeded.budgets.find((b) => b.categoryId === 'food');
assert.strictEqual(foodBudget.limit, 15000);
assert.strictEqual(foodBudget.monthKey, '2026-09');

const root = path.join(__dirname, '..');
const ctx = {
  Date, JSON, Math, Number, String, Object, Array, parseFloat, parseInt, isNaN, Set,
  localStorage: { getItem: () => null, setItem: () => {} },
  seedZenithStoreFromNotionSnapshot: map.seedZenithStoreFromNotionSnapshot,
};
ctx.window = ctx;
vm.runInNewContext(fs.readFileSync(path.join(root, 'state.js'), 'utf8'), ctx);

const first = ctx.createInitialStore();
assert.strictEqual(first.demoSeed, map.DEMO_SEED_ID);
assert.strictEqual(first.transactions.length, 24);
assert.ok(first.onboardingComplete);

const kept = ctx.maybeApplyDemoSeed({
  demoSeed: '',
  transactions: [{ id: 'mine', amount: 10, type: 'expense', date: '2026-09-01', accountId: 'cash' }],
  user: { name: 'Tester' },
});
assert.strictEqual(kept.transactions.length, 1);
assert.strictEqual(kept.user.name, 'Tester');

const emptyExisting = ctx.maybeApplyDemoSeed({
  demoSeed: '',
  transactions: [],
  user: { name: '', locale: 'en' },
});
assert.strictEqual(emptyExisting.demoSeed, map.DEMO_SEED_ID);
assert.strictEqual(emptyExisting.transactions.length, 24);

console.log('ok — demo seed from Notion snapshot (24 expenses, cash float, payee/location)');
