'use strict';

var http = require('../lib/server/http');
var notion = require('../lib/notion/client');

function sarvamKey() {
  return (process.env.SARVAM_API_KEY || process.env.SARVAM_API_SUBSCRIPTION_KEY || '').trim();
}

function visionKey() {
  return (process.env.GOOGLE_CLOUD_VISION_API_KEY || process.env.GOOGLE_VISION_API_KEY || '').trim();
}

function supabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
}

function supabaseAnonKey() {
  var key = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (!key) return '';
  if (/service_role/i.test(key)) return '';
  return key;
}

async function handler(req, res) {
  if (http.preflight(req, res)) return;
  if (req.method && req.method !== 'GET') {
    http.sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  var url = supabaseUrl();
  var anon = supabaseAnonKey();
  http.sendJson(res, 200, {
    notion: notion.isNotionConfigured(),
    sarvam: Boolean(sarvamKey()),
    vision: Boolean(visionKey()),
    supabase: Boolean(url && anon),
    supabaseUrl: url && anon ? url : null,
    supabaseAnonKey: url && anon ? anon : null,
  });
}

module.exports = handler;
module.exports.default = handler;
module.exports.sarvamKey = sarvamKey;
module.exports.visionKey = visionKey;
module.exports.supabaseUrl = supabaseUrl;
module.exports.supabaseAnonKey = supabaseAnonKey;
