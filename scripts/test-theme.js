'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { zenithShouldUseDeviceFrame } = require('../lib/zenith-chrome');
const map = require('../lib/notion/map');

const root = path.join(__dirname, '..');
const state = fs.readFileSync(path.join(root, 'state.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const zenithHtml = fs.readFileSync(path.join(root, 'Zenith.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.jsx'), 'utf8');

assert.match(state, /accent:\s*'#2563EB'/);
assert.match(state, /page:\s*'#F2F5FA'/);
assert.match(state, /ink:\s*'#0F172A'/);
assert.doesNotMatch(state, /#C45C26/);
assert.doesNotMatch(state, /#F7F0E6/);
assert.strictEqual(map.ACCOUNT_COLORS.Cash, '#2563EB');
assert.ok(!JSON.stringify(map.CATEGORY_COLORS).includes('#C45C26'));

assert.match(html, /manifest\.webmanifest/);
assert.match(html, /apple-mobile-web-app-capable/);
assert.match(html, /viewport-fit=cover/);
assert.match(html, /data-zenith-chrome="native"/);
assert.match(zenithHtml, /data-zenith-chrome="native"/);
assert.match(html, /zenithShouldUseDeviceFrame/);
assert.match(app, /zenithShouldUseDeviceFrame/);

const desktop = () => false;
const phone = (q) => q.includes('max-width');
const standalone = (q) => q.includes('display-mode');

assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'zenith-raaghavks-projects.vercel.app', search: '' }, desktop), false);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'zenith-raaghavks-projects.vercel.app', search: '?demo=1' }, desktop), false);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'localhost', search: '' }, phone), false);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'localhost', search: '' }, standalone), false);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'localhost', search: '' }, desktop), true);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: '127.0.0.1', search: '?demo=1' }, desktop), true);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'example.com', search: '' }, desktop), false);
assert.strictEqual(zenithShouldUseDeviceFrame({ hostname: 'example.com', search: '?demo=1' }, desktop), true);

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
assert.strictEqual(manifest.name, 'Zenith');
assert.strictEqual(manifest.display, 'standalone');
assert.strictEqual(manifest.theme_color, '#2563EB');
assert.strictEqual(manifest.background_color, '#F2F5FA');

['icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'].forEach((rel) => {
  assert.ok(fs.existsSync(path.join(root, rel)), rel);
});

console.log('theme + PWA + device-frame gate ok');
