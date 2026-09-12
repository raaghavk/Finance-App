/**
 * Cool-blue light / dark tokens. Mutates the shared ZENITH object and CSS vars.
 */
'use strict';

var ZENITH_LIGHT = {
  page: '#F2F5FA',
  ink: '#0F172A',
  muted: '#64748B',
  accent: '#2563EB',
  accentDeep: '#1D4ED8',
  card: '#FFFFFF',
  cream: '#E8EEF7',
  live: '#059669',
  warn: '#D97706',
  hairline: 'rgba(15,23,42,0.08)',
  navBg: 'rgba(255,255,255,0.94)',
};

var ZENITH_DARK = {
  page: '#0B1220',
  ink: '#F8FAFC',
  muted: '#94A3B8',
  accent: '#3B82F6',
  accentDeep: '#2563EB',
  card: '#111827',
  cream: '#1E293B',
  live: '#34D399',
  warn: '#FBBF24',
  hairline: 'rgba(248,250,252,0.10)',
  navBg: 'rgba(17,24,39,0.94)',
};

function zenithThemeTokens(mode) {
  return mode === 'dark' ? ZENITH_DARK : ZENITH_LIGHT;
}

function applyZenithTheme(mode, doc) {
  var tokens = zenithThemeTokens(mode === 'dark' ? 'dark' : 'light');
  if (typeof ZENITH !== 'undefined') {
    Object.keys(tokens).forEach(function (k) { ZENITH[k] = tokens[k]; });
  }
  doc = doc || (typeof document !== 'undefined' ? document : null);
  if (!doc || !doc.documentElement) return tokens;
  var root = doc.documentElement;
  root.dataset.theme = mode === 'dark' ? 'dark' : 'light';
  root.style.setProperty('--zenith-page', tokens.page);
  root.style.setProperty('--zenith-ink', tokens.ink);
  root.style.setProperty('--zenith-muted', tokens.muted);
  root.style.setProperty('--zenith-accent', tokens.accent);
  root.style.setProperty('--zenith-card', tokens.card);
  root.style.setProperty('--zenith-cream', tokens.cream);
  if (doc.body) doc.body.style.background = tokens.page;
  var meta = doc.querySelector && doc.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', mode === 'dark' ? tokens.page : tokens.accent);
  return tokens;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ZENITH_LIGHT, ZENITH_DARK, zenithThemeTokens, applyZenithTheme };
}
if (typeof window !== 'undefined') {
  window.ZENITH_LIGHT = ZENITH_LIGHT;
  window.ZENITH_DARK = ZENITH_DARK;
  window.zenithThemeTokens = zenithThemeTokens;
  window.applyZenithTheme = applyZenithTheme;
}
