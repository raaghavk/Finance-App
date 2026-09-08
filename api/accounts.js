/**
 * GET /api/accounts — read-only Notion Accounts + opening − tagged spend.
 * Vercel Node serverless + local `scripts/dev-server.js`.
 */
var map = require('../lib/notion/map');
var client = require('../lib/notion/client');
var http = require('../lib/server/http');

async function handleAccounts(req, res) {
  if (http.preflight(req, res)) return;

  if (req.method && req.method !== 'GET') {
    http.sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    var snap = await client.loadNotionAccountsSnapshot();
    http.sendJson(res, 200, snap);
  } catch (err) {
    var mock = map.mockNotionAccountsSnapshot();
    http.sendJson(res, 200, {
      source: 'error',
      accounts: mock.accounts,
      balances: mock.balances,
      warning: mock.warning,
      error: (err && err.message) || 'Failed to load Notion Accounts',
    });
  }
}

module.exports = handleAccounts;
module.exports.default = handleAccounts;
