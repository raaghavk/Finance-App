// Paywall.jsx — Zenith Pro gate (Travel unlimited). PWA unlock persists locally until App Store IAP.

function PaywallScreen({ store, feature, onUnlock, onClose }) {
  const locale = (store.user && store.user.locale) || 'en';
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;
  const reason = feature === 'history' ? t(locale, 'historyPro')
    : feature === 'sos' ? t(locale, 'sosPro')
    : feature === 'expense' ? t(locale, 'expenseCap')
    : feature === 'trip' ? t(locale, 'secondTrip')
    : feature === 'checklist' ? t(locale, 'checklistPro')
    : t(locale, 'proBlurb');

  return (
    <div style={{
      height: '100%', overflowY: 'auto', background: page,
      paddingTop: 'var(--zenith-pad-top)', paddingBottom: 'var(--zenith-pad-bottom)',
    }}>
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{
          border: 'none', background: 'none', color: accent, fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}>{t(locale, 'laterMaybe')}</button>
      </div>
      <div style={{ padding: '8px 24px 24px' }}>
        <div style={{
          background: zenithHeroGradient(), borderRadius: 28, padding: '28px 24px',
          boxShadow: zenithHeroShadow(), marginBottom: 20,
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{t(locale, 'zenithPro')}</p>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{t(locale, 'travel')}</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{reason}</p>
        </div>
        <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow(), marginBottom: 20 }}>
          {[
            { icon: '✈️', title: locale === 'hi' ? 'अनलिमिटेड ट्रिप' : 'Unlimited trips', sub: t(locale, 'travelDemo') },
            { icon: '🧾', title: t(locale, 'travelHistory'), sub: t(locale, 'perTripLedgerSub') },
            { icon: '🆘', title: t(locale, 'emergencyAssist'), sub: t(locale, 'emergencyAssistSub') },
            { icon: '🎒', title: t(locale, 'packingList'), sub: t(locale, 'checklistPro') },
          ].map((row, i, arr) => (
            <div key={row.title} style={{ display: 'flex', gap: 12, padding: '16px 18px', borderBottom: i < arr.length - 1 ? '1px solid ' + ZENITH.cream : 'none' }}>
              <div style={{ fontSize: 22 }}>{row.icon}</div>
              <div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{row.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 3, lineHeight: 1.4 }}>{row.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, textAlign: 'center', marginBottom: 14 }}>{t(locale, 'proPrice')}</p>
        <button type="button" onClick={onUnlock} style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: 18, cursor: 'pointer',
          background: accent, color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
          boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
        }}>{t(locale, 'subscribe')}</button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, textAlign: 'center', marginTop: 12, lineHeight: 1.45 }}>
          {locale === 'hi'
            ? 'PWA में प्रो इसी डिवाइस पर खुलता है। App Store बिलिंग Capacitor के साथ आएगी।'
            : 'On the Home Screen app, Pro unlocks on this device. App Store billing ships with the native wrap.'}
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { PaywallScreen });
