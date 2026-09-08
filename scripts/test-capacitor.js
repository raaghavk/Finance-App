'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { zenithShouldUseDeviceFrame, zenithIsNativeShell } = require('../lib/zenith-chrome');

const root = path.join(__dirname, '..');

const config = JSON.parse(fs.readFileSync(path.join(root, 'capacitor.config.json'), 'utf8'));
assert.strictEqual(config.appId, 'app.zenith.finance');
assert.strictEqual(config.appName, 'Zenith');
assert.strictEqual(config.webDir, 'www');
assert.strictEqual(config.ios.contentInset, 'never');
assert.strictEqual(config.plugins.StatusBar.overlaysWebView, true);
assert.strictEqual(config.plugins.StatusBar.style, 'LIGHT');
assert.strictEqual(config.plugins.SplashScreen.launchAutoHide, true);
assert.strictEqual(config.plugins.SplashScreen.backgroundColor, '#2563EB');

const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.ok(Array.isArray(vercel.rewrites) && vercel.rewrites.length >= 6);
assert.ok(vercel.headers.some((h) => h.source === '/manifest.webmanifest'));

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const zenithHtml = fs.readFileSync(path.join(root, 'Zenith.html'), 'utf8');
assert.match(html, /capacitor-bridge\.js/);
assert.match(zenithHtml, /capacitor-bridge\.js/);
assert.match(html, /Capacitor/);
assert.match(html, /viewport-fit=cover/);
assert.match(html, /env\(safe-area-inset-top/);
assert.match(html, /env\(safe-area-inset-bottom/);

const docs = fs.readFileSync(path.join(root, 'docs/native-builds.md'), 'utf8');
assert.match(docs, /TestFlight/);
assert.match(docs, /Xcode/);
assert.match(docs, /App Store/);
assert.match(docs, /do not submit/i);

['resources/icon.png', 'resources/splash.png'].forEach((rel) => {
  assert.ok(fs.existsSync(path.join(root, rel)), rel);
  const buf = fs.readFileSync(path.join(root, rel));
  assert.ok(buf.length > 100, rel + ' too small');
  assert.strictEqual(buf[0], 0x89);
  assert.strictEqual(String.fromCharCode(buf[1], buf[2], buf[3]), 'PNG');
});

const desktop = () => false;
assert.strictEqual(
  zenithShouldUseDeviceFrame({ hostname: 'localhost', search: '' }, desktop, true),
  false
);
assert.strictEqual(
  zenithIsNativeShell({ Capacitor: { isNativePlatform: () => true }, navigator: { userAgent: 'Mozilla' } }),
  true
);
assert.strictEqual(
  zenithIsNativeShell({ Capacitor: { isNativePlatform: () => false }, navigator: { userAgent: 'Mozilla' } }),
  false
);

require('./prepare-www.js');
const wwwIndex = path.join(root, 'www', 'index.html');
assert.ok(fs.existsSync(wwwIndex));
assert.match(fs.readFileSync(wwwIndex, 'utf8'), /capacitor-bridge\.js/);
assert.ok(fs.existsSync(path.join(root, 'www', 'lib', 'capacitor-bridge.js')));
assert.ok(fs.existsSync(path.join(root, 'www', 'icons', 'icon-512.png')));
assert.ok(!fs.existsSync(path.join(root, 'www', 'api')));
assert.ok(!fs.existsSync(path.join(root, 'www', 'lib', 'server')));

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.ok(pkg.dependencies['@capacitor/core']);
assert.ok(pkg.dependencies['@capacitor/ios']);
assert.ok(pkg.dependencies['@capacitor/android']);
assert.ok(pkg.dependencies['@capacitor/splash-screen']);
assert.ok(pkg.dependencies['@capacitor/status-bar']);

assert.ok(fs.existsSync(path.join(root, 'ios', 'App', 'App.xcodeproj')) || fs.existsSync(path.join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj')));
assert.ok(fs.existsSync(path.join(root, 'android', 'app', 'build.gradle')) || fs.existsSync(path.join(root, 'android', 'app', 'build.gradle.kts')));
assert.match(fs.readFileSync(path.join(root, 'android', 'app', 'src', 'main', 'res', 'values', 'colors.xml'), 'utf8'), /#2563EB/);
assert.match(fs.readFileSync(path.join(root, 'ios', 'App', 'App', 'Info.plist'), 'utf8'), /UIStatusBarStyleDarkContent/);
assert.match(fs.readFileSync(path.join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj'), 'utf8'), /app\.zenith\.finance/);

console.log('capacitor scaffold ok');
