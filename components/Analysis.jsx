// Analysis.jsx — Current month from the live store

function AnalysisScreen({ store, onNavigate }) {
  const locale = store.user.locale || 'en';
  const mk = monthKey();
  const rows = categorySpendRows(store, mk).filter((c) => c.spent > 0);
  const total = monthExpenseTotal(store, mk);
  const budget = totalBudgetLimit(store, mk);
  const daysLeft = daysLeftInMonth();
  const elapsed = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - daysLeft + 1;

  const now = new Date();
  const monthBars = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    monthBars.push({
      month: d.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short' }),
      amount: monthExpenseTotal(store, key),
      key,
    });
  }
  const [activeBar, setActiveBar] = React.useState(monthBars.length - 1);
  const barMax = Math.max(1, ...monthBars.map((d) => d.amount));
  const active = monthBars[activeBar] || monthBars[monthBars.length - 1];

  const donutR = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * donutR;
  let acc = 0;
  const slices = rows.map((cat) => {
    const pct = total > 0 ? cat.spent / total : 0;
    const dash = pct * circ;
    const s = { ...cat, dash, offset: acc };
    acc += dash;
    return s;
  });

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>{monthLabel(undefined, locale)}</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>
          {locale === 'hi' ? 'विश्लेषण' : 'Analysis'}
        </h1>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 4 }}>{active.month}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#1C1C1E', marginBottom: 16 }}>{fmt(active.amount)}</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 88 }}>
            {monthBars.map((d, i) => {
              const h = Math.max((d.amount / barMax) * 80, 4);
              const isActive = i === activeBar;
              return (
                <button
                  key={d.key}
                  type="button"
                  aria-label={d.month + ' ' + fmt(d.amount)}
                  onClick={() => setActiveBar(i)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ width: '100%', height: h, borderRadius: 6, background: isActive ? '#007AFF' : '#E8E8EE' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: isActive ? 700 : 400, color: isActive ? '#007AFF' : '#8E8E93' }}>{d.month}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px' }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 12 }}>
            {locale === 'hi' ? 'कहाँ गया' : 'Where it went'}
          </p>
          {total === 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>{t(locale, 'noTxns')}</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width={140} height={140} viewBox="0 0 140 140" aria-hidden="true">
                <circle cx={cx} cy={cy} r={donutR} fill="none" stroke="#F2F2F7" strokeWidth={18} />
                {slices.map((s, i) => (
                  <circle key={i} cx={cx} cy={cy} r={donutR} fill="none"
                    stroke={s.color} strokeWidth={18}
                    strokeDasharray={`${Math.max(s.dash - 1.5, 0)} ${circ - s.dash + 1.5}`}
                    strokeDashoffset={-s.offset + circ / 4}
                  />
                ))}
                <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="13" fontWeight="800" fill="#1C1C1E">{fmtCompact(total)}</text>
              </svg>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {rows.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onNavigate && onNavigate('categoryDetail', cat.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#3C3C43' }}>{catLabel(cat, locale)}</span>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700 }}>{Math.round(cat.spent / total * 100)}%</span>
                    </div>
                    <div style={{ height: 3, background: '#F2F2F7', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${(cat.spent / total) * 100}%`, background: cat.color, borderRadius: 2 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#007AFF' }}>{fmt(elapsed > 0 ? Math.round(total / elapsed) : 0)}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{locale === 'hi' ? 'रोज़ औसत' : 'Avg / day'}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('budget')}
          style={{ flex: 1, background: '#FFFFFF', border: 'none', borderRadius: 16, padding: '14px 12px', cursor: 'pointer' }}
        >
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#FF9500' }}>{fmt(Math.max(budget - total, 0))}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{t(locale, 'leftToSpend')}</p>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { AnalysisScreen });
