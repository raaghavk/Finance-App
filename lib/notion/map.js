/**
 * Notion Expenses mappers + sample data.
 * Works in the browser (script tag) and in Node (require).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (typeof globalThis !== 'undefined') {
    Object.assign(globalThis, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Health',
    'Entertainment', 'Travel', 'Stay', 'Subscriptions', 'Other',
  ];
  var EXPENSE_KINDS = ['Everyday', 'Travel', 'Receipt'];
  var EXPENSE_PAYMENTS = ['UPI', 'Card', 'Cash', 'Other'];
  var EXPENSE_STATUSES = ['Logged', 'Needs receipt', 'Submitted', 'Reimbursed'];
  var EXPENSE_TRIPS = ['Vietnam Sep 2026', 'Varanasi Sep 2026', 'Other trip'];
  var EXPENSE_ACCOUNTS = ['Cash', 'UPI', 'Primary debit', 'Primary credit', 'Corporate'];

  var NOTION_EXPENSES_DATABASE_ID = '76941781c8ef4d258923b9c2a6750292';
  var NOTION_EXPENSES_DATA_SOURCE_ID = 'b35c3e74-0bc7-432d-8309-80a7583d3601';

  var CATEGORY_COLORS = {
    Food: '#F97316',
    Transport: '#3B82F6',
    Shopping: '#EC4899',
    Bills: '#92400E',
    Health: '#EF4444',
    Entertainment: '#8B5CF6',
    Travel: '#22C55E',
    Stay: '#EAB308',
    Subscriptions: '#6B7280',
    Other: '#6E6E73',
  };

  var KIND_COLORS = {
    Everyday: '#3B82F6',
    Travel: '#22C55E',
    Receipt: '#F97316',
  };

  function plainText(rich) {
    if (!rich) return '';
    if (typeof rich === 'string') return rich;
    if (!Array.isArray(rich)) return '';
    return rich.map(function (block) {
      return (block && (block.plain_text || (block.text && block.text.content))) || '';
    }).join('');
  }

  function prop(page, name) {
    return (page && page.properties && page.properties[name]) || null;
  }

  function asSelect(value, allowed) {
    if (!value) return null;
    var name = typeof value === 'string' ? value : (value.name || null);
    if (!name) return null;
    return name;
  }

  function asCheckbox(value) {
    if (value === true || value === '__YES__') return true;
    if (value === false || value === '__NO__' || value == null) return false;
    if (typeof value === 'object') {
      if (typeof value.checkbox === 'boolean') return value.checkbox;
      if (value.checkbox === '__YES__') return true;
      if (value.checkbox === '__NO__') return false;
    }
    return false;
  }

  function pricedAmount(row) {
    if (!row || row.amount === null || row.amount === undefined) return 0;
    var n = Number(row.amount);
    return Number.isNaN(n) ? 0 : n;
  }

  function mapNotionPageToExpense(page) {
    if (!page) {
      return {
        id: '',
        url: '',
        name: '',
        amount: null,
        date: null,
        category: null,
        kind: null,
        payment: null,
        status: null,
        trip: null,
        account: null,
        notes: '',
        receipt: null,
        reimbursable: false,
      };
    }

    var nameProp = prop(page, 'Name');
    var amountProp = prop(page, 'Amount');
    var dateProp = prop(page, 'Date');
    var categoryProp = prop(page, 'Category');
    var kindProp = prop(page, 'Kind');
    var paymentProp = prop(page, 'Payment');
    var statusProp = prop(page, 'Status');
    var tripProp = prop(page, 'Trip');
    var accountProp = prop(page, 'Account');
    var notesProp = prop(page, 'Notes');
    var receiptProp = prop(page, 'Receipt');
    var reimbursableProp = prop(page, 'Reimbursable');

    var amount = amountProp && typeof amountProp.number === 'number' ? amountProp.number : null;
    var dateStart = dateProp && dateProp.date && dateProp.date.start ? String(dateProp.date.start).slice(0, 10) : null;
    var receipt = receiptProp && receiptProp.url ? String(receiptProp.url) : null;

    return {
      id: page.id || '',
      url: page.url || '',
      name: plainText(nameProp && nameProp.title) || plainText(nameProp && nameProp.rich_text) || '',
      amount: amount,
      date: dateStart,
      category: asSelect(categoryProp && categoryProp.select, EXPENSE_CATEGORIES),
      kind: asSelect(kindProp && kindProp.select, EXPENSE_KINDS),
      payment: asSelect(paymentProp && paymentProp.select, EXPENSE_PAYMENTS),
      status: asSelect(statusProp && statusProp.select, EXPENSE_STATUSES),
      trip: asSelect(tripProp && tripProp.select, EXPENSE_TRIPS),
      account: asSelect(accountProp && accountProp.select, EXPENSE_ACCOUNTS),
      notes: plainText(notesProp && (notesProp.rich_text || notesProp.text)),
      receipt: receipt,
      reimbursable: asCheckbox(reimbursableProp),
    };
  }

  function mapNotionPagesToExpenses(pages) {
    return (pages || []).map(mapNotionPageToExpense);
  }

  function expenseMonthKey(date) {
    if (!date || String(date).length < 7) return '';
    return String(date).slice(0, 7);
  }

  function calendarMonthKey(now) {
    var d = now ? new Date(now) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function breakdown(rows, keyFn) {
    var buckets = {};
    rows.forEach(function (row) {
      var key = keyFn(row) || '—';
      if (!buckets[key]) buckets[key] = { key: key, total: 0, count: 0 };
      buckets[key].total += pricedAmount(row);
      buckets[key].count += 1;
    });
    return Object.keys(buckets)
      .map(function (k) { return buckets[k]; })
      .sort(function (a, b) { return b.total - a.total || a.key.localeCompare(b.key); });
  }

  function buildMonthReport(expenses, now) {
    var monthKey = calendarMonthKey(now);
    var rows = (expenses || []).filter(function (e) {
      return expenseMonthKey(e.date) === monthKey;
    });
    var total = rows.reduce(function (sum, e) { return sum + pricedAmount(e); }, 0);
    var unpricedCount = rows.filter(function (e) { return e.amount === null || e.amount === undefined; }).length;
    return {
      monthKey: monthKey,
      currency: 'INR',
      total: total,
      count: rows.length,
      unpricedCount: unpricedCount,
      byCategory: breakdown(rows, function (e) { return e.category; }),
      byKind: breakdown(rows, function (e) { return e.kind; }),
      byTrip: breakdown(rows.filter(function (e) { return e.trip; }), function (e) { return e.trip; }),
    };
  }

  function fmtInr(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '₹—';
    var v = Number(n);
    var rounded = Math.round(v * 100) / 100;
    if (Number.isInteger(rounded)) {
      return '₹' + rounded.toLocaleString('en-IN');
    }
    return '₹' + rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** Stub — Expense Tracker owns Notion writes. */
  function createNotionExpense() {
    throw new Error('Notion writes are owned by Expense Tracker. This app is read-only.');
  }

  function slugId(name) {
    return 'sample-' + String(name || 'row').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  }

  function fromOwnerFixture(row) {
    var amount = row.Amount === null || row.Amount === undefined ? null : Number(row.Amount);
    if (amount !== null && Number.isNaN(amount)) amount = null;
    return {
      id: slugId(row.Name),
      url: '',
      name: row.Name,
      amount: amount,
      date: row.date || row.Date || null,
      category: row.Category || null,
      kind: row.Kind || null,
      payment: row.Payment || null,
      status: row.Status || null,
      trip: row.Trip || null,
      account: row.Account || null,
      notes: row.Notes ? ('Example data. ' + row.Notes) : 'Example data — not from live Notion.',
      receipt: null,
      reimbursable: asCheckbox(row.Reimbursable),
    };
  }

  /* Labeled example fallback only. Live path queries the Notion data source. */
  var SAMPLE_NOTION_EXPENSES = [
    { Name: 'Mad Monkey Hoi An (balance due)', Amount: 1327, date: '2026-09-19', Category: 'Stay', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Cash', Status: 'Needs receipt', Reimbursable: false, Notes: 'Balance placeholder — not paid yet' },
    { Name: 'The Hazelnut Factory', Amount: 670, date: '2026-09-07', Category: 'Food', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Other', Status: 'Logged', Reimbursable: false },
    { Name: 'ITH Varanasi dorm', Amount: 1139, date: '2026-09-06', Category: 'Stay', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Other', Status: 'Logged', Reimbursable: false },
    { Name: 'Mangi Ferra @ Surya Kaiser Palace', Amount: 2496, date: '2026-09-06', Category: 'Food', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Other', Status: 'Logged', Reimbursable: false },
    { Name: 'The Vibe (cover charge)', Amount: 1000, date: '2026-09-06', Category: 'Entertainment', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Cash', Status: 'Logged', Reimbursable: false },
    { Name: 'ACKO travel insurance', Amount: 692, date: '2026-08-29', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Other', Status: 'Logged', Reimbursable: false },
    { Name: 'Vietnam e-visa', Amount: 2441, date: '2026-08-22', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Card', Status: 'Needs receipt', Reimbursable: false },
    { Name: 'Vietnam Airlines DEL–HAN–DAD RT', Amount: null, date: '2026-08-12', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Card', Status: 'Needs receipt', Reimbursable: false },
    { Name: 'Mad Monkey Hoi An (Hostelworld deposit)', Amount: 561, date: '2026-08-01', Category: 'Stay', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Card', Status: 'Needs receipt', Reimbursable: false },
    { Name: 'Experience Co / BHX package', Amount: 85273.14, date: '2026-07-20', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Other', Status: 'Needs receipt', Reimbursable: false },
  ].map(fromOwnerFixture);

  function mockNotionSnapshot(now) {
    return {
      source: 'mock',
      expenses: SAMPLE_NOTION_EXPENSES,
      report: buildMonthReport(SAMPLE_NOTION_EXPENSES, now),
      warning: 'Example data — not a live Notion query. Set NOTION_TOKEN to read collection://b35c3e74-0bc7-432d-8309-80a7583d3601.',
    };
  }

  return {
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
    EXPENSE_KINDS: EXPENSE_KINDS,
    EXPENSE_PAYMENTS: EXPENSE_PAYMENTS,
    EXPENSE_STATUSES: EXPENSE_STATUSES,
    EXPENSE_TRIPS: EXPENSE_TRIPS,
    EXPENSE_ACCOUNTS: EXPENSE_ACCOUNTS,
    NOTION_EXPENSES_DATABASE_ID: NOTION_EXPENSES_DATABASE_ID,
    NOTION_EXPENSES_DATA_SOURCE_ID: NOTION_EXPENSES_DATA_SOURCE_ID,
    CATEGORY_COLORS: CATEGORY_COLORS,
    KIND_COLORS: KIND_COLORS,
    SAMPLE_NOTION_EXPENSES: SAMPLE_NOTION_EXPENSES,
    fromOwnerFixture: fromOwnerFixture,
    asCheckbox: asCheckbox,
    plainText: plainText,
    mapNotionPageToExpense: mapNotionPageToExpense,
    mapNotionPagesToExpenses: mapNotionPagesToExpenses,
    expenseMonthKey: expenseMonthKey,
    calendarMonthKey: calendarMonthKey,
    buildMonthReport: buildMonthReport,
    fmtInr: fmtInr,
    createNotionExpense: createNotionExpense,
    mockNotionSnapshot: mockNotionSnapshot,
  };
});
