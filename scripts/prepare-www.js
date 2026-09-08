'use strict';

/**
 * Copy the same static web app Capacitor loads in the native WebView.
 * Does not copy API routes, scripts, or native project folders.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = path.join(root, 'www');

const FILES = [
  'index.html',
  'Zenith.html',
  'app.jsx',
  'state.js',
  'ios-frame.jsx',
  'manifest.webmanifest',
];

const DIRS = ['components', 'lib', 'icons'];
const SKIP_DIR_NAMES = new Set(['server']);

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(ent.name)) continue;
    const from = path.join(src, ent.name);
    const to = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(from, to);
    else copyFile(from, to);
  }
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

for (const file of FILES) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) throw new Error('missing ' + file);
  copyFile(src, path.join(dest, file));
}

for (const dir of DIRS) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) throw new Error('missing ' + dir);
  copyDir(src, path.join(dest, dir));
}

const index = fs.readFileSync(path.join(dest, 'index.html'), 'utf8');
if (!index.includes('capacitor-bridge.js')) {
  throw new Error('www/index.html must load lib/capacitor-bridge.js');
}

console.log('prepared Capacitor webDir:', dest);
module.exports = { dest, FILES, DIRS };
