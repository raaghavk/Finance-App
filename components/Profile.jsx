// Profile.jsx — You tab: locale, INR-only, local-only copy

function ProfileScreen({ store, onSetLocale, onReset, onNavigate, onExport }) {
  const locale = store.user.locale || 'en';
  const daysTracking = (() => {
    if (!store.startedAt) return 1;
    const a = new Date(store.startedAt + 'T12:00:00');
    const b = new Date();
    return Math.max(1, Math.ceil((b - a) / 86400000));
  })();
  const totalTransactions = (store.transactions || []).length;
  const budget = totalBudgetLimit(store);
  const spent = monthExpenseTotal(store);
  const saved = Math.max(budget - spent, 0);

  const Row = ({ label, sub, last, danger, children, onClick }) => (
    <div
      onClick={onClick}
      style={{
        padding: '14px 20px',
        borderBottom: last ? 'none' : '1px solid #F2F2F7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: danger ? '#FF3B30' : '#1C1C1E' }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginTop: 3 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F5F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '0 24px 24px', textAlign: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 28, margin: '0 auto 14px',
          background: 'linear-gradient(145deg, #007AFF, #5856D6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#FFFFFF' }}>
            {(store.user.name || 'Z')[0].toUpperCase()}
          </span>
        </div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#121212', marginBottom: 4 }}>
          {store.user.name}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>
          {store.startedAt ? new Date(store.startedAt + 'T12:00:00').toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {[
            { label: locale === 'hi' ? 'दिन' : 'Days', value: daysTracking },
            { label: locale === 'hi' ? 'लेन-देन' : 'Txns', value: totalTransactions },
            { label: locale === 'hi' ? 'बचा' : 'Left', value: fmtCompact(saved) },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '14px 8px' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#007AFF' }}>{s.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{t(locale, 'language')}</p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        <Row label={t(locale, 'language')} last>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['en', 'English'], ['hi', 'हिंदी']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={locale === id}
                onClick={() => onSetLocale && onSetLocale(id)}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: locale === id ? '#007AFF' : '#F0F0F3',
                  color: locale === id ? '#fff' : '#3C3C43',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                }}
              >{label}</button>
            ))}
          </div>
        </Row>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'पैसा' : 'Money'}
      </p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        <Row label={t(locale, 'accounts')} sub={fmt(netWorth(store))} onClick={() => onNavigate && onNavigate('accounts')} />
        <Row label={t(locale, 'merchants')} sub={String((store.merchants || []).length)} onClick={() => onNavigate && onNavigate('merchants')} />
        <Row label={t(locale, 'manageCats')} sub={String((store.categories || []).length)} onClick={() => onNavigate && onNavigate('categoriesManage')} />
        <Row label={locale === 'hi' ? 'मुद्रा' : 'Currency'} sub="INR" />
        <Row label={t(locale, 'budgets')} sub={budget > 0 ? fmt(budget) : t(locale, 'noBudgetYet')} onClick={() => onNavigate && onNavigate('budget')} last />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'बाद में' : 'Later'}
      </p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        <Row label={locale === 'hi' ? 'ट्रैवल' : 'Travel'} sub={t(locale, 'travelLater')} last />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'गोपनीयता' : 'Privacy'}
      </p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        <Row
          label={locale === 'hi' ? 'CSV निकालें' : 'Export CSV'}
          sub={locale === 'hi' ? 'इस डिवाइस पर डाउनलोड' : 'Download on this device'}
          onClick={onExport}
        />
        <Row
          label={locale === 'hi' ? 'सारा डेटा मिटाएँ' : 'Clear all data'}
          danger
          sub={locale === 'hi' ? 'ऑनबोर्डिंग फिर से शुरू होगी' : 'Starts onboarding again'}
          last
          onClick={onReset}
        />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{t(locale, 'categories')}</p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        {store.categories.filter((c) => c.type === 'expense').slice(0, 8).map((c, i, arr) => (
          <Row key={c.id} label={catLabel(c, locale)} sub={c.emoji} last={i === arr.length - 1} onClick={() => onNavigate && onNavigate('categoriesManage')} />
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '8px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', lineHeight: 1.45 }}>{t(locale, 'localOnly')}</p>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
