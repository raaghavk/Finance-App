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
assert.ok(Array.isArray(store.holdings));
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
assert.strictEqual(ctx.canStartTrip(afterDemo), true);
assert.strictEqual(ctx.canStartTrip({ ...afterDemo, settings: { ...afterDemo.settings, pro: true } }), true);
const oneLive = {
  ...emptyTravel,
  trips: [ctx.normalizeTrip({ id: 'live-1', countryCode: 'THB', status: 'active', expenses: [] }, 0)],
  activeTripId: 'live-1',
};
assert.strictEqual(ctx.canStartTrip(oneLive), false);

const tripA = ctx.normalizeTrip({ id: 'live-a', countryCode: 'THB', status: 'active', name: 'Bangkok', budgetINR: 50000, startDate: '2026-09-01', endDate: '2026-09-20', expenses: [{ id: 'e1', merchant: 'Pad', cat: 'Food', amount: 100, inr: 2500, date: '2026-09-02' }] }, 0);
const tripB = ctx.normalizeTrip({ id: 'live-b', countryCode: 'USD', status: 'active', name: 'NYC', budgetINR: 80000, startDate: '2026-10-01', endDate: '2026-10-10', expenses: [] }, 1);
const twoLive = { ...emptyTravel, settings: { ...emptyTravel.settings, pro: true }, trips: [tripA, tripB], activeTripId: 'live-a' };
assert.strictEqual(ctx.liveTrips(twoLive).length, 2);
assert.strictEqual(ctx.activeTrip(twoLive).id, 'live-a');
assert.strictEqual(ctx.canStartTrip(twoLive), true);
assert.strictEqual(ctx.canStartTrip({ ...twoLive, settings: { ...emptyTravel.settings, pro: false } }), false);
assert.strictEqual(ctx.tripPhase(tripA, '2026-09-11'), 'live');
assert.strictEqual(ctx.tripPhase(tripB, '2026-09-11'), 'planned');
assert.strictEqual(ctx.tripBudgetLeft(tripA), 47500);
assert.ok(ctx.tripLeftoverPerDay(tripA, '2026-09-11') > 0);

const withBills = {
  ...emptyTravel,
  monthlyIncome: 100000,
  openingCash: 0,
  recurring: [ctx.normalizeRecurring({ name: 'Rent', amount: 25000, nextOn: '2026-09-20', type: 'expense', active: true }, 0)],
  goals: [ctx.normalizeGoal({ name: 'Fund', target: 30000, saved: 0, due: '2026-12-11' }, 0)],
};
assert.strictEqual(ctx.upcomingBillsThisMonth(withBills, '2026-09', '2026-09-11'), 25000);
assert.strictEqual(ctx.leftoverAfterBills(withBills, '2026-09', '2026-09-11'), 75000);
assert.ok(ctx.monthlyGoalNeed(withBills, '2026-09-11') > 0);
assert.ok(ctx.leftoverAfterCommitments(withBills, '2026-09', '2026-09-11') < 75000);
assert.strictEqual(ctx.dueSoonRecurring(withBills, '2026-09-18', 7).length, 1);

const envelope = {
  ...emptyTravel,
  budgets: [
    { categoryId: 'grp-food', monthKey: '2026-09', limit: 10000 },
    { categoryId: 'grp-move', monthKey: '2026-09', limit: 2000 },
  ],
  transactions: [{ type: 'expense', categoryId: 'kirana', amount: 2000, date: '2026-09-02', accountId: 'cash' }],
};
const moved = ctx.applyBudgetMove(envelope, 'grp-food', 'grp-move', 3000, '2026-09');
assert.strictEqual(ctx.budgetLimit(moved, 'grp-food', '2026-09'), 7000);
assert.strictEqual(ctx.budgetLimit(moved, 'grp-move', '2026-09'), 5000);

const withHold = ctx.normalizeState({
  ...emptyTravel,
  accounts: [{ id: 'cash', name: 'Cash', opening: 10000 }],
  holdings: [{ name: 'Gold', kind: 'asset', amount: 50000 }, { name: 'CC due', kind: 'liability', amount: 4000 }],
  transactions: [],
});
const nw = ctx.netWorthSnapshot(withHold);
assert.strictEqual(nw.liabTotal, 4000);
assert.ok(nw.net >= 56000);

