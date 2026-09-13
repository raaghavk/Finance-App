// CashflowCalendar.jsx — Day-by-day spend from the live store, plus recurring due dates

function CashflowCalendarScreen({ store, onBack, onSelectTx }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const today = typeof todayISO === 'function' ? todayISO() : new Date().toISOString().slice(0, 10);
  const [mk, setMk] = React.useState(monthKey());
  const flow = typeof cashflowMonth === 'function' ? cashflowMonth(store, mk) : { daysIn: 30, firstDow: 0, byDay: {}, spendTotal: 0, year: 2026, month: 9 };
  const todayDay = monthKey() === mk ? Number(today.slice(8, 10)) : 1;
  const [selectedDay, setSelectedDay] = React.useState(todayDay);
  React.useEffect(() => { setSelectedDay(monthKey() === mk ? Number(today.slice(8, 10)) : 1); }, [mk]);
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const cream = ZENITH.cream;
  const accent = ZENITH.accent;
  const DAYS = locale === 'hi' ? ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const maxSpend = Math.max(1, ...Object.keys(flow.byDay).map((d) => flow.byDay[d].spend));
  const activeDays = Object.keys(flow.byDay).filter((d) => flow.byDay[d].spend > 0).length;
  const cell = flow.byDay[selectedDay] || { spend: 0, income: 0, txns: [], dues: [] };
  const iso = flow.year + '-' + String(flow.month).padStart(2, '0') + '-' + String(selectedDay).padStart(2, '0');

  const shiftMonth = (delta) => {
    const d = new Date(flow.year, flow.month - 1 + delta, 1);
    setMk(monthKey(d));
  };

  const intensity = (amt) => {
    if (!amt) return cream;
    const t = amt / maxSpend;
    if (t > 0.7) return '#EF4444';
    if (t > 0.4) return '#F59E0B';
    if (t > 0.1) return accent;
    return '#60A5FA';
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: page }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader title={t(locale, 'calendar')} leftLabel="‹" onLeft={onBack} />
      ) : (
        <div style={{ paddingTop: 'var(--zenith-pad-top)', padding: '12px 24px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: ink }}>{t(locale, 'calendar')}</h1>
        </div>
      )}

      <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" onClick={() => shiftMonth(-1)} style={{ border: 'none', background: cream, borderRadius: 12, padding: '8px 12px', cursor: 'pointer', color: ink }}>‹</button>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink }}>{monthLabel(new Date(flow.year, flow.month - 1, 1), locale)}</p>
        <button type="button" onClick={() => shiftMonth(1)} style={{ border: 'none', background: cream, borderRadius: 12, padding: '8px 12px', cursor: 'pointer', color: ink }}>›</button>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10, flexShrink: 0 }}>
        {[
          { label: t(locale, 'spentMonth'), value: fmt(flow.spendTotal), color: accent },
          { label: t(locale, 'txCount'), value: activeDays, color: '#7C3AED' },
          { label: t(locale, 'avgDay'), value: fmt(Math.round(flow.spendTotal / Math.max(flow.daysIn, 1))), color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: card, borderRadius: 16, padding: '12px 10px', textAlign: 'center', boxShadow: zenithSoftShadow() }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14, flexShrink: 0 }}>
        <div style={{ background: card, borderRadius: 22, padding: '16px', boxShadow: zenithSoftShadow() }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: muted, paddingBottom: 4 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {Array.from({ length: flow.firstDow }).map((_, i) => <div key={'e' + i} />)}
            {Array.from({ length: flow.daysIn }).map((_, i) => {
              const day = i + 1;
              const spend = (flow.byDay[day] && flow.byDay[day].spend) || 0;
              const due = (flow.byDay[day] && flow.byDay[day].dues && flow.byDay[day].dues.length) || 0;
              const isSelected = selectedDay === day;
              return (
                <button key={day} type="button" onClick={() => setSelectedDay(day)} style={{
                  aspectRatio: '1', borderRadius: 10, border: isSelected ? '2px solid ' + accent : '2px solid transparent',
                  background: isSelected ? accent : intensity(spend),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: spend || isSelected ? 700 : 400, color: isSelected || spend ? '#FFFFFF' : muted }}>{day}</span>
                  {due > 0 && !isSelected && <div style={{ width: 4, height: 4, borderRadius: 2, background: '#F59E0B', marginTop: 1 }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 'var(--zenith-pad-bottom)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink }}>{relDate(iso, locale)}</p>
          {cell.spend > 0 && <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{fmt(cell.spend)}</p>}
        </div>
        {cell.dues.length > 0 && (
          <div style={{ background: cream, borderRadius: 16, padding: '12px 14px', marginBottom: 10 }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: ink, marginBottom: 6 }}>{t(locale, 'dueOnDay')}</p>
            {cell.dues.map((r) => (
              <p key={r.id} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>{r.name} · {fmt(r.amount)}</p>
            ))}
          </div>
        )}
        {cell.txns.length === 0 ? (
          <div style={{ background: card, borderRadius: 18, padding: '24px', textAlign: 'center', boxShadow: zenithSoftShadow() }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted }}>{t(locale, 'noSpendDay')}</p>
          </div>
        ) : (
          <div style={{ background: card, borderRadius: 20, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
            {cell.txns.map((tx, i) => {
              const cat = typeof findCat === 'function' ? findCat(store, tx.categoryId) : null;
              return (
                <button key={tx.id || i} type="button" onClick={() => onSelectTx && onSelectTx(tx)} style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '13px 18px', border: 'none',
                  borderBottom: i < cell.txns.length - 1 ? '1px solid ' + cream : 'none', background: card, cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 800, color: accent }}>{(tx.merchant || (cat && cat.emoji) || '?').toString().slice(0, 2)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{tx.merchant || (cat ? catLabel(cat, locale) : t(locale, 'expense'))}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted }}>{cat ? catLabel(cat, locale) : tx.type}</p>
                  </div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: tx.type === 'income' ? '#16A34A' : ink }}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CashflowCalendarScreen });
