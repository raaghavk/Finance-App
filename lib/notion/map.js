/**
 * Notion Expenses mappers + Raaghav's live ledger snapshot (demo seed).
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
  var EXPENSE_ACCOUNTS = ['Cash', 'IDFC (UPI/debit)', 'Kamlesh UPI'];
  var LEGACY_ACCOUNT_NAMES = ['UPI', 'Primary debit', 'Primary credit', 'Corporate'];
  var SPEND_ONLY_ACCOUNTS = ['Kamlesh UPI'];
  var DEMO_SEED_ID = 'notion-snapshot-2026-09';
  var DEMO_SEED_NOTE = 'Demo seed from Notion snapshot';

  var NOTION_EXPENSES_DATABASE_ID = '76941781c8ef4d258923b9c2a6750292';
  var NOTION_EXPENSES_DATA_SOURCE_ID = 'b35c3e74-0bc7-432d-8309-80a7583d3601';
  var NOTION_ACCOUNTS_DATABASE_ID = 'a9effaa05c66492a9780b5a36cda1d63';
  var NOTION_ACCOUNTS_DATA_SOURCE_ID = '2c0de472-1d21-4243-bcd8-1fb19ab89bba';
  var NOTION_BUDGETS_DATABASE_ID = '301bb78c3c094fb1aee38bcb57f7beb0';
  var NOTION_BUDGETS_DATA_SOURCE_ID = '3f8d31df-d13d-49a2-a9ac-f5b8489f737f';

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

  var ACCOUNT_COLORS = {
    Cash: (typeof ZENITH !== 'undefined' && ZENITH.accent) || '#2563EB',
    'IDFC (UPI/debit)': '#1D4ED8',
    'Kamlesh UPI': '#0F766E',
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

  function asNumber(prop) {
    if (prop == null) return null;
    if (typeof prop === 'number') return Number.isNaN(prop) ? null : prop;
    if (typeof prop.number === 'number') return prop.number;
    return null;
  }

  function asPlainField(propVal) {
    if (propVal == null || propVal === '') return null;
    if (typeof propVal === 'string') {
      var s = String(propVal).trim();
      return s ? s : null;
    }
    if (propVal.select) {
      var sel = asSelect(propVal.select);
      return sel || null;
    }
    var text = plainText(propVal.title || propVal.rich_text || propVal.text);
    text = String(text || '').trim();
    return text ? text : null;
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
        payee: null,
        location: null,
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
    var payeeProp = prop(page, 'Payee');
    var locationProp = prop(page, 'Location');
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
      payee: asPlainField(payeeProp),
      location: asPlainField(locationProp),
      notes: plainText(notesProp && (notesProp.rich_text || notesProp.text)),
      receipt: receipt,
      reimbursable: asCheckbox(reimbursableProp),
    };
  }

  function mapNotionPagesToExpenses(pages) {
    return (pages || []).map(mapNotionPageToExpense);
  }

  function mapNotionPageToAccount(page) {
    if (!page) {
      return { id: '', url: '', name: '', notes: '', openingBalance: null };
    }
    var nameProp = prop(page, 'Name');
    var notesProp = prop(page, 'Notes');
    var openingProp = prop(page, 'Opening balance');
    return {
      id: page.id || '',
      url: page.url || '',
      name: plainText(nameProp && nameProp.title) || plainText(nameProp && nameProp.rich_text) || '',
      notes: plainText(notesProp && (notesProp.rich_text || notesProp.text)),
      openingBalance: asNumber(openingProp),
    };
  }

  function mapNotionPagesToAccounts(pages) {
    return (pages || []).map(mapNotionPageToAccount);
  }

  function mapNotionPageToBudget(page) {
    if (!page) {
      return { id: '', url: '', name: '', category: null, monthlyCap: null, notes: '' };
    }
    var nameProp = prop(page, 'Name');
    var notesProp = prop(page, 'Notes');
    var categoryProp = prop(page, 'Category');
    var capProp = prop(page, 'Monthly cap');
    return {
      id: page.id || '',
      url: page.url || '',
      name: plainText(nameProp && nameProp.title) || plainText(nameProp && nameProp.rich_text) || '',
      category: asSelect(categoryProp && categoryProp.select, EXPENSE_CATEGORIES),
      monthlyCap: asNumber(capProp),
      notes: plainText(notesProp && (notesProp.rich_text || notesProp.text)),
    };
  }

  function mapNotionPagesToBudgets(pages) {
    return (pages || []).map(mapNotionPageToBudget);
  }

  function spendByAccount(expenses) {
    var spent = {};
    var count = {};
    (expenses || []).forEach(function (e) {
      var key = e && e.account;
      if (!key) return;
      if (spent[key] == null) {
        spent[key] = 0;
        count[key] = 0;
      }
      spent[key] += pricedAmount(e);
      if (e.amount !== null && e.amount !== undefined) count[key] += 1;
    });
    return { spent: spent, count: count };
  }

  function isSpendOnlyAccount(name) {
    return SPEND_ONLY_ACCOUNTS.indexOf(name) >= 0;
  }

  function isInactiveAccountName(name) {
    if (!name) return true;
    if (String(name).indexOf('(inactive)') === 0) return true;
    return LEGACY_ACCOUNT_NAMES.indexOf(name) >= 0;
  }

  function isActiveWalletName(name) {
    return !!name && EXPENSE_ACCOUNTS.indexOf(name) >= 0;
  }

  function openingIsMissing(acct) {
    if (!acct || isSpendOnlyAccount(acct.name)) return false;
    if (acct.openingBalance === null || acct.openingBalance === undefined) return true;
    // IDFC opening is still pending in Notion (often stored as 0).
    if (acct.name === 'IDFC (UPI/debit)' && acct.openingBalance === 0) return true;
    return false;
  }

  function walletRow(acct, spend) {
    var spendOnly = isSpendOnlyAccount(acct.name);
    var openingMissing = openingIsMissing(acct);
    var opening = openingMissing ? null : acct.openingBalance;
    var spent = spend.spent[acct.name] || 0;
    return {
      id: acct.id,
      url: acct.url || '',
      name: acct.name,
      notes: acct.notes || '',
      openingBalance: spendOnly ? (acct.openingBalance == null ? 0 : acct.openingBalance) : opening,
      openingMissing: openingMissing,
      spendOnly: spendOnly,
      spent: spent,
      expenseCount: spend.count[acct.name] || 0,
      balance: spendOnly ? null : (openingMissing ? 0 : opening) - spent,
    };
  }

  /**
   * Balance = opening − priced expenses tagged with that Account name.
   * Drops `(inactive)*` and legacy wallets. Kamlesh UPI is spend-only (no balance).
   */
  function buildAccountBalances(accounts, expenses) {
    var spend = spendByAccount(expenses);
    var known = {};
    var rows = (accounts || []).filter(function (acct) {
      return isActiveWalletName(acct && acct.name);
    }).map(function (acct) {
      known[acct.name] = true;
      return walletRow(acct, spend);
    });
    Object.keys(spend.spent).forEach(function (name) {
      if (known[name] || !isActiveWalletName(name)) return;
      rows.push(walletRow({
        id: 'untagged-account-' + name,
        url: '',
        name: name,
        notes: 'Spend tagged on Expenses; no Accounts row.',
        openingBalance: null,
      }, spend));
    });
    var order = { Cash: 0, 'IDFC (UPI/debit)': 1, 'Kamlesh UPI': 2 };
    return rows.sort(function (a, b) {
      var ao = order[a.name] != null ? order[a.name] : 9;
      var bo = order[b.name] != null ? order[b.name] : 9;
      return ao - bo || String(a.name).localeCompare(String(b.name));
    });
  }

  function spendByCategoryThisMonth(expenses, now) {
    var month = calendarMonthKey(now);
    var spent = {};
    var count = {};
    (expenses || []).forEach(function (e) {
      if (expenseMonthKey(e && e.date) !== month) return;
      var key = e.category;
      if (!key) return;
      if (spent[key] == null) {
        spent[key] = 0;
        count[key] = 0;
      }
      spent[key] += pricedAmount(e);
      count[key] += 1;
    });
    return { spent: spent, count: count, monthKey: month };
  }

  /** Left this month = monthly cap − this-month spend in that Category. */
  function buildBudgetProgress(budgets, expenses, now) {
    var cat = spendByCategoryThisMonth(expenses, now);
    return (budgets || []).map(function (b) {
      var cap = b.monthlyCap;
      var capMissing = cap === null || cap === undefined;
      var spent = (b.category && cat.spent[b.category]) || 0;
      var left = capMissing ? null : cap - spent;
      var pct = !capMissing && cap > 0 ? spent / cap : null;
      return {
        id: b.id,
        url: b.url,
        name: b.name,
        category: b.category,
        notes: b.notes || '',
        monthlyCap: capMissing ? null : cap,
        capMissing: capMissing,
        spent: spent,
        expenseCount: (b.category && cat.count[b.category]) || 0,
        left: left,
        over: typeof left === 'number' && left < 0,
        pct: pct,
        monthKey: cat.monthKey,
      };
    }).sort(function (a, b) {
      if (a.over !== b.over) return a.over ? -1 : 1;
      var ap = a.pct == null ? -1 : a.pct;
      var bp = b.pct == null ? -1 : b.pct;
      return bp - ap || String(a.name).localeCompare(String(b.name));
    });
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

  function slugId(name, date) {
    var base = String(name || 'row').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    var day = date ? String(date).slice(0, 10) : '';
    return ('sample-' + (day ? day + '-' : '') + base).replace(/-+$/g, '');
  }

  function fromOwnerFixture(row) {
    var amount = row.Amount === null || row.Amount === undefined ? null : Number(row.Amount);
    if (amount !== null && Number.isNaN(amount)) amount = null;
    var date = row.date || row.Date || null;
    var payee = asPlainField(row.Payee);
    var location = asPlainField(row.Location);
    return {
      id: slugId(row.Name, date),
      url: '',
      name: row.Name,
      amount: amount,
      date: date,
      category: row.Category || null,
      kind: row.Kind || null,
      payment: row.Payment || null,
      status: row.Status || null,
      trip: row.Trip || null,
      account: row.Account || null,
      payee: payee,
      location: location,
      notes: DEMO_SEED_NOTE + (row.Notes ? ' · ' + row.Notes : ''),
      receipt: null,
      reimbursable: asCheckbox(row.Reimbursable),
    };
  }

  /**
   * Live dump of Raaghav's Notion Expenses ledger (24 rows).
   * Used when NOTION_TOKEN is missing and as the zenith_v1_store first-load seed.
   */
  var OWNER_LEDGER_ROWS = [
    { Name: 'Mad Monkey Hoi An (balance due)', Amount: 1327, date: '2026-09-19', Category: 'Stay', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Cash', Status: 'Needs receipt', Account: 'Cash', Payee: 'Mad Monkey', Location: 'Hoi An' },
    { Name: 'Ravi Bajaj (maple)', Amount: 2200, date: '2026-09-13', Category: 'Other', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Ravi Bajaj', Location: 'Gorakhpur' },
    { Name: 'Connect', Amount: 400, date: '2026-09-13', Category: 'Other', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Connect', Location: 'Gorakhpur' },
    { Name: 'Baskin Robbins', Amount: 190, date: '2026-09-12', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Baskin Robbins', Location: 'Gorakhpur' },
    { Name: 'Ravi Bajaj', Amount: 2500, date: '2026-09-12', Category: 'Other', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Ravi Bajaj', Location: 'Gorakhpur' },
    { Name: 'Dosa (Golghar)', Amount: 300, date: '2026-09-12', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Golghar', Location: 'Gorakhpur' },
    { Name: 'Kumar Kulfi', Amount: 110, date: '2026-09-12', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Kumar Kulfi', Location: 'Gorakhpur' },
    { Name: 'Domino’s Pizza', Amount: 500, date: '2026-09-11', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Domino’s', Location: 'Gorakhpur' },
    { Name: 'Miscellaneous', Amount: 90, date: '2026-09-11', Category: 'Other', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Misc', Location: 'Gorakhpur' },
    { Name: 'PVR snacks', Amount: 1235, date: '2026-09-10', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'PVR INOX', Location: 'Gorakhpur' },
    { Name: 'Schweppes water (PVR)', Amount: 65, date: '2026-09-10', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'PVR INOX', Location: 'Gorakhpur' },
    { Name: 'Advance Cigarettes (Shanvi)', Amount: 50, date: '2026-09-08', Category: 'Other', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Shanvi', Location: 'Gorakhpur' },
    { Name: 'Momos (Shanvi)', Amount: 140, date: '2026-09-08', Category: 'Food', Kind: 'Everyday', Trip: null, Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Shanvi', Location: 'Gorakhpur' },
    { Name: 'Spa', Amount: 2300, date: '2026-09-07', Category: 'Health', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Spa', Location: 'Varanasi' },
    { Name: 'The Hazelnut Factory', Amount: 700, date: '2026-09-07', Category: 'Food', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'The Hazelnut Factory', Location: 'Varanasi' },
    { Name: 'Parking', Amount: 50, date: '2026-09-07', Category: 'Transport', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Parking', Location: 'Varanasi' },
    { Name: 'Mangi Ferra @ Surya Kaiser Palace', Amount: 2496, date: '2026-09-06', Category: 'Food', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'Mangi Ferra', Location: 'Varanasi' },
    { Name: 'ITH Varanasi dorm', Amount: 1139, date: '2026-09-06', Category: 'Stay', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'UPI', Status: 'Logged', Account: 'Kamlesh UPI', Payee: 'ITH', Location: 'Varanasi' },
    { Name: 'The Vibe (cover charge)', Amount: 1000, date: '2026-09-06', Category: 'Entertainment', Kind: 'Travel', Trip: 'Varanasi Sep 2026', Payment: 'Cash', Status: 'Logged', Account: 'Cash', Payee: 'The Vibe', Location: 'Varanasi' },
    { Name: 'ACKO travel insurance', Amount: 692, date: '2026-08-29', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Other', Status: 'Logged', Account: null, Payee: 'ACKO', Location: 'Other' },
    { Name: 'Vietnam e-visa', Amount: 2441, date: '2026-08-22', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Card', Status: 'Needs receipt', Account: null, Payee: 'Vietnam e-visa', Location: 'Other' },
    { Name: 'Vietnam Airlines DEL–HAN–DAD RT', Amount: null, date: '2026-08-12', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Card', Status: 'Needs receipt', Account: null, Payee: 'Vietnam Airlines', Location: 'Delhi' },
    { Name: 'Mad Monkey Hoi An (Hostelworld deposit)', Amount: 561, date: '2026-08-01', Category: 'Stay', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Card', Status: 'Needs receipt', Account: null, Payee: 'Mad Monkey', Location: 'Hoi An' },
    { Name: 'Experience Co / BHX package', Amount: 85273.14, date: '2026-07-20', Category: 'Travel', Kind: 'Travel', Trip: 'Vietnam Sep 2026', Payment: 'Other', Status: 'Needs receipt', Account: null, Payee: 'Experience Co', Location: 'Other' },
  ];

  var SAMPLE_NOTION_EXPENSES = OWNER_LEDGER_ROWS.map(fromOwnerFixture);

  var SAMPLE_NOTION_ACCOUNTS = [
    { id: 'sample-acct-cash', url: '', name: 'Cash', notes: DEMO_SEED_NOTE + '. Office float ₹15,000 for Varanasi (Sep 2026).', openingBalance: 15000 },
    { id: 'sample-acct-idfc', url: '', name: 'IDFC (UPI/debit)', notes: DEMO_SEED_NOTE + '. IDFC First savings. Opening still pending from Raaghav.', openingBalance: null },
    { id: 'sample-acct-kamlesh', url: '', name: 'Kamlesh UPI', notes: DEMO_SEED_NOTE + '. Staff UPI — spend only, not a wallet balance.', openingBalance: 0 },
    { id: 'sample-acct-inactive-upi', url: '', name: '(inactive) UPI', notes: 'Merged into IDFC (UPI/debit). Do not use.', openingBalance: 0 },
    { id: 'sample-acct-inactive-credit', url: '', name: '(inactive) Primary credit', notes: 'Not in active use.', openingBalance: 0 },
    { id: 'sample-acct-inactive-corp', url: '', name: '(inactive) Corporate', notes: 'Not in active use.', openingBalance: 0 },
  ];

  var SAMPLE_NOTION_BUDGETS = [
    { id: 'sample-bud-food', url: '', name: 'Food', category: 'Food', monthlyCap: 15000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-transport', url: '', name: 'Transport', category: 'Transport', monthlyCap: 5000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-shopping', url: '', name: 'Shopping', category: 'Shopping', monthlyCap: 5000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-bills', url: '', name: 'Bills', category: 'Bills', monthlyCap: 10000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-health', url: '', name: 'Health', category: 'Health', monthlyCap: 3000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-entertainment', url: '', name: 'Entertainment', category: 'Entertainment', monthlyCap: 3000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-travel', url: '', name: 'Travel', category: 'Travel', monthlyCap: 25000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-stay', url: '', name: 'Stay', category: 'Stay', monthlyCap: 10000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-subs', url: '', name: 'Subscriptions', category: 'Subscriptions', monthlyCap: 2000, notes: DEMO_SEED_NOTE },
    { id: 'sample-bud-other', url: '', name: 'Other', category: 'Other', monthlyCap: 3000, notes: DEMO_SEED_NOTE },
  ];

  var DEMO_SEED_WARNING_EXPENSES = DEMO_SEED_NOTE + ' — not a live Notion query. Set NOTION_TOKEN to read collection://b35c3e74-0bc7-432d-8309-80a7583d3601.';
  var DEMO_SEED_WARNING_ACCOUNTS = DEMO_SEED_NOTE + ' — not a live Notion query. Set NOTION_TOKEN to read collection://2c0de472-1d21-4243-bcd8-1fb19ab89bba.';
  var DEMO_SEED_WARNING_BUDGETS = DEMO_SEED_NOTE + ' — not a live Notion query. Set NOTION_TOKEN to read collection://3f8d31df-d13d-49a2-a9ac-f5b8489f737f.';

  function mockNotionSnapshot(now) {
    return {
      source: 'mock',
      expenses: SAMPLE_NOTION_EXPENSES,
      report: buildMonthReport(SAMPLE_NOTION_EXPENSES, now),
      warning: DEMO_SEED_WARNING_EXPENSES,
    };
  }

  function mockNotionAccountsSnapshot(now) {
    var expenses = SAMPLE_NOTION_EXPENSES;
    return {
      source: 'mock',
      accounts: SAMPLE_NOTION_ACCOUNTS,
      balances: buildAccountBalances(SAMPLE_NOTION_ACCOUNTS, expenses),
      warning: DEMO_SEED_WARNING_ACCOUNTS,
    };
  }

  function mockNotionBudgetsSnapshot(now) {
    return {
      source: 'mock',
      budgets: SAMPLE_NOTION_BUDGETS,
      progress: buildBudgetProgress(SAMPLE_NOTION_BUDGETS, SAMPLE_NOTION_EXPENSES, now),
      monthKey: calendarMonthKey(now),
      warning: DEMO_SEED_WARNING_BUDGETS,
    };
  }

  function notionCategoryId(name) {
    var ids = {
      Food: 'food', Transport: 'transport', Shopping: 'shopping', Bills: 'bills',
      Health: 'health', Entertainment: 'entertainment', Travel: 'travel',
      Stay: 'stay', Subscriptions: 'subscriptions', Other: 'other',
    };
    return ids[name] || 'other';
  }

  function notionAccountId(name) {
    if (name === 'Cash') return 'cash';
    if (name === 'IDFC (UPI/debit)') return 'idfc';
    if (name === 'Kamlesh UPI') return 'kamlesh';
    return '';
  }

  function demoLedgerAccounts() {
    return [
      { id: 'cash', name: 'Cash', nameHi: 'नकद', opening: 15000, sortOrder: 0 },
      { id: 'idfc', name: 'IDFC (UPI/debit)', nameHi: 'IDFC', opening: 0, openingMissing: true, sortOrder: 1 },
      { id: 'kamlesh', name: 'Kamlesh UPI', nameHi: 'कमलेश UPI', opening: 0, spendOnly: true, sortOrder: 2 },
    ];
  }

  function demoLedgerCategories() {
    var parents = [
      { id: 'grp-ledger', name: 'Ledger', nameHi: 'बही', emoji: '📒', color: '#2563EB', type: 'expense', group: 'money', parentId: null, sortOrder: -1 },
      { id: 'food', name: 'Food', nameHi: 'खाना', emoji: '🍽️', color: '#F97316', type: 'expense', group: 'food', parentId: null, sortOrder: 0 },
      { id: 'transport', name: 'Transport', nameHi: 'यातायात', emoji: '🛺', color: '#3B82F6', type: 'expense', group: 'move', parentId: null, sortOrder: 1 },
      { id: 'shopping', name: 'Shopping', nameHi: 'शॉपिंग', emoji: '🛍️', color: '#EC4899', type: 'expense', group: 'life', parentId: null, sortOrder: 2 },
      { id: 'bills', name: 'Bills', nameHi: 'बिल', emoji: '🧾', color: '#92400E', type: 'expense', group: 'home', parentId: null, sortOrder: 3 },
      { id: 'health', name: 'Health', nameHi: 'स्वास्थ्य', emoji: '💊', color: '#EF4444', type: 'expense', group: 'life', parentId: null, sortOrder: 4 },
      { id: 'entertainment', name: 'Entertainment', nameHi: 'मनोरंजन', emoji: '🎬', color: '#8B5CF6', type: 'expense', group: 'life', parentId: null, sortOrder: 5 },
      { id: 'travel', name: 'Travel', nameHi: 'यात्रा', emoji: '✈️', color: '#22C55E', type: 'expense', group: 'life', parentId: null, sortOrder: 6 },
      { id: 'stay', name: 'Stay', nameHi: 'रहना', emoji: '🏨', color: '#EAB308', type: 'expense', group: 'home', parentId: null, sortOrder: 7 },
      { id: 'subscriptions', name: 'Subscriptions', nameHi: 'सदस्यता', emoji: '📺', color: '#6B7280', type: 'expense', group: 'home', parentId: null, sortOrder: 8 },
      { id: 'other', name: 'Other', nameHi: 'अन्य', emoji: '✦', color: '#6E6E73', type: 'expense', group: 'money', parentId: null, sortOrder: 9 },
    ];
    var childParent = {
      kirana: 'food', chai: 'food', tiffin: 'food', dining: 'food',
      auto: 'transport', cab: 'transport', metro: 'transport', fuel: 'transport',
      rent: 'stay', society: 'bills', lpg: 'bills', electricity: 'bills', broadband: 'subscriptions',
      puja: 'other', sip: null, transfer: null, cashback: null, salary: null,
    };
    var skip = { shopping: 1, health: 1, entertainment: 1, other: 1 };
    var extras = (typeof DEFAULT_CATEGORIES !== 'undefined' ? DEFAULT_CATEGORIES : []).filter(function (c) {
      return !skip[c.id];
    }).map(function (c, i) {
      var pid = Object.prototype.hasOwnProperty.call(childParent, c.id) ? childParent[c.id] : null;
      return Object.assign({}, c, { parentId: pid, sortOrder: 20 + i });
    });
    return parents.concat(extras);
  }

  function demoLedgerBudgets(now) {
    var mk = calendarMonthKey(now);
    return [
      { categoryId: 'food', monthKey: mk, limit: 15000 },
      { categoryId: 'transport', monthKey: mk, limit: 5000 },
      { categoryId: 'shopping', monthKey: mk, limit: 5000 },
      { categoryId: 'bills', monthKey: mk, limit: 10000 },
      { categoryId: 'health', monthKey: mk, limit: 3000 },
      { categoryId: 'entertainment', monthKey: mk, limit: 3000 },
      { categoryId: 'travel', monthKey: mk, limit: 25000 },
      { categoryId: 'stay', monthKey: mk, limit: 10000 },
      { categoryId: 'subscriptions', monthKey: mk, limit: 2000 },
      { categoryId: 'other', monthKey: mk, limit: 3000 },
    ];
  }

  function expenseToLocalTxn(exp, i) {
    var bits = [DEMO_SEED_NOTE];
    if (exp.status) bits.push(exp.status);
    if (exp.trip) bits.push(exp.trip);
    if (exp.payee) bits.push(exp.payee);
    if (exp.location) bits.push(exp.location);
    return {
      id: exp.id || ('seed-' + i),
      date: exp.date,
      type: 'expense',
      amount: exp.amount,
      categoryId: notionCategoryId(exp.category),
      accountId: notionAccountId(exp.account),
      merchant: exp.name,
      note: bits.join(' · '),
      method: exp.payment || 'UPI',
      payee: exp.payee || '',
      location: exp.location || '',
      kind: exp.kind || null,
      trip: exp.trip || null,
      status: exp.status || null,
      seed: true,
    };
  }

  /** First-load zenith_v1_store seed from the Notion snapshot. Does not overwrite a store that already has txns or demoSeed. */
  function seedZenithStoreFromNotionSnapshot(base, now) {
    var next = Object.assign({}, base || {});
    next.demoSeed = DEMO_SEED_ID;
    next.onboardingComplete = true;
    next.openingCash = 15000;
    next.user = Object.assign({}, next.user || {}, {
      name: (next.user && next.user.name) || 'Raaghav',
      locale: (next.user && next.user.locale) || 'en',
      currency: 'INR',
    });
    next.accounts = demoLedgerAccounts();
    next.categories = demoLedgerCategories();
    next.transactions = SAMPLE_NOTION_EXPENSES.map(expenseToLocalTxn);
    next.budgets = demoLedgerBudgets(now);
    next.startedAt = next.startedAt || '2026-07-20';
    return next;
  }

  return {
    EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
    EXPENSE_KINDS: EXPENSE_KINDS,
    EXPENSE_PAYMENTS: EXPENSE_PAYMENTS,
    EXPENSE_STATUSES: EXPENSE_STATUSES,
    EXPENSE_TRIPS: EXPENSE_TRIPS,
    EXPENSE_ACCOUNTS: EXPENSE_ACCOUNTS,
    LEGACY_ACCOUNT_NAMES: LEGACY_ACCOUNT_NAMES,
    SPEND_ONLY_ACCOUNTS: SPEND_ONLY_ACCOUNTS,
    NOTION_EXPENSES_DATABASE_ID: NOTION_EXPENSES_DATABASE_ID,
    NOTION_EXPENSES_DATA_SOURCE_ID: NOTION_EXPENSES_DATA_SOURCE_ID,
    NOTION_ACCOUNTS_DATABASE_ID: NOTION_ACCOUNTS_DATABASE_ID,
    NOTION_ACCOUNTS_DATA_SOURCE_ID: NOTION_ACCOUNTS_DATA_SOURCE_ID,
    NOTION_BUDGETS_DATABASE_ID: NOTION_BUDGETS_DATABASE_ID,
    NOTION_BUDGETS_DATA_SOURCE_ID: NOTION_BUDGETS_DATA_SOURCE_ID,
    CATEGORY_COLORS: CATEGORY_COLORS,
    KIND_COLORS: KIND_COLORS,
    ACCOUNT_COLORS: ACCOUNT_COLORS,
    SAMPLE_NOTION_EXPENSES: SAMPLE_NOTION_EXPENSES,
    SAMPLE_NOTION_ACCOUNTS: SAMPLE_NOTION_ACCOUNTS,
    SAMPLE_NOTION_BUDGETS: SAMPLE_NOTION_BUDGETS,
    OWNER_LEDGER_ROWS: OWNER_LEDGER_ROWS,
    DEMO_SEED_ID: DEMO_SEED_ID,
    DEMO_SEED_NOTE: DEMO_SEED_NOTE,
    fromOwnerFixture: fromOwnerFixture,
    asCheckbox: asCheckbox,
    asNumber: asNumber,
    asPlainField: asPlainField,
    pricedAmount: pricedAmount,
    plainText: plainText,
    mapNotionPageToExpense: mapNotionPageToExpense,
    mapNotionPagesToExpenses: mapNotionPagesToExpenses,
    mapNotionPageToAccount: mapNotionPageToAccount,
    mapNotionPagesToAccounts: mapNotionPagesToAccounts,
    mapNotionPageToBudget: mapNotionPageToBudget,
    mapNotionPagesToBudgets: mapNotionPagesToBudgets,
    expenseMonthKey: expenseMonthKey,
    calendarMonthKey: calendarMonthKey,
    buildMonthReport: buildMonthReport,
    buildAccountBalances: buildAccountBalances,
    isActiveWalletName: isActiveWalletName,
    isInactiveAccountName: isInactiveAccountName,
    isSpendOnlyAccount: isSpendOnlyAccount,
    buildBudgetProgress: buildBudgetProgress,
    fmtInr: fmtInr,
    createNotionExpense: createNotionExpense,
    mockNotionSnapshot: mockNotionSnapshot,
    mockNotionAccountsSnapshot: mockNotionAccountsSnapshot,
    mockNotionBudgetsSnapshot: mockNotionBudgetsSnapshot,
    seedZenithStoreFromNotionSnapshot: seedZenithStoreFromNotionSnapshot,
    notionCategoryId: notionCategoryId,
    notionAccountId: notionAccountId,
  };
});
