// Analysis.jsx — with navigation callbacks

function AnalysisScreen({ onNavigate }) {
  const [period, setPeriod] = React.useState('month');
  const [activeBar, setActiveBar] = React.useState(5);

  const cats = CATEGORIES_DATA;
  const total = cats.reduce((s, c) => s + c.spent, 0);
  const budget = 30000;

  const monthData = [
    { month: 'Nov', amount: 18200, idx: 0 },
    { month: 'Dec', amount: 24800, idx: 1 },
    { month: 'Jan', amount: 21400, idx: 2 },
    { month: 'Feb', amount: 17600, idx: 3 },
    { month: 'Mar', amount: 22900, idx: 4 },
    { month: 'Apr', amount: 13640, idx: 5 },
  ];

  const yearData = [
    { month: 'May', amount: 62000, idx: 4 },
    { month: 'Jun', amount: 71000, idx: 5 },
    { month: 'Jul', amount: 58000, idx: 6 },
    { month: 'Aug', amount: 83000, idx: 7 },
    { month: 'Sep', amount: 66000, idx: 8 },
    { month: 'Oct', amount: 79000, idx: 9 },
    { month: 'Nov', amount: 72000, idx: 10 },
    { month: 'Dec', amount: 91000, idx: 11 },
    { month: 'Jan', amount: 68000, idx: 0 },
    { month: 'Feb', amount: 55000, idx: 1 },
    { month: 'Mar', amount: 76000, idx: 2 },
    { month: 'Apr', amount: 13640, idx: 3 },
  ];

  const data = period === 'month' ? monthData : yearData;
  const barMax = Math.max(...data.map(d => d.amount));
  const activeAmount = data[activeBar] ? data[activeBar].amount : data[data.length - 1].amount;
  const activeMonth = data[activeBar] ? data[activeBar].month : data[data.length - 1].month;
  const activeReportIdx = data[activeBar] ? data[activeBar].idx : 3;

  // Donut
  const donutR = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * donutR;
  let acc = 0;
  const slices = cats.map(cat => {
    const pct = cat.spent / total;
    const dash = pct * circ;
    const s = { ...cat, dash, offset: acc };
    acc += dash;
    return s;
  });

  const goCategory = (name) => onNavigate && onNavigate('categoryDetail', name);
  const goReport   = (idx)  => onNavigate && onNavigate('reports', idx);

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>April 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Analysis</h1>
      </div>

      {/* Period Toggle */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', background: 'rgba(120,120,128,0.12)', borderRadius: 12, padding: 3 }}>
          {[['month','Monthly'],['year','Yearly']].map(([val, label]) => (
            <button key={val} onClick={() => { setPeriod(val); setActiveBar(val === 'month' ? 5 : 11); }} style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer', borderRadius: 10,
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              background: period === val ? '#FFFFFF' : 'transparent',
              color: period === val ? '#1C1C1E' : '#8E8E93',
              boxShadow: period === val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px 20px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: 4 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', fontWeight: 500, marginBottom: 4 }}>
              {activeMonth} {period === 'year' ? '2025–26' : '2026'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>
                {fmt(activeAmount)}
              </p>
              <button onClick={() => goReport(activeReportIdx)} style={{
                display: 'flex', alignItems: 'center', gap: 4, background: '#F0F7FF', border: 'none',
                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
              }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#007AFF' }}>Details</span>
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke="#007AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', marginBottom: 16 }}>Tap a bar to see that month</p>

          {/* Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: period === 'year' ? 5 : 10, height: 88 }}>
            {data.map((d, i) => {
              const h = Math.max((d.amount / barMax) * 80, 4);
              const isActive = i === activeBar;
              return (
                <div key={d.month + i} onClick={() => setActiveBar(i)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: h, borderRadius: 6, background: isActive ? '#007AFF' : '#E8E8EE', transition: 'all 0.2s', position: 'relative' }}>
                    {isActive && (
                      <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', background: '#007AFF', borderRadius: 6, padding: '2px 5px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700, color: 'white' }}>{(d.amount/1000).toFixed(0)}k</span>
                        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #007AFF' }} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: period === 'year' ? 7 : 10, fontWeight: isActive ? 700 : 400, color: isActive ? '#007AFF' : '#C7C7CC' }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Donut + breakdown */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 4 }}>Where it went</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', marginBottom: 16 }}>Tap a slice or category to drill down</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Donut SVG — slices are clickable */}
            <div style={{ flexShrink: 0, cursor: 'pointer' }}>
              <svg width={140} height={140} viewBox="0 0 140 140">
                <circle cx={cx} cy={cy} r={donutR} fill="none" stroke="#F2F2F7" strokeWidth={18} />
                {slices.map((s, i) => (
                  <circle key={i} cx={cx} cy={cy} r={donutR} fill="none"
                    stroke={s.color} strokeWidth={18}
                    strokeDasharray={`${s.dash - 1.5} ${circ - s.dash + 1.5}`}
                    strokeDashoffset={-s.offset + circ / 4}
                    strokeLinecap="butt"
                    style={{ cursor: 'pointer' }}
                    onClick={() => goCategory(s.name)}
                  />
                ))}
                <text x={cx} y={cy - 7} textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="13" fontWeight="800" fill="#1C1C1E">{fmt(total)}</text>
                <text x={cx} y={cy + 10} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fill="#8E8E93">spent</text>
              </svg>
            </div>

            {/* Legend — each row tappable */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cats.map(cat => {
                const pct = Math.round(cat.spent / total * 100);
                return (
                  <div key={cat.name} onClick={() => goCategory(cat.name)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#3C3C43' }}>{cat.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 700, color: '#1C1C1E' }}>{pct}%</span>
                        <svg width="5" height="9" viewBox="0 0 5 9" fill="none"><path d="M1 1l3 3.5L1 8" stroke="#C7C7CC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                    <div style={{ height: 3, background: '#F2F2F7', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', gap: 12 }}>
        {[
          { label: 'Avg / day', value: fmt(Math.round(total / 20)), color: '#007AFF' },
          { label: 'vs Mar',    value: '−40%',                      color: '#34D399' },
          { label: 'Budget left', value: fmt(budget - total), color: '#FF9500', tap: () => onNavigate && onNavigate('budget') },
        ].map(s => (
          <div key={s.label} onClick={s.tap} style={{
            flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '14px 12px',
            textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            cursor: s.tap ? 'pointer' : 'default',
            border: s.tap ? '1.5px solid transparent' : 'none',
          }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 4, letterSpacing: -0.3 }}>{s.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.label}</p>
            {s.tap && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#007AFF', fontWeight: 600, marginTop: 2 }}>tap to manage →</p>}
          </div>
        ))}
      </div>

      {/* Category Detail Rows */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {cats.map((cat, i) => {
            const pct = cat.spent / cat.budget;
            const over = pct >= 0.9;
            return (
              <div key={cat.name} onClick={() => goCategory(cat.name)} style={{
                padding: '14px 18px', borderBottom: i < cats.length - 1 ? '1px solid #F2F2F7' : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>{cat.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: over ? '#FF3B30' : '#1C1C1E' }}>{fmt(cat.spent)}</span>
                        <svg width="5" height="9" viewBox="0 0 5 9" fill="none"><path d="M1 1l3 3.5L1 8" stroke="#C7C7CC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                    <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalysisScreen });
