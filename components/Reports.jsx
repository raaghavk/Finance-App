// Reports.jsx — live month-over-month insights from the local store

function ReportsScreen({ store, onNavigate, onBack }) {
  const locale = store.user.locale || 'en';
  const now = new Date();
  const monthBars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBars.push({ key: monthKey(d), label: d.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short' }) });
  }
  const [activeKey, setActiveKey] = React.useState(monthKey());
  const insight = monthInsights(store, activeKey);
  const health = healthScore(store, activeKey);
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;
  const cream = ZENITH.cream;
  const vs = insight.delta == null ? t(locale, 'noChange')
    : insight.delta < 0 ? t(locale, 'lessSpend') : t(locale, 'moreSpend');
  const weekdayNames = locale === 'hi'
    ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekMax = Math.max(1, ...insight.weekday);
  const barMax = Math.max(1, ...monthBars.map((m) => monthExpenseTotal(store, m.key)));
  const daysIn = (() => {
    const p = activeKey.split('-').map(Number);
    return new Date(p[0], p[1], 0).getDate();
  })();

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader title={t(locale, 'insights')} leftLabel="‹" onLeft={onBack} />
      ) : (
        <div style={{ paddingTop: 'var(--zenith-pad-top)', padding: '12px 24px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: ink }}>{t(locale, 'insights')}</h1>
        </div>
      )}

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8 }}>
          {monthBars.map((m) => (
            <button key={m.key} type="button" onClick={() => setActiveKey(m.key)} style={{
              padding: '10px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: activeKey === m.key ? accent : card, color: activeKey === m.key ? '#FFFFFF' : ink,
              fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, boxShadow: zenithSoftShadow(),
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ background: zenithHeroGradient(), borderRadius: 24, padding: '22px', boxShadow: zenithHeroShadow(), position: 'relative', overflow: 'hidden' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'spentMonth')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, marginBottom: 8 }}>{fmt(insight.spent)}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            {vs}{insight.delta != null ? ' · ' + Math.abs(Math.round(insight.delta * 100)) + '%' : ''}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10 }}>
        {[
          { label: t(locale, 'txCount'), value: insight.txCount, color: accent },
          { label: t(locale, 'avgDay'), value: fmt(Math.round(insight.spent / daysIn)), color: '#7C3AED' },
          { label: t(locale, 'healthScore'), value: health.score, color: ZENITH.live },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: card, borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: zenithSoftShadow() }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ background: card, borderRadius: 22, padding: '18px', boxShadow: zenithSoftShadow() }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink, marginBottom: 12 }}>{t(locale, 'insightsDigest')}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 88 }}>
            {monthBars.map((m) => {
              const amt = monthExpenseTotal(store, m.key);
              const h = Math.max((amt / barMax) * 80, 4);
              const isActive = m.key === activeKey;
              return (
                <button key={m.key} type="button" onClick={() => setActiveKey(m.key)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                  <div style={{ width: '100%', height: h, borderRadius: 6, background: isActive ? accent : cream }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? accent : muted }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{t(locale, 'whereItWent')}</p>
        <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
          {insight.cats.length === 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted, padding: '16px 18px' }}>{t(locale, 'noTxns')}</p>
          ) : insight.cats.slice(0, 6).map((c, i, arr) => {
            const pct = insight.spent > 0 ? Math.round(c.spent / insight.spent * 100) : 0;
            return (
              <button key={c.id} type="button" onClick={() => onNavigate && onNavigate('categoryDetail', c.id)} style={{
                display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid ' + cream : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: ink }}>{c.emoji} {catLabel(c, locale)}</span>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{fmt(c.spent)} · {pct}%</span>
                </div>
                <div style={{ height: 4, background: cream, borderRadius: 2 }}>
                  <div style={{ height: '100%', width: pct + '%', background: c.color, borderRadius: 2 }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{t(locale, 'weekday')}</p>
        <div style={{ background: card, borderRadius: 22, padding: '16px 14px', boxShadow: zenithSoftShadow(), display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {insight.weekday.map((amt, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: Math.max((amt / weekMax) * 72, 4), borderRadius: 5, background: i === 0 || i === 6 ? accent : cream }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted }}>{weekdayNames[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen });
