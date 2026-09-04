// Notifications.jsx — Real near-limit alerts only

function NotificationsScreen({ store, onBack, onMarkRead }) {
  const locale = store.user.locale || 'en';
  const alerts = buildAlerts(store);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 16px' }}>
        <button type="button" aria-label={locale === 'hi' ? 'वापस' : 'Back'} onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007AFF', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
          {locale === 'hi' ? '← वापस' : '← Back'}
        </button>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E' }}>{t(locale, 'alerts')}</h1>
      </div>
      {alerts.length === 0 ? (
        <div style={{ padding: '40px 28px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#1C1C1E', marginBottom: 8 }}>{t(locale, 'allCaughtUp')}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93', lineHeight: 1.5 }}>{t(locale, 'allCaughtUpSub')}</p>
        </div>
      ) : (
        <div style={{ padding: '0 20px' }}>
          {alerts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onMarkRead && onMarkRead(a.id)}
              style={{
                width: '100%', textAlign: 'left', marginBottom: 10,
                background: '#FFFFFF', border: 'none', borderRadius: 18, padding: '16px', cursor: 'pointer',
              }}
            >
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: a.over ? '#FF3B30' : '#FF9500' }}>{a.title}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', marginTop: 4 }}>{a.body}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { NotificationsScreen });