const cal = ctx.cashflowMonth({
  ...emptyTravel,
  transactions: [{ type: 'expense', amount: 500, date: '2026-09-11', accountId: 'cash', categoryId: 'kirana' }],
  recurring: [ctx.normalizeRecurring({ name: 'Netflix', amount: 649, nextOn: '2026-09-12', type: 'expense' }, 0)],
}, '2026-09');
assert.strictEqual(cal.byDay[11].spend, 500);
assert.strictEqual(cal.byDay[12].dues[0].name, 'Netflix');

const withPeople = ctx.normalizeState({
  ...emptyTravel,
  people: [{ id: 'p-arjun', name: 'Arjun' }],
  ious: [{ id: 'i1', personId: 'p-arjun', amount: 800, note: 'Dinner', date: '2026-09-10', settled: false }],
  transactions: [
    { type: 'expense', amount: 1200, date: '2026-09-08', accountId: 'cash', categoryId: 'kirana', merchant: 'DMart' },
    { type: 'expense', amount: 400, date: '2026-09-01', accountId: 'cash', categoryId: 'kirana', merchant: 'DMart' },
  ],
  recurring: [ctx.normalizeRecurring({ name: 'Netflix', amount: 649, cadence: 'monthly', type: 'expense', active: true }, 0)],
});
assert.strictEqual(ctx.personBalance(withPeople, 'p-arjun'), 800);
assert.strictEqual(ctx.peopleSnapshot(withPeople).owedToYou, 800);
const shares = ctx.equalSplitShares(100, 3);
assert.strictEqual(shares.length, 3);
assert.strictEqual(Math.round(shares.reduce((s, n) => s + n, 0) * 100), 10000);
assert.strictEqual(ctx.buildEqualSplitIous(['p-arjun', 'p-priya'], 2400, 'Dinner', '2026-09-13').length, 2);
assert.ok(ctx.weekRecap(withPeople, '2026-09-13').spent >= 1200);
assert.strictEqual(ctx.monthlyRecurringBurn(withPeople), 649);
assert.strictEqual(ctx.recentMerchants(withPeople, 3)[0].merchant, 'DMart');

const demoTrip = ctx.normalizeTrip({
  id: 't2', countryCode: 'USD', status: 'active',
  expenses: Array.from({ length: 8 }, (_, i) => ({ id: 'e' + i, merchant: 'x', cat: 'Food', amount: 1, inr: 83, date: '2026-09-01' })),
}, 0);
assert.strictEqual(ctx.canAddTripExpense(emptyTravel, demoTrip), false);
assert.strictEqual(ctx.firstEmoji('🍱 Kirana'), '🍱');
assert.strictEqual(ctx.firstEmoji('🇮🇳'), '🇮🇳');
assert.ok(ctx.firstEmoji('🐶') === '🐶');

const withCheck = ctx.normalizeTrip({ countryCode: 'SGD', name: 'Singapore' }, 0);
assert.ok(Array.isArray(withCheck.checklist) && withCheck.checklist.length >= 6);
assert.strictEqual(ctx.canAddChecklistItem({ settings: { pro: false } }, withCheck), false);
assert.strictEqual(ctx.canAddChecklistItem({ settings: { pro: true } }, withCheck), true);
assert.ok(ctx.tripSummaryText(withCheck, 'en').indexOf('Singapore') >= 0);
assert.strictEqual(ctx.travelHomeCategoryId({ categories: [{ id: 'dining', type: 'expense' }] }, 'Food'), 'dining');

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
assert.match(home, /TravelHomeCard/);
assert.match(home, /safeAfterBills/);
assert.match(home, /dueSoon/);

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
assert.match(travel, /packingList/);
assert.match(travel, /logToHome/);
assert.match(travel, /customRate/);
assert.match(travel, /leftoverDay/);
assert.match(travel, /anotherTrip/);
assert.match(travel, /editTrip/);
assert.match(travel, /onSwitchTrip/);
assert.match(travel, /hubOpen/);
assert.match(travel, /yourTrips/);
assert.match(travel, /allTrips/);

