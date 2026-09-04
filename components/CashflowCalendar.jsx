// CashflowCalendar.jsx — Day-by-day spend calendar

function CashflowCalendarScreen({ onBack, onSelectTx }) {
  const [selectedDay, setSelectedDay] = React.useState(20);
  const year = 2026, month = 4; // April 2026

  // Spend per day
  const dailySpend = {
    1: 0, 2: 0, 3: 2800, 4: 0, 5: 580, 6: 40, 7: 1890,
    8: 0, 9: 2340, 10: 1100, 11: 0, 12: 649, 13: 0, 14: 0,
    15: 120, 16: 4360, 17: 0, 18: 760, 19: 1960, 20: 340,
    21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0,
  };

  const txByDay = {
    3:  [{ merchant: 'Electricity Bill', amount: 2800, category: 'Bills',         color: '#6E6E73' }],
    5:  [{ merchant: 'Zomato',           amount: 580,  category: 'Food & Drink',  color: '#FF6B6B' }],
    6:  [{ merchant: 'BEST Bus',         amount: 40,   category: 'Transport',     color: '#60A5FA' }],
    7:  [{ merchant: 'Myntra',           amount: 1890, category: 'Shopping',      color: '#EC4899' }],
    9:  [{ merchant: 'Amazon',           amount: 2340, category: 'Shopping',      color: '#EC4899' }],
    10: [{ merchant: 'PharmEasy',        amount: 1100, category: 'Health',        color: '#F97316' }],
    12: [{ merchant: 'Netflix',          amount: 649,  category: 'Entertainment', color: '#A78BFA' }],
    15: [{ merchant: 'Rapido',           amount: 120,  category: 'Transport',     color: '#60A5FA' }],
    16: [{ merchant: 'DMart',            amount: 4360, category: 'Groceries',     color: '#34D399' }],
    18: [{ merchant: 'Ola Cabs',         amount: 180,  category: 'Transport',     color: '#60A5FA' },
         { merchant: 'Swiggy',           amount: 460,  category: 'Food & Drink',  color: '#FF6B6B' }, { merchant: 'Swiggy', amount: 120, category: 'Food & Drink', color: '#FF6B6B' }],
    19: [{ merchant: 'Blinkit',          amount: 1240, category: 'Groceries',     color: '#34D399' },
         { merchant: 'BookMyShow',       amount: 720,  category: 'Entertainment', color: '#A78BFA' }],
    20: [{ merchant: 'Blue Tokai',       amount: 340,  category: 'Food & Drink',  color: '#FF6B6B' }],
  };

  const maxSpend = Math.max(...Object.values(dailySpend));
  const daysInMonth = 30;
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun

  const DAYS = ['S','M','T','W','T','F','S'];
  const totalMonth = Object.values(dailySpend).reduce((s, v) => s + v, 0);
  const activeDays = Object.values(dailySpend).filter(v => v > 0).length;

  const intensityColor = (amt) => {
    if (!amt) return '#F2F2F7';
    const t = amt / maxSpend;
    if (t > 0.7) return '#FF3B30';
    if (t > 0.4) return '#FF9500';
    if (t > 0.1) return '#007AFF';
    return '#60A5FA';
  };

  const selectedTxs = txByDay[selectedDay] || [];
  const selectedTotal = selectedTxs.reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
      <div style={{ paddingTop: 70, padding: '70px 20px 16px', flexShrink: 0 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>April 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Calendar</h1>
      </div>

      {/* Summary strip */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10, flexShrink: 0 }}>
        {[
          { label: 'Total spent', value: `₹${(totalMonth/1000).toFixed(1)}k`, color: '#007AFF' },
          { label: 'Active days', value: activeDays, color: '#5856D6' },
          { label: 'Avg/day', value: `₹${Math.round(totalMonth / activeDays)}`, color: '#FF9500' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '12px 10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: s.color, letterSpacing: -0.3, marginBottom: 3 }}>{s.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '0 20px', marginBottom: 14, flexShrink: 0 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#8E8E93', paddingBottom: 4 }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const spend = dailySpend[day] || 0;
              const isSelected = selectedDay === day;
              const hasSpend = spend > 0;
              const isPast = day <= 20;
              return (
                <div key={day} onClick={() => isPast && setSelectedDay(day)} style={{
                  aspectRatio: '1', borderRadius: 10,
                  background: isSelected ? '#007AFF' : intensityColor(spend),
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: isPast ? 'pointer' : 'default',
                  opacity: isPast ? 1 : 0.3,
                  border: isSelected ? '2px solid #007AFF' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: isSelected || hasSpend ? 700 : 400, color: isSelected ? '#FFFFFF' : (hasSpend ? '#FFFFFF' : '#C7C7CC') }}>{day}</span>
                  {hasSpend && !isSelected && <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.7)', marginTop: 1 }} />}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #F2F2F7' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93' }}>Less</span>
            {['#60A5FA','#007AFF','#FF9500','#FF3B30'].map(c => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: 4, background: c }} />
            ))}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93' }}>More</span>
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>
            April {selectedDay}
          </p>
          {selectedTotal > 0 && <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>{fmt(selectedTotal)}</p>}
        </div>

        {selectedTxs.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#C7C7CC' }}>No spending on this day</p>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {selectedTxs.map((tx, i) => (
              <div key={i} onClick={() => onSelectTx && onSelectTx({ ...tx, date: `2026-04-${String(selectedDay).padStart(2,'0')}` })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < selectedTxs.length - 1 ? '1px solid #F2F2F7' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: tx.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 800, color: tx.color }}>{tx.merchant.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{tx.merchant}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{tx.category}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>−{fmt(tx.amount)}</p>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { CashflowCalendarScreen });
