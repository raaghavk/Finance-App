'use strict';

const assert = require('assert');
const handleStatus = require('../api/status');
const handleVoice = require('../api/voice');
const handleOcr = require('../api/ocr');

function fakeRes(onEnd) {
  return {
    statusCode: 0,
    headers: {},
    setHeader: function (k, v) { this.headers[k] = v; },
    end: function (body) { onEnd(this, body); },
  };
}

async function call(handler, req) {
  return new Promise(function (resolve, reject) {
    Promise.resolve(handler(req, fakeRes(function (res, body) {
      try {
        resolve({ res: res, json: JSON.parse(body) });
      } catch (err) { reject(err); }
    }))).catch(reject);
  });
}

async function main() {
  const status = await call(handleStatus, { method: 'GET' });
  assert.strictEqual(status.res.statusCode, 200);
  assert.strictEqual(status.json.notion, false);
  assert.strictEqual(status.json.sarvam, false);
  assert.strictEqual(status.json.vision, false);

  const voice = await call(handleVoice, { method: 'POST' });
  assert.strictEqual(voice.res.statusCode, 501);
  assert.strictEqual(voice.json.configured, false);
  assert.ok(String(voice.json.error).includes('SARVAM_API_KEY'));

  const ocr = await call(handleOcr, { method: 'POST' });
  assert.strictEqual(ocr.res.statusCode, 501);
  assert.strictEqual(ocr.json.configured, false);
  assert.ok(String(ocr.json.error).includes('GOOGLE_CLOUD_VISION_API_KEY'));

  console.log('ok — capture APIs unconfigured (status / voice / ocr)');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
