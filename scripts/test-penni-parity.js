'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { ZENITH_LIGHT, ZENITH_DARK, applyZenithTheme } = require('../lib/theme');

const root = path.join(__dirname, '..');
const ctx = {
  Date, JSON, Math, Number, String, Object, Array, parseFloat, parseInt, isNaN, Set,
  localStorage: { getItem: () => null, setItem: () => {} },
};
ctx.window = ctx;
vm.runInNewContext(fs.readFileSync(path.join(root, 'state.js'), 'utf8'), ctx);

const store = ctx.createInitialStore();
assert.ok(Array.isArray(store.goals));
assert.ok(Array.isArray(store.recurring));
assert.ok(Array.isArray(store.trips));
assert.strictEqual(store.activeTripId, null);
assert.strictEqual(store.settings.theme, 'light');
assert.strictEqual(store.settings.lock.enabled, false);
assert.strictEqual(store.settings.pro, false);

const loaded = ctx.normalizeState({
  version: 1,
  user: { name: 'R', locale: 'en' },
  transactions: [],
});
assert.ok(loaded.settings);
assert.ok(Array.isArray(loaded.goals) && loaded.goals.length === 0);

const goal = ctx.normalizeGoal({ name: 'Emergency', target: 100000, saved: 20000 }, 0);
assert.strictEqual(goal.name, 'Emergency');
assert.strictEqual(goal.target, 100000);

let withGoal = { ...store, goals: [goal] };
assert.ok(withGoal.goals[0].saved === 20000);

const rec = ctx.normalizeRecurring({
  name: 'Netflix', amount: 649, categoryId: 'entertainment', accountId: 'bank',
  cadence: 'monthly', nextOn: '2026-08-01', active: true,
}, 0);
const matured = ctx.materializeRecurring({
  ...store,
  recurring: [rec],
  transactions: [],
  accounts: store.accounts,
}, '2026-09-11');
assert.ok(matured.transactions.length >= 1);
assert.ok(matured.transactions.every((tx) => tx.recurringId === rec.id));
assert.ok(matured.recurring[0].nextOn > '2026-09-11');

const scored = ctx.healthScore({
  ...store,
  monthlyIncome: 100000,
  budgets: [
    { categoryId: 'grp-food', monthKey: '2026-09', limit: 10000 },
  ],
  transactions: [
    { type: 'expense', categoryId: 'kirana', amount: 4000, date: '2026-09-02', accountId: 'bank' },
    { type: 'income', categoryId: 'salary', amount: 80000, date: '2026-09-01', accountId: 'bank' },
  ],
  goals: [{ id: 'g1', name: 'Fund', target: 100000, saved: 50000 }],
}, '2026-09');
assert.ok(scored.score >= 50 && scored.score <= 100);
assert.ok(['strong', 'ok', 'watch', 'tight'].includes(scored.label));

const insights = ctx.monthInsights({
  ...store,
  monthlyIncome: 80000,
  transactions: [
    { type: 'expense', categoryId: 'kirana', amount: 2000, date: '2026-09-08', accountId: 'cash' },
    { type: 'expense', categoryId: 'kirana', amount: 5000, date: '2026-08-08', accountId: 'cash' },
  ],
}, '2026-09');
assert.strictEqual(insights.spent, 2000);
assert.strictEqual(insights.prevSpent, 5000);
assert.ok(insights.delta < 0);

assert.strictEqual(ctx.hashPin('1234'), ctx.hashPin('1234'));
assert.notStrictEqual(ctx.hashPin('1234'), ctx.hashPin('0000'));
assert.ok(ctx.pinLooksValid('1234'));
assert.ok(!ctx.pinLooksValid('12'));
assert.ok(ctx.checkPin({ settings: { lock: { pinHash: ctx.hashPin('2580') } } }, '2580'));
assert.ok(!ctx.checkPin({ settings: { lock: { pinHash: ctx.hashPin('2580') } } }, '1111'));

assert.strictEqual(ctx.zenithIsPro({ settings: { pro: false } }, { search: '' }), false);
assert.strictEqual(ctx.zenithIsPro({ settings: { pro: true } }, { search: '' }), true);
assert.strictEqual(ctx.zenithIsPro({ settings: { pro: false } }, { search: '?pro=1' }), true);

