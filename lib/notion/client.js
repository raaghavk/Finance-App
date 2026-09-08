/**
 * Live Notion Expenses reader. Queries the data source on each request
 * (not a one-shot export). Never expose NOTION_TOKEN to the browser.
 */
var map = require('./map');

var DEFAULT_DATA_SOURCE_ID = map.NOTION_EXPENSES_DATA_SOURCE_ID;
var DEFAULT_DATABASE_ID = map.NOTION_EXPENSES_DATABASE_ID;

function env(name) {
  return (process.env[name] || '').trim();
}

function isNotionConfigured() {
  if (env('NOTION_EXPENSES_USE_MOCK') === '1') return false;
  return Boolean(env('NOTION_TOKEN') || env('NOTION_API_KEY'));
}

function notionToken() {
  return env('NOTION_TOKEN') || env('NOTION_API_KEY');
}

function dataSourceId() {
  return env('NOTION_EXPENSES_DATA_SOURCE_ID') || DEFAULT_DATA_SOURCE_ID;
}

function databaseId() {
  var raw = env('NOTION_EXPENSES_DATABASE_ID') || DEFAULT_DATABASE_ID;
  if (raw.indexOf('-') >= 0) return raw;
  if (raw.length === 32) {
    return raw.slice(0, 8) + '-' + raw.slice(8, 12) + '-' + raw.slice(12, 16) + '-' + raw.slice(16, 20) + '-' + raw.slice(20);
  }
  return raw;
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

var QUERY_BODY = {
  sorts: [{ property: 'Date', direction: 'descending' }],
};

/**
 * Query the Expenses data source, falling back to the database query API.
 */
async function queryNotionExpensePages() {
  if (!isNotionConfigured()) {
    throw new Error('NOTION_TOKEN is not set');
  }

  var ds = dataSourceId();
  var db = databaseId();

  try {
    return await paginate(
      'https://api.notion.com/v1/data_sources/' + ds + '/query',
      '2025-09-03',
      QUERY_BODY
    );
  } catch (dsErr) {
    try {
      return await paginate(
        'https://api.notion.com/v1/databases/' + db + '/query',
        '2022-06-28',
        QUERY_BODY
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

async function loadNotionExpensesSnapshot(now) {
  if (!isNotionConfigured()) {
    return map.mockNotionSnapshot(now);
  }
  var pages = await queryNotionExpensePages();
  var expenses = map.mapNotionPagesToExpenses(pages);
  return {
    source: 'notion',
    expenses: expenses,
    report: map.buildMonthReport(expenses, now),
  };
}

module.exports = {
  isNotionConfigured: isNotionConfigured,
  notionToken: notionToken,
  dataSourceId: dataSourceId,
  databaseId: databaseId,
  queryNotionExpensePages: queryNotionExpensePages,
  loadNotionExpensesSnapshot: loadNotionExpensesSnapshot,
};
