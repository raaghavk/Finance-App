/**
 * Never draw a nested fake iPhone (Dynamic Island / 9:41 / bezel).
 * Add to Home Screen should feel like a normal app — Safari chrome is gone
 * via the PWA manifest; this function only exists so old callers stay safe.
 */
'use strict';

function zenithShouldUseDeviceFrame() {
  return false;
}

function zenithApplyChromeDataset() {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.zenithChrome = 'native';
  }
  return false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { zenithShouldUseDeviceFrame, zenithApplyChromeDataset };
}
if (typeof window !== 'undefined') {
  window.zenithShouldUseDeviceFrame = zenithShouldUseDeviceFrame;
  window.zenithApplyChromeDataset = zenithApplyChromeDataset;
}
