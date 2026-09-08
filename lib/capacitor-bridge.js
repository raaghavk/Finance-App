/**
 * Native shell only. On the web / PWA this is a no-op.
 * Hides the splash, overlays the status bar, and forces full-bleed chrome
 * (never the fake iPhone bezel) when running inside Capacitor.
 */
'use strict';

(function () {
  function isNative() {
    try {
      var Cap = typeof window !== 'undefined' ? window.Capacitor : null;
      if (Cap && typeof Cap.isNativePlatform === 'function' && Cap.isNativePlatform()) {
        return true;
      }
    } catch (e) { /* ignore */ }
    try {
      return /Capacitor/i.test(String((typeof navigator !== 'undefined' && navigator.userAgent) || ''));
    } catch (e) {
      return false;
    }
  }

  function applyChrome() {
    if (!isNative()) return;
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.zenithChrome = 'native';
    }
  }

  function applyPlugins() {
    applyChrome();
    var Cap = typeof window !== 'undefined' ? window.Capacitor : null;
    if (!Cap || !isNative()) return;
    var plugins = Cap.Plugins || {};
    try {
      if (plugins.StatusBar) {
        if (plugins.StatusBar.setStyle) plugins.StatusBar.setStyle({ style: 'LIGHT' });
        if (plugins.StatusBar.setOverlaysWebView) {
          plugins.StatusBar.setOverlaysWebView({ overlay: true });
        }
      }
    } catch (e) { /* ignore */ }
    try {
      if (plugins.SplashScreen && plugins.SplashScreen.hide) plugins.SplashScreen.hide();
    } catch (e) { /* ignore */ }
  }

  if (typeof document === 'undefined') return;
  applyChrome();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPlugins);
  } else {
    applyPlugins();
  }
  window.addEventListener('capacitor:ready', applyPlugins);
  document.addEventListener('deviceready', applyPlugins);

  if (typeof window !== 'undefined') {
    window.zenithCapacitorBridge = { isNative: isNative, applyPlugins: applyPlugins };
  }
})();
