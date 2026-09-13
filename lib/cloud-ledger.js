/**
 * Optional cloud ledger. Local storage stays the cache.
 * Requires a dedicated Liora Supabase project (never FarmOps / Kanoz DBs).
 */
'use strict';

function zenithCloudConfigFromStatus(status) {
  if (!status || !status.supabaseUrl || !status.supabaseAnonKey) return null;
  return { url: String(status.supabaseUrl), anonKey: String(status.supabaseAnonKey) };
}

function zenithCloudCreateClient(cfg, factory) {
  var create = factory;
  if (!create && typeof supabase !== 'undefined' && supabase && typeof supabase.createClient === 'function') {
    create = supabase.createClient.bind(supabase);
  }
  if (!cfg || !cfg.url || !cfg.anonKey || typeof create !== 'function') return null;
  return create(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

function zenithLedgerTime(store) {
  var raw = store && store.updatedAt;
  var n = Date.parse(raw || 0);
  return Number.isFinite(n) ? n : 0;
}

function zenithPickNewerLedger(local, remoteStore, remoteUpdatedAt) {
  if (!remoteStore) return local;
  var remote = typeof normalizeState === 'function' ? normalizeState(remoteStore) : remoteStore;
  var rt = Date.parse(remoteUpdatedAt || (remote && remote.updatedAt) || 0) || 0;
  var lt = zenithLedgerTime(local);
  if (rt > lt) {
    if (!remote.updatedAt && remoteUpdatedAt) remote.updatedAt = remoteUpdatedAt;
    return remote;
  }
  return local;
}

async function zenithCloudFetchStatus(fetcher) {
  var fn = fetcher || (typeof fetch === 'function' ? fetch : null);
  if (!fn) return null;
  var res = await fn('/api/status');
  if (!res || !res.ok) return null;
  return res.json();
}

async function zenithCloudPull(client, userId) {
  if (!client || !userId) return null;
  var result = await client.from('ledgers').select('store, updated_at').eq('user_id', userId).maybeSingle();
  if (result.error && result.error.code !== 'PGRST116') throw result.error;
  return result.data || null;
}

async function zenithCloudPush(client, userId, store) {
  if (!client || !userId || !store) return;
  var updatedAt = store.updatedAt || new Date().toISOString();
  var result = await client.from('ledgers').upsert({
    user_id: userId,
    store: store,
    updated_at: updatedAt,
  }, { onConflict: 'user_id' });
  if (result.error) throw result.error;
}

async function zenithCloudSignIn(client, email, password) {
  var result = await client.auth.signInWithPassword({ email: email, password: password });
  return { user: result.data && result.data.user, session: result.data && result.data.session, error: result.error };
}

async function zenithCloudSignUp(client, email, password) {
  var result = await client.auth.signUp({ email: email, password: password });
  return { user: result.data && result.data.user, session: result.data && result.data.session, error: result.error };
}

async function zenithCloudSignOut(client) {
  if (!client) return;
  await client.auth.signOut();
}

async function zenithCloudSessionUser(client) {
  if (!client || !client.auth || typeof client.auth.getSession !== 'function') return null;
  var result = await client.auth.getSession();
  return result && result.data && result.data.session && result.data.session.user ? result.data.session.user : null;
}

async function zenithCloudBoot(opts) {
  opts = opts || {};
  var status = opts.status || await zenithCloudFetchStatus(opts.fetch);
  var cfg = zenithCloudConfigFromStatus(status);
  if (!cfg) return { enabled: false, client: null, user: null, store: null, error: '' };
  var client = zenithCloudCreateClient(cfg, opts.factory);
  if (!client) return { enabled: false, client: null, user: null, store: null, error: '' };
  var user = await zenithCloudSessionUser(client);
  if (!user) return { enabled: true, client: client, user: null, store: null, error: '' };
  var row = await zenithCloudPull(client, user.id);
  var local = opts.local;
  var chosen = zenithPickNewerLedger(local, row && row.store, row && row.updated_at);
  return { enabled: true, client: client, user: user, store: chosen, remote: row, error: '' };
}

var api = {
  zenithCloudConfigFromStatus: zenithCloudConfigFromStatus,
  zenithCloudCreateClient: zenithCloudCreateClient,
  zenithLedgerTime: zenithLedgerTime,
  zenithPickNewerLedger: zenithPickNewerLedger,
  zenithCloudFetchStatus: zenithCloudFetchStatus,
  zenithCloudPull: zenithCloudPull,
  zenithCloudPush: zenithCloudPush,
  zenithCloudSignIn: zenithCloudSignIn,
  zenithCloudSignUp: zenithCloudSignUp,
  zenithCloudSignOut: zenithCloudSignOut,
  zenithCloudSessionUser: zenithCloudSessionUser,
  zenithCloudBoot: zenithCloudBoot,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  Object.assign(window, api);
}
