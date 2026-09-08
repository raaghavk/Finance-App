'use strict';

var http = require('../lib/server/http');
var notion = require('../lib/notion/client');

function sarvamKey() {
  return (process.env.SARVAM_API_KEY || process.env.SARVAM_API_SUBSCRIPTION_KEY || '').trim();
}

function visionKey() {
  return (process.env.GOOGLE_CLOUD_VISION_API_KEY || process.env.GOOGLE_VISION_API_KEY || '').trim();
}

async function handler(req, res) {
  if (http.preflight(req, res)) return;
  if (req.method && req.method !== 'GET') {
    http.sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  http.sendJson(res, 200, {
    notion: notion.isNotionConfigured(),
    sarvam: Boolean(sarvamKey()),
    vision: Boolean(visionKey()),
  });
}

module.exports = handler;
module.exports.default = handler;
module.exports.sarvamKey = sarvamKey;
module.exports.visionKey = visionKey;
