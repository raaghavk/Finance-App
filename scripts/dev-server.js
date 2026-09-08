#!/usr/bin/env node
/**
 * Local static + /api/expenses server for Notion read path.
 * Usage: node scripts/dev-server.js
 * Optional: NOTION_TOKEN + NOTION_EXPENSES_DATA_SOURCE_ID
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const handleExpenses = require('../api/expenses');
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.ZENITH_PORT || process.env.PORT || 5173);

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
  console.log('Zenith + Notion API at http://127.0.0.1:' + PORT + '/Zenith.html');
});
