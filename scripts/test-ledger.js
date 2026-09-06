#!/usr/bin/env node
// Node checks for Zenith v2 ledger helpers (no browser).
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'state.js'), 'utf8');
const store = { data: {} };
const ctx = {
  window: {},
  localStorage: {
    getItem(k) { return store.data[k] || null; },
    setItem(k, v) { store.data[k] = String(v); },
  },
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(code, ctx);

const W = ctx;
let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok  ', msg);
  }
}

const v1 = {
  version: 1,
  onboardingComplete: true,
  user: { name: 'Riya', locale: 'en', currency: 'INR' },
  openingCash: 2400,
  monthlyIncome: 0,
  accounts: [
    { id: 'cash', name: 'Cash', nameHi: 'नकद' },
    { id: 'bank', name: 'Bank', nameHi: 'बैंक' },
    { id: 'card', name: 'Credit card', nameHi: 'क्रेडिट कार्ड' },
  ],
  categories: W.DEFAULT_CATEGORIES,
  transactions: [
    { id: 'tx-1', type: 'expense', amount: 150, merchant: 'Zomato', categoryId: 'tiffin', accountId: 'bank', method: 'UPI', date: '2026-09-01' },
  ],
  budgets: [],
  alertsRead: {},
};

const migrated = W.migrateStore(v1);
assert(migrated.version === 2, 'migrates to version 2');
assert(migrated.accounts.find((a) => a.id === 'cash').type === 'cash', 'cash account typed');
assert(migrated.accounts.find((a) => a.id === 'cash').opening === 2400, 'opening cash copied onto cash account');
assert(migrated.merchants.some((m) => m.name === 'Zomato'), 'seeds merchant from old txn');
assert(migrated.transactions[0].merchantId, 'backfills merchantId');
assert(W.railForAccount(migrated.accounts.find((a) => a.id === 'bank')) === 'UPI', 'bank rail is UPI');
assert(W.railForAccount(migrated.accounts.find((a) => a.id === 'card')) === 'Card', 'card rail is Card');
assert(W.railForAccount(migrated.accounts.find((a) => a.id === 'cash')) === 'Cash', 'cash rail is Cash');

const s = {
  ...migrated,
  transactions: [
    { id: 'a', type: 'expense', amount: 200, accountId: 'cash', merchant: 'Chai', categoryId: 'chai', date: '2026-09-02' },
    { id: 'b', type: 'income', amount: 1000, accountId: 'bank', merchant: 'Salary', categoryId: 'salary', date: '2026-09-02' },
    { id: 'c', type: 'transfer', amount: 300, accountId: 'bank', toAccountId: 'cash', merchant: 'Bank → Cash', categoryId: 'transfer', date: '2026-09-02' },
    { id: 'd', type: 'expense', amount: 500, accountId: 'card', merchant: 'Amazon', categoryId: 'shopping', date: '2026-09-02' },
  ],
};
assert(W.accountBalance(s, 'cash') === 2400 - 200 + 300, 'cash balance opening - expense + transfer in');
assert(W.accountBalance(s, 'bank') === 0 + 1000 - 300, 'bank balance income - transfer out');
assert(W.accountBalance(s, 'card') === 500, 'card outstanding increases on spend');

const p1 = W.parseVoiceUtterance('Zomato pe 349');
assert(p1.amount === 349 && /zomato/i.test(p1.merchant), 'parses Hinglish amount + merchant');
const p2 = W.parseVoiceUtterance('spent 200 on chai');
assert(p2.amount === 200 && /chai/i.test(p2.merchant), 'parses English spent on');
assert(W.hintCategoryFromText('zomato lunch', W.DEFAULT_CATEGORIES) === 'tiffin', 'hints tiffin from zomato');

const up = W.upsertMerchantInStore(s, { name: 'Zomato', upiVpa: 'zomato@okicici', lastAccountId: 'bank' });
assert(up.merchant && up.merchant.upiVpa === 'zomato@okicici', 'upserts merchant UPI');

if (failed) {
  console.error('\n' + failed + ' failed');
  process.exit(1);
}
console.log('\nall ledger checks passed');
