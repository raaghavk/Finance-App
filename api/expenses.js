/**
 * GET /api/expenses — read-only Notion Expenses.
 * Vercel Node serverless + local `scripts/dev-server.js`.
 */
var map = require('../lib/notion/map');
var client = require('../lib/notion/client');

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function handleExpenses(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method && req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    var snap = await client.loadNotionExpensesSnapshot();
    sendJson(res, 200, snap);
  } catch (err) {
    var mock = map.mockNotionSnapshot();
    sendJson(res, 200, {
      source: 'error',
      expenses: mock.expenses,
      report: mock.report,
      warning: mock.warning,
      error: (err && err.message) || 'Failed to load Notion Expenses',
    });
  }
}

module.exports = handleExpenses;
module.exports.default = handleExpenses;
