/**
 * iPhone PWAs with black-translucent status bars paint under the Dynamic Island.
 * env(safe-area-inset-*) is sometimes 0 in standalone Safari, so we set CSS
 * fallbacks from screen size. iPhone 14 Pro Max is 430×932 CSS pixels.
 */
'use strict';

function zenithIosStandalone(win) {
  const nav = (win && win.navigator) || {};
  const standalone = !!(nav.standalone
    || (win.matchMedia && win.matchMedia('(display-mode: standalone)').matches)
    || (win.matchMedia && win.matchMedia('(display-mode: fullscreen)').matches));
  const isIos = /iP(hone|ad|od)/.test(String(nav.userAgent || ''));
  return { standalone: standalone, isIos: isIos };
}

function zenithSafeAreaFallback(win) {
  const loc = win && win.location;
  if (loc && /(?:\?|&)iphone=1(?:&|$)/.test(String(loc.search || ''))) {
    return { top: 59, bottom: 34, standalone: true, isIos: true, simulated: true };
  }
  const info = zenithIosStandalone(win);
  if (!info.isIos || !info.standalone) return { top: 0, bottom: 0, standalone: info.standalone, isIos: info.isIos };
  const screen = (win && win.screen) || {};
  const long = Math.max(Number(screen.height) || 0, Number(screen.width) || 0);
  // 14 Pro Max / Plus / large island phones
  if (long >= 900) return { top: 59, bottom: 34, standalone: true, isIos: true };
  // iPhone X–14 / 14 Pro
  if (long >= 812) return { top: 47, bottom: 34, standalone: true, isIos: true };
  return { top: 20, bottom: 0, standalone: true, isIos: true };
}

function zenithApplyIosSafeArea(win) {
  const target = win || (typeof window !== 'undefined' ? window : null);
  const pad = zenithSafeAreaFallback(target);
  const root = target && target.document && target.document.documentElement;
  if (root && root.style) {
    root.style.setProperty('--zenith-safe-top', pad.top + 'px');
    root.style.setProperty('--zenith-safe-bottom', pad.bottom + 'px');
    root.dataset.zenithStandalone = pad.standalone ? '1' : '0';
  }
  return pad;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { zenithIosStandalone, zenithSafeAreaFallback, zenithApplyIosSafeArea };
}
if (typeof window !== 'undefined') {
  window.zenithIosStandalone = zenithIosStandalone;
  window.zenithSafeAreaFallback = zenithSafeAreaFallback;
  window.zenithApplyIosSafeArea = zenithApplyIosSafeArea;
  zenithApplyIosSafeArea(window);
  window.addEventListener('resize', function () { zenithApplyIosSafeArea(window); });
  window.addEventListener('orientationchange', function () { zenithApplyIosSafeArea(window); });
}
