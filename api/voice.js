'use strict';

var http = require('../lib/server/http');
var parse = require('../lib/parse-expense');
var status = require('./status');

async function handler(req, res) {
  if (http.preflight(req, res)) return;
  if (req.method !== 'POST') {
    http.sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }
  var key = status.sarvamKey();
  if (!key) {
    http.sendJson(res, 501, {
      configured: false,
      error: 'SARVAM_API_KEY is not set. Add it to transcribe voice (Saaras).',
    });
    return;
  }

  try {
    var body = await http.readJson(req);
    var b64 = String(body.audioBase64 || '').replace(/^data:audio\/[^;]+;base64,/, '');
    if (!b64) {
      http.sendJson(res, 400, { error: 'audioBase64 is required' });
      return;
    }
    var buf = Buffer.from(b64, 'base64');
    if (!buf.length) {
      http.sendJson(res, 400, { error: 'Empty audio' });
      return;
    }
    var mime = body.mimeType || 'audio/webm';
    var ext = mime.indexOf('wav') >= 0 ? 'wav' : mime.indexOf('mp4') >= 0 ? 'm4a' : 'webm';
    var form = new FormData();
    form.append('file', new Blob([buf], { type: mime }), 'clip.' + ext);
    form.append('model', 'saaras:v3');
    form.append('mode', 'codemix');
    form.append('language_code', 'unknown');

    var r = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: { 'api-subscription-key': key },
      body: form,
    });
    var json = await r.json().catch(function () { return {}; });
    if (!r.ok) {
      http.sendJson(res, 502, { error: json.message || json.error || ('Sarvam HTTP ' + r.status) });
      return;
    }
    var transcript = json.transcript || '';
    var parsed = parse.parseExpenseUtterance(transcript);
    http.sendJson(res, 200, {
      configured: true,
      transcript: transcript,
      amount: parsed.amount,
      merchant: parsed.merchant,
    });
  } catch (err) {
    http.sendJson(res, 500, { error: (err && err.message) || 'Voice transcribe failed' });
  }
}

module.exports = handler;
module.exports.default = handler;
