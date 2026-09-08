/**
 * Fake iPhone bezel is OFF by default.
 * Never on Vercel, never on real phones / PWA standalone / Capacitor native.
 * Opt-in: localhost desktop, or ?demo=1 on a wide non-Vercel viewport.
 */
'use strict';

function zenithIsNativeShell(win) {
  win = win || (typeof window !== 'undefined' ? window : null);
  if (!win) return false;
  try {
    if (win.Capacitor && typeof win.Capacitor.isNativePlatform === 'function'
        && win.Capacitor.isNativePlatform()) {
      return true;
    }
  } catch (e) { /* ignore */ }
  try {
    var ua = (win.navigator && win.navigator.userAgent) || '';
    if (/Capacitor/i.test(String(ua))) return true;
  } catch (e) { /* ignore */ }
  return false;
}

function zenithShouldUseDeviceFrame(loc, mediaMatches, nativeShell) {
  if (nativeShell === true) return false;
  if (nativeShell !== false && zenithIsNativeShell()) return false;
  loc = loc || (typeof location !== 'undefined' ? location : {});
  var host = String(loc.hostname || '');
  var search = String(loc.search || '');
  if (/\.vercel\.app$/i.test(host)) return false;
  var mm = mediaMatches || function (query) {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };
  var standalone = false;
  try {
    standalone = !!mm('(display-mode: standalone)')
      || (typeof navigator !== 'undefined' && navigator.standalone === true);
  } catch (e) { standalone = false; }
  if (standalone) return false;
  if (mm('(max-width: 540px)')) return false;
  var local = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  var demo = /(?:^|[?&])demo=1(?:&|$)/.test(search);
  return local || demo;
}

function zenithApplyChromeDataset(loc, mediaMatches, nativeShell) {
  var useFrame = zenithShouldUseDeviceFrame(loc, mediaMatches, nativeShell);
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.zenithChrome = useFrame ? 'frame' : 'native';
  }
  return useFrame;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    zenithShouldUseDeviceFrame: zenithShouldUseDeviceFrame,
    zenithApplyChromeDataset: zenithApplyChromeDataset,
    zenithIsNativeShell: zenithIsNativeShell,
  };
}
if (typeof window !== 'undefined') {
  window.zenithShouldUseDeviceFrame = zenithShouldUseDeviceFrame;
  window.zenithApplyChromeDataset = zenithApplyChromeDataset;
  window.zenithIsNativeShell = zenithIsNativeShell;
}
