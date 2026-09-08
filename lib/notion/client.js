/**
 * Live Notion reader for Expenses, Accounts, and Budgets.
 * Queries each data source on request (not a one-shot export).
 * Never expose NOTION_TOKEN to the browser.
 */
var map = require('./map');

function env(name) {
  return (process.env[name] || '').trim();
}

function isNotionConfigured() {
  if (env('NOTION_EXPENSES_USE_MOCK') === '1' || env('NOTION_USE_MOCK') === '1') return false;
  return Boolean(env('NOTION_TOKEN') || env('NOTION_API_KEY'));
}

function notionToken() {
  return env('NOTION_TOKEN') || env('NOTION_API_KEY');
}

function hyphenateId(raw) {
  if (!raw) return raw;
  if (raw.indexOf('-') >= 0) return raw;
  if (raw.length === 32) {
    return raw.slice(0, 8) + '-' + raw.slice(8, 12) + '-' + raw.slice(12, 16) + '-' + raw.slice(16, 20) + '-' + raw.slice(20);
  }
  return raw;
}

function dataSourceId() {
  return env('NOTION_EXPENSES_DATA_SOURCE_ID') || map.NOTION_EXPENSES_DATA_SOURCE_ID;
}

function databaseId() {
  return hyphenateId(env('NOTION_EXPENSES_DATABASE_ID') || map.NOTION_EXPENSES_DATABASE_ID);
}

function accountsIds() {
  return {
    ds: env('NOTION_ACCOUNTS_DATA_SOURCE_ID') || map.NOTION_ACCOUNTS_DATA_SOURCE_ID,
    db: hyphenateId(env('NOTION_ACCOUNTS_DATABASE_ID') || map.NOTION_ACCOUNTS_DATABASE_ID),
  };
}

function budgetsIds() {
  return {
    ds: env('NOTION_BUDGETS_DATA_SOURCE_ID') || map.NOTION_BUDGETS_DATA_SOURCE_ID,
    db: hyphenateId(env('NOTION_BUDGETS_DATABASE_ID') || map.NOTION_BUDGETS_DATABASE_ID),
  };
}

function notionHeaders(version) {
  return {
    Authorization: 'Bearer ' + notionToken(),
    'Notion-Version': version || '2022-06-28',
    'Content-Type': 'application/json',
  };
}

async function postQuery(url, version, body, cursor) {
  var payload = Object.assign({}, body, { page_size: 100 });
  if (cursor) payload.start_cursor = cursor;
  var res = await fetch(url, {
    method: 'POST',
    headers: notionHeaders(version),
    body: JSON.stringify(payload),
  });
  var text = await res.text();
  var json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = { message: text };
  }
  if (!res.ok) {
    var err = new Error((json && (json.message || json.error)) || ('Notion HTTP ' + res.status));
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

async function paginate(url, version, body) {
  var results = [];
  var cursor;
  do {
    var page = await postQuery(url, version, body, cursor);
    results = results.concat(page.results || []);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return results;
}

async function queryDataSourceOrDatabase(ds, db, body) {
  var queryBody = body || {};
  try {
    return await paginate(
      'https://api.notion.com/v1/data_sources/' + ds + '/query',
      '2025-09-03',
      queryBody
    );
  } catch (dsErr) {
    try {
      return await paginate(
        'https://api.notion.com/v1/databases/' + db + '/query',
        '2022-06-28',
        queryBody
      );
    } catch (dbErr) {
      var combined = new Error(
        'Notion query failed (' + (dsErr.message || dsErr) + '; fallback: ' + (dbErr.message || dbErr) + ')'
      );
      combined.cause = dbErr;
      throw combined;
    }
  }
}

var EXPENSES_QUERY = {
  sorts: [{ property: 'Date', direction: 'descending' }],
};

var NAME_ASC = {
  sorts: [{ property: 'Name', direction: 'ascending' }],
};

/**
 * Query the Expenses data source, falling back to the database query API.
 */
async function queryNotionExpensePages() {
  if (!isNotionConfigured()) {
    throw new Error('NOTION_TOKEN is not set');
  }
  return queryDataSourceOrDatabase(dataSourceId(), databaseId(), EXPENSES_QUERY);
}

async function queryNotionAccountPages() {
  if (!isNotionConfigured()) {
    throw new Error('NOTION_TOKEN is not set');
  }
  var ids = accountsIds();
  try {
    return await queryDataSourceOrDatabase(ids.ds, ids.db, NAME_ASC);
  } catch (err) {
    return queryDataSourceOrDatabase(ids.ds, ids.db, {});
  }
}

async function queryNotionBudgetPages() {
  if (!isNotionConfigured()) {
    throw new Error('NOTION_TOKEN is not set');
  }
  var ids = budgetsIds();
  try {
    return await queryDataSourceOrDatabase(ids.ds, ids.db, NAME_ASC);
  } catch (err) {
    return queryDataSourceOrDatabase(ids.ds, ids.db, {});
  }
}

async function loadExpensesList(now) {
  if (!isNotionConfigured()) {
    return map.SAMPLE_NOTION_EXPENSES;
  }
  var pages = await queryNotionExpensePages();
  return map.mapNotionPagesToExpenses(pages);
}

async function loadNotionExpensesSnapshot(now) {
  if (!isNotionConfigured()) {
    return map.mockNotionSnapshot(now);
  }
  var expenses = await loadExpensesList(now);
  return {
    source: 'notion',
    expenses: expenses,
    report: map.buildMonthReport(expenses, now),
  };
}

async function loadNotionAccountsSnapshot(now) {
  if (!isNotionConfigured()) {
    return map.mockNotionAccountsSnapshot(now);
  }
  var pages = await queryNotionAccountPages();
  var accounts = map.mapNotionPagesToAccounts(pages);
  var expenses;
  try {
    expenses = await loadExpensesList(now);
  } catch (err) {
    expenses = [];
  }
  return {
    source: 'notion',
    accounts: accounts,
    balances: map.buildAccountBalances(accounts, expenses),
  };
}

async function loadNotionBudgetsSnapshot(now) {
  if (!isNotionConfigured()) {
    return map.mockNotionBudgetsSnapshot(now);
  }
  var pages = await queryNotionBudgetPages();
  var budgets = map.mapNotionPagesToBudgets(pages);
  var expenses;
  try {
    expenses = await loadExpensesList(now);
  } catch (err) {
    expenses = [];
  }
  return {
    source: 'notion',
    budgets: budgets,
    progress: map.buildBudgetProgress(budgets, expenses, now),
    monthKey: map.calendarMonthKey(now),
  };
}

module.exports = {
  isNotionConfigured: isNotionConfigured,
  notionToken: notionToken,
  dataSourceId: dataSourceId,
  databaseId: databaseId,
  accountsIds: accountsIds,
  budgetsIds: budgetsIds,
  queryNotionExpensePages: queryNotionExpensePages,
  queryNotionAccountPages: queryNotionAccountPages,
  queryNotionBudgetPages: queryNotionBudgetPages,
  loadNotionExpensesSnapshot: loadNotionExpensesSnapshot,
  loadNotionAccountsSnapshot: loadNotionAccountsSnapshot,
  loadNotionBudgetsSnapshot: loadNotionBudgetsSnapshot,
};
