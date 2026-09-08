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
  var key = status.visionKey();
  if (!key) {
    http.sendJson(res, 501, {
      configured: false,
      error: 'GOOGLE_CLOUD_VISION_API_KEY is not set. Photo attach still works without OCR.',
    });
    return;
  }

  try {
    var body = await http.readJson(req);
    var b64 = String(body.imageBase64 || '').replace(/^data:image\/[^;]+;base64,/, '');
    if (!b64) {
      http.sendJson(res, 400, { error: 'imageBase64 is required' });
      return;
    }
    var r = await fetch('https://vision.googleapis.com/v1/images:annotate?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: b64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        }],
      }),
    });
    var json = await r.json().catch(function () { return {}; });
    if (!r.ok) {
      var msg = (json.error && json.error.message) || ('Vision HTTP ' + r.status);
      http.sendJson(res, 502, { error: msg });
      return;
    }
    var resp = (json.responses && json.responses[0]) || {};
    var text = (resp.fullTextAnnotation && resp.fullTextAnnotation.text)
      || (resp.textAnnotations && resp.textAnnotations[0] && resp.textAnnotations[0].description)
      || '';
    var parsed = parse.parseReceiptText(text);
    http.sendJson(res, 200, {
      configured: true,
      transcript: text,
      amount: parsed.amount,
      merchant: parsed.merchant,
    });
  } catch (err) {
    http.sendJson(res, 500, { error: (err && err.message) || 'OCR failed' });
  }
}

module.exports = handler;
module.exports.default = handler;
