// Reports.jsx — Monthly PDF-style summary report

function ReportsScreen({ onBack, initialMonth }) {
  const [selectedMonth, setSelectedMonth] = React.useState(typeof initialMonth === 'number' ? Math.min(initialMonth, 3) : 3);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthData = [
    { month: 'Jan', income: 80000, spent: 21400, saved: 58600, txCount: 34 },
    { month: 'Feb', income: 80000, spent: 17600, saved: 62400, txCount: 28 },
    { month: 'Mar', income: 80000, spent: 22900, saved: 57100, txCount: 41 },
    { month: 'Apr', income: 80000, spent: 13640, saved: 66360, txCount: 15 },
  ];

  const d = monthData[selectedMonth] || monthData[3];
  const savingsRate = Math.round(d.saved / d.income * 100);
  const spentPct = d.spent / d.income;

  const catBreakdown = [
    { name: 'Groceries',     spent: 5600,  color: '#34D399', pct: 41 },
    { name: 'Food & Drink',  spent: 3920,  color: '#FF6B6B', pct: 29 },
    { name: 'Entertainment', spent: 2320,  color: '#A78BFA', pct: 17 },
    { name: 'Transport',     spent: 1800,  color: '#60A5FA', pct: 13 },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Reports</h1>
      </div>

      {/* Month selector */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8 }}>
          {monthData.map((m, i) => (
            <button key={m.month} onClick={() => setSelectedMonth(i)} style={{
              padding: '10px 18px', borderRadius: 16, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: selectedMonth === i ? '#007AFF' : '#FFFFFF',
              color: selectedMonth === i ? '#FFFFFF' : '#3C3C43',
              fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
            }}>{m.month}</button>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{
          background: 'linear-gradient(145deg, #1C1C2E 0%, #0D1117 100%)',
          borderRadius: 24, padding: '22px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(0,122,255,0.06)' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{months[selectedMonth]} 2026 Summary</p>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Income</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#34D399', letterSpacing: -0.5 }}>₹{d.income.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Spent</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#FF6B6B', letterSpacing: -0.5 }}>₹{d.spent.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 12 }}>
            <div style={{ height: '100%', width: `${spentPct * 100}%`, background: 'linear-gradient(90deg,#FF6B6B,#FF9500)', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Saved: <span style={{ color: '#34D399', fontWeight: 700 }}>₹{d.saved.toLocaleString('en-IN')}</span></p>
            <div style={{ background: '#34D399' + '22', border: '1px solid #34D399' + '44', borderRadius: 10, padding: '4px 10px' }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: '#34D399' }}>{savingsRate}% saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10 }}>
        {[
          { label: 'Transactions', value: d.txCount, color: '#007AFF' },
          { label: 'Avg/day', value: `₹${Math.round(d.spent/30).toLocaleString('en-IN')}`, color: '#5856D6' },
          { label: 'vs. prev', value: selectedMonth > 0 ? (monthData[selectedMonth-1].spent > d.spent ? '↓ Less' : '↑ More') : '—', color: '#34D399' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: s.color, marginBottom: 4, letterSpacing: -0.3 }}>{s.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Spending Breakdown</p>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {catBreakdown.map((c, i) => (
            <div key={c.name} style={{ padding: '14px 18px', borderBottom: i < catBreakdown.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, color: '#1C1C1E' }}>{c.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>₹{c.spent.toLocaleString('en-IN')}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}> · {c.pct}%</span>
                </div>
              </div>
              <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div style={{ padding: '0 20px' }}>
        <button style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: 18, cursor: 'pointer',
          background: '#007AFF', color: '#FFFFFF',
          fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,122,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v10M3 7l5 5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 13h14" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Export as PDF
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen });
