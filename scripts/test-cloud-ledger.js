'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const handleStatus = require('../api/status');
const cloud = require('../lib/cloud-ledger');

const root = path.join(__dirname, '..');
const ctx = {
  Date, JSON, Math, Number, String, Object, Array, parseFloat, parseInt, isNaN, Set,
  localStorage: { getItem: () => null, setItem: () => {} },
};
ctx.window = ctx;
vm.runInNewContext(fs.readFileSync(path.join(root, 'state.js'), 'utf8'), ctx);

assert.strictEqual(cloud.zenithCloudConfigFromStatus({}), null);
assert.strictEqual(cloud.zenithCloudConfigFromStatus({ supabaseUrl: 'https://x.supabase.co' }), null);
const cfg = cloud.zenithCloudConfigFromStatus({
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'anon-public',
});
assert.strictEqual(cfg.url, 'https://example.supabase.co');
assert.strictEqual(cfg.anonKey, 'anon-public');

const older = ctx.normalizeState({ version: 1, user: { name: 'Old' }, updatedAt: '2026-09-01T00:00:00.000Z' });
const newer = ctx.normalizeState({ version: 1, user: { name: 'New' }, updatedAt: '2026-09-13T12:00:00.000Z' });
assert.strictEqual(cloud.zenithPickNewerLedger(older, newer, newer.updatedAt).user.name, 'New');
assert.strictEqual(cloud.zenithPickNewerLedger(newer, older, older.updatedAt).user.name, 'New');
assert.strictEqual(cloud.zenithPickNewerLedger(newer, null, null).user.name, 'New');

function fakeRes(onEnd) {
  return {
    statusCode: 0,
    headers: {},
    setHeader: function (k, v) { this.headers[k] = v; },
    end: function (body) { onEnd(this, body); },
  };
}

async function statusJson() {
  return new Promise(function (resolve, reject) {
    handleStatus({ method: 'GET' }, fakeRes(function (res, body) {
      try { resolve({ res: res, json: JSON.parse(body) }); } catch (err) { reject(err); }
    }));
  });
}

(async function () {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_PUBLISHABLE_KEY;
  const off = await statusJson();
  assert.strictEqual(off.res.statusCode, 200);
  assert.strictEqual(off.json.supabase, false);
  assert.strictEqual(off.json.supabaseUrl, null);
  assert.strictEqual(off.json.supabaseAnonKey, null);

  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'sb_publishable_test';
  const on = await statusJson();
  assert.strictEqual(on.json.supabase, true);
  assert.strictEqual(on.json.supabaseUrl, 'https://example.supabase.co');
  assert.strictEqual(on.json.supabaseAnonKey, 'sb_publishable_test');
  assert.ok(!JSON.stringify(on.json).includes('service_role'));
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;

  const rows = [];
  const fakeClient = {
    from: function () {
      return {
        select: function () { return this; },
        eq: function () { return this; },
        maybeSingle: async function () { return { data: rows[0] || null, error: null }; },
        upsert: async function (row) { rows[0] = row; return { error: null }; },
      };
    },
    auth: {
      getSession: async function () {
        return { data: { session: { user: { id: 'user-1', email: 'raaghav@example.com' } } } };
      },
      signInWithPassword: async function (creds) {
        return { data: { user: { id: 'user-1', email: creds.email }, session: { user: { id: 'user-1' } } }, error: null };
      },
      signUp: async function (creds) {
        return { data: { user: { id: 'user-1', email: creds.email }, session: { user: { id: 'user-1' } } }, error: null };
      },
      signOut: async function () { return { error: null }; },
    },
  };

  const local = ctx.normalizeState({ version: 1, user: { name: 'Phone' }, updatedAt: '2026-09-13T10:00:00.000Z' });
  await cloud.zenithCloudPush(fakeClient, 'user-1', local);
  const pulled = await cloud.zenithCloudPull(fakeClient, 'user-1');
  assert.strictEqual(pulled.store.user.name, 'Phone');
  const signed = await cloud.zenithCloudSignIn(fakeClient, 'a@b.com', 'secret1');
  assert.strictEqual(signed.user.email, 'a@b.com');

  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260913140000_ledgers.sql'), 'utf8');
  assert.match(sql, /enable row level security/);
  assert.match(sql, /auth\.uid\(\) = user_id/);
  assert.match(sql, /revoke all on table public\.ledgers from anon/i);

  console.log('cloud ledger: merge, status keys, fake pull/push ok');
})().catch(function (err) {
  console.error(err);
  process.exit(1);
});
