/**
 * Browser fetch for Notion expenses. Falls back to example data when /api/expenses is missing.
 */
(function () {
  var cache = null;
  var inflight = null;

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

  function loadNotionExpenses(force) {
    if (!force && cache) return Promise.resolve(cache);
    if (!force && inflight) return inflight;

    inflight = fetch('api/expenses', { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (text) {
            throw new Error('HTTP ' + res.status + (text ? ': ' + text.slice(0, 180) : ''));
          });
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.expenses)) {
          throw new Error('Unexpected API payload');
        }
        if (!data.report && typeof buildMonthReport === 'function') {
          data.report = buildMonthReport(data.expenses);
        }
        cache = data;
        inflight = null;
        return data;
      })
      .catch(function (err) {
        inflight = null;
        var snap = snapshotFromMock(
          'Showing example data. Wire NOTION_TOKEN on the server (or Vercel) to load live Notion Expenses.',
          err && err.message
        );
        cache = snap;
        return snap;
      });

    return inflight;
  }

  function getCachedNotionExpenses() {
    return cache;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.loadNotionExpenses = loadNotionExpenses;
    globalThis.getCachedNotionExpenses = getCachedNotionExpenses;
  }
})();