const extras = fs.readFileSync(path.join(root, 'components/TravelExtras.jsx'), 'utf8');
assert.match(extras, /travelChrome/);
assert.match(extras, /ZENITH/);
assert.doesNotMatch(extras, /#007AFF/);
assert.doesNotMatch(extras, /\+41 31 350 3000/);

const profile = fs.readFileSync(path.join(root, 'components/Profile.jsx'), 'utf8');
assert.match(profile, /darkMode/);
assert.match(profile, /appLock/);
assert.match(profile, /backupJson/);
assert.match(profile, /zenithPro/);
assert.doesNotMatch(profile, /travelLater/);
assert.match(profile, /sendFeedback/);
assert.match(profile, /privacy\.html/);
assert.match(profile, /cloudAccount/);
assert.match(profile, /CloudBackupCard/);

const plan = fs.readFileSync(path.join(root, 'components/Plan.jsx'), 'utf8');
assert.match(plan, /insights/);
assert.match(plan, /travel/);
assert.match(plan, /networth/);
assert.match(plan, /calendar/);
assert.match(plan, /people/);

const app = fs.readFileSync(path.join(root, 'app.jsx'), 'utf8');
assert.match(app, /materializeRecurring/);
assert.match(app, /LockScreen/);
assert.match(app, /PaywallScreen/);
assert.match(app, /TravelScreen/);
assert.match(app, /saveGoal/);
assert.match(app, /startTrip/);
assert.match(app, /canStartTrip/);
assert.match(app, /canAddTripExpense/);
assert.match(app, /switchTrip/);
assert.match(app, /moveBudget/);
assert.match(app, /saveHolding/);
assert.match(app, /tab === 'calendar'/);
assert.match(app, /tab === 'networth'/);
assert.match(app, /firstEmoji/);
assert.match(app, /exportJson/);
assert.match(app, /zenithCloudBoot/);
assert.match(app, /onCloudSignIn/);
assert.match(app, /PeopleScreen/);
assert.match(app, /savePerson/);

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.match(pkg.scripts.test, /test-penni-parity/);

assert.doesNotMatch(fs.readFileSync(path.join(root, 'components/NetWorth.jsx'), 'utf8'), /April 2026/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'components/CashflowCalendar.jsx'), 'utf8'), /April 2026/);
assert.match(fs.readFileSync(path.join(root, 'components/CashflowCalendar.jsx'), 'utf8'), /cashflowMonth/);
assert.match(fs.readFileSync(path.join(root, 'components/NetWorth.jsx'), 'utf8'), /netWorthSnapshot/);

