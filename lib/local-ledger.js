/**
 * Local-first ledger helpers. Notion/remote sync is OFF unless ?notion=1
 * or localStorage zenith_notion=1.
 */
'use strict';

function zenithNotionEnabled(loc, storage) {
  loc = loc || (typeof location !== 'undefined' ? location : {});
  if (/(?:^|[?&])notion=1(?:&|$)/.test(String(loc.search || ''))) return true;
  try {
    storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    return !!(storage && storage.getItem('zenith_notion') === '1');
  } catch (e) {
    return false;
  }
}

function localAccountTint(id) {
  if (id === 'cash') return (typeof ZENITH !== 'undefined' && ZENITH.accent) || '#2563EB';
  if (id === 'bank') return (typeof ZENITH !== 'undefined' && ZENITH.accentDeep) || '#1D4ED8';
  if (id === 'card') return '#0F766E';
  return (typeof ZENITH !== 'undefined' && ZENITH.muted) || '#64748B';
}

function localAccountBalances(store) {
  store = store || {};
  return (store.accounts || []).map(function (a) {
    var opening = a.id === 'cash'
      ? (Number(store.openingCash) || 0)
      : (Number(a.opening) || 0);
    var spent = 0;
    var income = 0;
    (store.transactions || []).forEach(function (tx) {
      if (tx.accountId !== a.id) return;
      var amt = Number(tx.amount) || 0;
      if (tx.type === 'income') income += amt;
      else spent += amt;
    });
    return {
      id: a.id,
      name: a.name,
      nameHi: a.nameHi,
      opening: opening,
      spent: spent,
      income: income,
      balance: opening + income - spent,
      color: localAccountTint(a.id),
    };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { zenithNotionEnabled, localAccountBalances, localAccountTint };
}
if (typeof window !== 'undefined') {
  window.zenithNotionEnabled = zenithNotionEnabled;
  window.localAccountBalances = localAccountBalances;
  window.localAccountTint = localAccountTint;
}
