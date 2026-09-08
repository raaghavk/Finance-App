/**
 * Fake iPhone bezel is OFF by default.
 * Never on Vercel, never on real phones / PWA standalone.
 * Opt-in: localhost desktop, or ?demo=1 on a wide non-Vercel viewport.
 */
'use strict';

function zenithShouldUseDeviceFrame(loc, mediaMatches) {
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

function zenithApplyChromeDataset(loc, mediaMatches) {
  var useFrame = zenithShouldUseDeviceFrame(loc, mediaMatches);
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.zenithChrome = useFrame ? 'frame' : 'native';
  }
  return useFrame;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { zenithShouldUseDeviceFrame, zenithApplyChromeDataset };
}
if (typeof window !== 'undefined') {
  window.zenithShouldUseDeviceFrame = zenithShouldUseDeviceFrame;
  window.zenithApplyChromeDataset = zenithApplyChromeDataset;
}