const splitUi = fs.readFileSync(path.join(root, 'components/SplitExpense.jsx'), 'utf8');
assert.match(splitUi, /PeopleScreen/);
assert.match(splitUi, /onSplitEqual/);
assert.doesNotMatch(splitUi, /Fatty Bao/);
assert.doesNotMatch(splitUi, /May 2026/);
assert.doesNotMatch(splitUi, /#007AFF/);

assert.match(fs.readFileSync(path.join(root, 'components/Home.jsx'), 'utf8'), /WeekRecapCard/);
assert.match(fs.readFileSync(path.join(root, 'components/Home.jsx'), 'utf8'), /PeoplePeek/);
assert.match(fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8'), /repeatLast/);
assert.match(fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8'), /inputMode="decimal"/);
assert.match(fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8'), /overflowX: 'auto'/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8'), /handleNum/);
assert.doesNotMatch(fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8'), /numpad/);
assert.match(fs.readFileSync(path.join(root, 'components/AddExpense.jsx'), 'utf8'), /dueLater/);
assert.match(travel, /partPaid/);
assert.match(travel, /paidNow/);
assert.match(travel, /fmtForeign/);

const vietnam = ctx.normalizeTrip({
  id: 'trip-vn',
  name: 'Vietnam Sep 2026',
  countryCode: 'VND',
  status: 'active',
  startDate: '2026-09-17',
  endDate: '2026-09-28',
  budgetINR: 120000,
  expenses: [],
}, 0);
assert.strictEqual(vietnam.currency, 'VND');
assert.strictEqual(vietnam.symbol, '₫');
const vnTxns = [
  { id: 'tx-due', type: 'expense', amount: 1327, date: '2026-09-19', accountId: 'cash', categoryId: 'other', merchant: 'Mad Monkey Hoi An (balance due)', note: 'Balance placeholder — not paid yet', trip: 'Vietnam Sep 2026' },
  { id: 'tx-food', type: 'expense', amount: 670, date: '2026-09-07', accountId: 'bank', categoryId: 'dining', merchant: 'The Hazelnut Factory', trip: 'Varanasi Sep 2026' },
  { id: 'tx-ins', type: 'expense', amount: 692, date: '2026-08-29', accountId: 'bank', categoryId: 'other', merchant: 'ACKO travel insurance', trip: 'Vietnam Sep 2026' },
  { id: 'tx-visa', type: 'expense', amount: 2441, date: '2026-08-22', accountId: 'card', categoryId: 'other', merchant: 'Vietnam e-visa', trip: 'Vietnam Sep 2026' },
  { id: 'tx-air', type: 'expense', amount: 0, date: '2026-08-12', accountId: 'card', categoryId: 'cab', merchant: 'Vietnam Airlines DEL–HAN–DAD RT', trip: 'Vietnam Sep 2026' },
  { id: 'tx-dep', type: 'expense', amount: 561, date: '2026-08-01', accountId: 'card', categoryId: 'other', merchant: 'Mad Monkey Hoi An (Hostelworld deposit)', trip: 'Vietnam Sep 2026' },
  { id: 'tx-pkg', type: 'expense', amount: 85273.14, date: '2026-07-20', accountId: 'bank', categoryId: 'other', merchant: 'Experience Co / BHX package', trip: 'Vietnam Sep 2026' },
];
assert.ok(ctx.txnMatchesTrip(vnTxns[5], vietnam));
assert.ok(!ctx.txnMatchesTrip(vnTxns[1], vietnam));
assert.strictEqual(ctx.txnPaymentStatus(vnTxns[0]), 'due');
assert.strictEqual(ctx.txnPaidAmount(vnTxns[0]), 0);
assert.strictEqual(ctx.txnDueAmount(vnTxns[0]), 1327);
assert.strictEqual(ctx.merchantGroupKey('Mad Monkey Hoi An (Hostelworld deposit)'), ctx.merchantGroupKey('Mad Monkey Hoi An (balance due)'));
assert.strictEqual(ctx.fmtForeign(170000, vietnam), '₫170,000');
assert.strictEqual(ctx.inrToForeign(561, 0.0033, 'VND'), 170000);
assert.strictEqual(ctx.inrToForeign(1327, 0.0033, 'VND'), 402121);

const attachedVn = ctx.attachHomeTxnsToStore({
  ...emptyTravel,
  monthlyIncome: 100000,
  openingCash: 0,
  transactions: vnTxns,
  trips: [vietnam],
  activeTripId: 'trip-vn',
});
const liveVn = ctx.activeTrip(attachedVn);
assert.ok(liveVn);
const merchants = (liveVn.expenses || []).map((e) => e.merchant);
assert.ok(merchants.some((m) => /Mad Monkey/i.test(m)));
assert.ok(merchants.some((m) => /e-visa/i.test(m)));
assert.ok(merchants.some((m) => /ACKO/i.test(m)));
assert.ok(merchants.some((m) => /Experience Co/i.test(m)));
assert.ok(!merchants.some((m) => /Hazelnut/i.test(m)));
const monkey = (liveVn.expenses || []).find((e) => /Mad Monkey/i.test(e.merchant));
assert.ok(monkey);
assert.strictEqual(monkey.cat, 'Stay');
assert.strictEqual(monkey.paymentStatus, 'partial');
assert.strictEqual(Math.round(monkey.paidInr), 561);
assert.strictEqual(Math.round(monkey.dueInr), 1327);
assert.ok(monkey.homeTxnIds.indexOf('tx-dep') >= 0);
assert.ok(monkey.homeTxnIds.indexOf('tx-due') >= 0);
assert.ok((liveVn.expenses || []).some((e) => e.date < liveVn.startDate), 'pre-trip spend belongs on the trip');
assert.strictEqual(Math.round(ctx.tripSpentINR(liveVn)), Math.round(561 + 692 + 2441 + 85273.14));
assert.strictEqual(Math.round(ctx.tripDueINR(liveVn)), 1327);
assert.ok(ctx.canAddTripExpense(attachedVn, liveVn));
assert.strictEqual(ctx.monthExpenseTotal(attachedVn, '2026-09'), 670);
assert.strictEqual(ctx.leftoverAfterBills(attachedVn, '2026-09', '2026-09-11'), 99330);

const again = ctx.attachHomeTxnsToStore(attachedVn);
assert.strictEqual(again.trips[0].expenses.length, liveVn.expenses.length);

const seededVn = ctx.normalizeState({
  version: 1,
  user: { name: 'R', locale: 'en' },
  monthlyIncome: 100000,
  transactions: vnTxns,
  trips: [{ id: 'trip-vn', name: 'Vietnam Sep 2026', countryCode: 'VND', status: 'active', startDate: '2026-09-17', endDate: '2026-09-28', budgetINR: 120000, expenses: [] }],
  activeTripId: 'trip-vn',
});
assert.ok(ctx.activeTrip(seededVn).expenses.length >= 4);
assert.ok(seededVn.transactions.find((tx) => tx.id === 'tx-dep').travelId === 'trip-vn');

console.log('penni parity: leftover after bills, concurrent trips, calendar, net worth, trip attach ok');
