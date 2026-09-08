#!/usr/bin/env node
/**
 * Local static + /api server for Notion read path, Sarvam voice, and Vision OCR.
 * Usage: node scripts/dev-server.js
 * Optional: NOTION_TOKEN, SARVAM_API_KEY, GOOGLE_CLOUD_VISION_API_KEY
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const handleExpenses = require('../api/expenses');
const handleAccounts = require('../api/accounts');
const handleBudgets = require('../api/budgets');
const handleStatus = require('../api/status');
const handleVoice = require('../api/voice');
const handleOcr = require('../api/ocr');
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.ZENITH_PORT || process.env.PORT || 5173);

function loadDotenv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed[0] === '#') return;
    const eq = trimmed.indexOf('=');
    if (eq < 1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val[0] === '"' && val.endsWith('"')) || (val[0] === "'" && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] == null) process.env[key] = val;
  });
}
loadDotenv();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ts': 'text/plain; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = decoded === '/' ? '/index.html' : decoded;
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  if (url.pathname === '/api/expenses' || url.pathname === '/api/expenses/') {
    return handleExpenses(req, res);
  }
  if (url.pathname === '/api/accounts' || url.pathname === '/api/accounts/') {
    return handleAccounts(req, res);
  }
  if (url.pathname === '/api/budgets' || url.pathname === '/api/budgets/') {
    return handleBudgets(req, res);
  }
  if (url.pathname === '/api/status' || url.pathname === '/api/status/') {
    return handleStatus(req, res);
  }
  if (url.pathname === '/api/voice' || url.pathname === '/api/voice/') {
    return handleVoice(req, res);
  }
  if (url.pathname === '/api/ocr' || url.pathname === '/api/ocr/') {
    return handleOcr(req, res);
  }
  const file = safePath(url.pathname);
  if (!file) {
    res.statusCode = 400;
    res.end('bad path');
    return;
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Zenith API at http://127.0.0.1:' + PORT + '/Zenith.html');
});
