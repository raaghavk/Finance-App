/**
 * GET /api/budgets — read-only Notion Budgets + left this month by Category.
 * Vercel Node serverless + local `scripts/dev-server.js`.
 */
var map = require('../lib/notion/map');
var client = require('../lib/notion/client');
var http = require('../lib/server/http');

async function handleBudgets(req, res) {
  if (http.preflight(req, res)) return;

  if (req.method && req.method !== 'GET') {
    http.sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    var snap = await client.loadNotionBudgetsSnapshot();
    http.sendJson(res, 200, snap);
  } catch (err) {
    var mock = map.mockNotionBudgetsSnapshot();
    http.sendJson(res, 200, {
      source: 'error',
      budgets: mock.budgets,
      progress: mock.progress,
      monthKey: mock.monthKey,
      warning: mock.warning,
      error: (err && err.message) || 'Failed to load Notion Budgets',
    });
  }
}

module.exports = handleBudgets;
module.exports.default = handleBudgets;