const emptyTravel = ctx.createInitialStore();
assert.strictEqual(ctx.canStartTrip(emptyTravel), true);
const afterDemo = {
  ...emptyTravel,
  trips: [ctx.normalizeTrip({ id: 't1', countryCode: 'THB', status: 'ended', expenses: [] }, 0)],
  activeTripId: null,
};
assert.strictEqual(ctx.canStartTrip(afterDemo), false);
assert.strictEqual(ctx.canStartTrip({ ...afterDemo, settings: { ...afterDemo.settings, pro: true } }), true);

const demoTrip = ctx.normalizeTrip({
  id: 't2', countryCode: 'USD', status: 'active',
  expenses: Array.from({ length: 8 }, (_, i) => ({ id: 'e' + i, merchant: 'x', cat: 'Food', amount: 1, inr: 83, date: '2026-09-01' })),
}, 0);
assert.strictEqual(ctx.canAddTripExpense(emptyTravel, demoTrip), false);
assert.strictEqual(ctx.canAddTripExpense({ ...emptyTravel, settings: { ...emptyTravel.settings, pro: true } }, demoTrip), true);

const parsed = ctx.parseStorePayload(JSON.stringify({
  version: 1,
  goals: [{ name: 'Goa', target: 45000, saved: 1000 }],
  settings: { theme: 'dark', pro: true },
}));
assert.strictEqual(parsed.goals[0].name, 'Goa');
assert.strictEqual(parsed.settings.theme, 'dark');
assert.strictEqual(parsed.settings.pro, true);

const tokens = applyZenithTheme('dark', {
  documentElement: { style: { setProperty() {} }, dataset: {} },
  body: { style: {} },
  querySelector() { return { setAttribute() {} }; },
});
assert.strictEqual(tokens.page, ZENITH_DARK.page);
assert.strictEqual(ZENITH_LIGHT.accent, '#2563EB');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const zenithHtml = fs.readFileSync(path.join(root, 'Zenith.html'), 'utf8');
assert.match(html, /lib\/theme\.js/);
assert.match(html, /LockScreen\.jsx/);
assert.match(html, /Paywall\.jsx/);
assert.match(zenithHtml, /lib\/theme\.js/);
assert.match(zenithHtml, /LockScreen\.jsx/);

const home = fs.readFileSync(path.join(root, 'components/Home.jsx'), 'utf8');
assert.match(home, /HealthScoreCard/);
assert.match(home, /GoalsPeek/);
assert.match(home, /spentOnAccount/);

const search = fs.readFileSync(path.join(root, 'components/Search.jsx'), 'utf8');
assert.match(search, /fromDate/);
assert.match(search, /toDate/);
assert.match(search, /grouped/);

const goals = fs.readFileSync(path.join(root, 'components/SavingsGoals.jsx'), 'utf8');
assert.match(goals, /onSaveGoal/);
assert.match(goals, /onContribute/);
assert.doesNotMatch(goals, /GOALS_DATA/);

const recUi = fs.readFileSync(path.join(root, 'components/Recurring.jsx'), 'utf8');
assert.match(recUi, /onSaveRule/);
assert.doesNotMatch(recUi, /RECURRING_DATA/);

const reports = fs.readFileSync(path.join(root, 'components/Reports.jsx'), 'utf8');
assert.match(reports, /monthInsights/);
assert.doesNotMatch(reports, /monthData = \[/);

const travel = fs.readFileSync(path.join(root, 'components/TravelMode.jsx'), 'utf8');
assert.match(travel, /canStartTrip/);
assert.match(travel, /onNeedPro/);
assert.match(travel, /demoBanner/);

const profile = fs.readFileSync(path.join(root, 'components/Profile.jsx'), 'utf8');
assert.match(profile, /darkMode/);
assert.match(profile, /appLock/);
assert.match(profile, /backupJson/);
assert.match(profile, /zenithPro/);
assert.doesNotMatch(profile, /travelLater/);

const plan = fs.readFileSync(path.join(root, 'components/Plan.jsx'), 'utf8');
assert.match(plan, /insights/);
assert.match(plan, /travel/);

const app = fs.readFileSync(path.join(root, 'app.jsx'), 'utf8');
assert.match(app, /materializeRecurring/);
assert.match(app, /LockScreen/);
assert.match(app, /PaywallScreen/);
assert.match(app, /TravelScreen/);
assert.match(app, /saveGoal/);
assert.match(app, /startTrip/);
assert.match(app, /exportJson/);

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.match(pkg.scripts.test, /test-penni-parity/);

console.log('penni parity: goals, recurring, health, insights, lock, theme, travel demo/pro ok');
