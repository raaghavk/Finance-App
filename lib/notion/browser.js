/**
 * Browser fetch for Notion expenses, accounts, and budgets.
 * Falls back to example data when the API routes are missing.
 */
(function () {
  var expenseCache = null;
  var expenseInflight = null;
  var accountCache = null;
  var accountInflight = null;
  var budgetCache = null;
  var budgetInflight = null;

  function snapshotFromMock(warning, error) {
    var snap = typeof mockNotionSnapshot === 'function' ? mockNotionSnapshot() : {
      source: 'mock',
      expenses: typeof SAMPLE_NOTION_EXPENSES !== 'undefined' ? SAMPLE_NOTION_EXPENSES : [],
      report: typeof buildMonthReport === 'function' ? buildMonthReport(SAMPLE_NOTION_EXPENSES || []) : null,
      warning: warning,
    };
    if (warning) snap.warning = warning;
    if (error) {
      snap.source = 'error';
      snap.error = error;
    }
    return snap;
  }

  function accountsFromMock(warning, error) {
    var snap = typeof mockNotionAccountsSnapshot === 'function' ? mockNotionAccountsSnapshot() : {
      source: 'mock',
      accounts: typeof SAMPLE_NOTION_ACCOUNTS !== 'undefined' ? SAMPLE_NOTION_ACCOUNTS : [],
      balances: typeof buildAccountBalances === 'function'
        ? buildAccountBalances(SAMPLE_NOTION_ACCOUNTS || [], SAMPLE_NOTION_EXPENSES || [])
        : [],
      warning: warning,
    };
    if (warning) snap.warning = warning;
    if (error) {
      snap.source = 'error';
      snap.error = error;
    }
    return snap;
  }

  function budgetsFromMock(warning, error) {
    var snap = typeof mockNotionBudgetsSnapshot === 'function' ? mockNotionBudgetsSnapshot() : {
      source: 'mock',
      budgets: typeof SAMPLE_NOTION_BUDGETS !== 'undefined' ? SAMPLE_NOTION_BUDGETS : [],
      progress: typeof buildBudgetProgress === 'function'
        ? buildBudgetProgress(SAMPLE_NOTION_BUDGETS || [], SAMPLE_NOTION_EXPENSES || [])
        : [],
      monthKey: typeof calendarMonthKey === 'function' ? calendarMonthKey() : '',
      warning: warning,
    };
    if (warning) snap.warning = warning;
    if (error) {
      snap.source = 'error';
      snap.error = error;
    }
    return snap;
  }

  function fetchJson(path) {
    return fetch(path, { headers: { Accept: 'application/json' } }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error('HTTP ' + res.status + (text ? ': ' + text.slice(0, 180) : ''));
        });
      }
      return res.json();
    });
  }

  var MOCK_HINT = 'Showing example data. Wire NOTION_TOKEN on the server (or Vercel) to load live Notion.';

  function notionSyncOn() {
    return typeof zenithNotionEnabled === 'function' && zenithNotionEnabled();
  }

  function loadNotionExpenses(force) {
    if (!notionSyncOn()) {
      return Promise.resolve({
        source: 'off',
        expenses: [],
        report: typeof buildMonthReport === 'function' ? buildMonthReport([]) : null,
        warning: 'Notion sync is off. Expenses stay on this device.',
      });
    }
    if (!force && expenseCache) return Promise.resolve(expenseCache);
    if (!force && expenseInflight) return expenseInflight;

    expenseInflight = fetchJson('api/expenses')
      .then(function (data) {
        if (!data || !Array.isArray(data.expenses)) {
          throw new Error('Unexpected API payload');
        }
        if (!data.report && typeof buildMonthReport === 'function') {
          data.report = buildMonthReport(data.expenses);
        }
        expenseCache = data;
        expenseInflight = null;
        return data;
      })
      .catch(function (err) {
        expenseInflight = null;
        var snap = snapshotFromMock(
          'Showing example data. Wire NOTION_TOKEN on the server (or Vercel) to load live Notion Expenses.',
          err && err.message
        );
        expenseCache = snap;
        return snap;
      });

    return expenseInflight;
  }

  function loadNotionAccounts(force) {
    if (!notionSyncOn()) {
      return Promise.resolve({
        source: 'off',
        accounts: [],
        balances: [],
        warning: 'Notion sync is off. Accounts stay on this device.',
      });
    }
    if (!force && accountCache) return Promise.resolve(accountCache);
    if (!force && accountInflight) return accountInflight;

    accountInflight = fetchJson('api/accounts')
      .then(function (data) {
        if (!data || !Array.isArray(data.balances || data.accounts)) {
          throw new Error('Unexpected API payload');
        }
        if (!data.balances && typeof buildAccountBalances === 'function') {
          data.balances = buildAccountBalances(data.accounts || [], (expenseCache && expenseCache.expenses) || []);
        }
        accountCache = data;
        accountInflight = null;
        return data;
      })
      .catch(function (err) {
        accountInflight = null;
        var snap = accountsFromMock(MOCK_HINT, err && err.message);
        accountCache = snap;
        return snap;
      });

    return accountInflight;
  }

  function loadNotionBudgets(force) {
    if (!notionSyncOn()) {
      return Promise.resolve({
        source: 'off',
        budgets: [],
        progress: [],
        monthKey: typeof calendarMonthKey === 'function' ? calendarMonthKey() : '',
        warning: 'Notion sync is off. Budgets stay on this device.',
      });
    }
    if (!force && budgetCache) return Promise.resolve(budgetCache);
    if (!force && budgetInflight) return budgetInflight;

    budgetInflight = fetchJson('api/budgets')
      .then(function (data) {
        if (!data || !Array.isArray(data.progress || data.budgets)) {
          throw new Error('Unexpected API payload');
        }
        if (!data.progress && typeof buildBudgetProgress === 'function') {
          data.progress = buildBudgetProgress(data.budgets || [], (expenseCache && expenseCache.expenses) || []);
        }
        budgetCache = data;
        budgetInflight = null;
        return data;
      })
      .catch(function (err) {
        budgetInflight = null;
        var snap = budgetsFromMock(MOCK_HINT, err && err.message);
        budgetCache = snap;
        return snap;
      });

    return budgetInflight;
  }

  function getCachedNotionExpenses() {
    return expenseCache;
  }

  function getCachedNotionAccounts() {
    return accountCache;
  }

  function getCachedNotionBudgets() {
    return budgetCache;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.loadNotionExpenses = loadNotionExpenses;
    globalThis.loadNotionAccounts = loadNotionAccounts;
    globalThis.loadNotionBudgets = loadNotionBudgets;
    globalThis.getCachedNotionExpenses = getCachedNotionExpenses;
    globalThis.getCachedNotionAccounts = getCachedNotionAccounts;
    globalThis.getCachedNotionBudgets = getCachedNotionBudgets;
  }
})();
