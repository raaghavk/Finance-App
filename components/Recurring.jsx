// Recurring.jsx — Subscriptions & recurring bills tracker

const RECURRING_DATA = [
  { id: 1,  name: 'Netflix',       category: 'Entertainment', amount: 649,  cycle: 'monthly',  nextDate: '2026-05-12', color: '#E50914', active: true  },
  { id: 2,  name: 'Spotify',       category: 'Entertainment', amount: 119,  cycle: 'monthly',  nextDate: '2026-05-08', color: '#1DB954', active: true  },
  { id: 3,  name: 'iCloud 50GB',   category: 'Storage',       amount: 75,   cycle: 'monthly',  nextDate: '2026-05-15', color: '#007AFF', active: true  },
  { id: 4,  name: 'Electricity',   category: 'Bills',         amount: 2800, cycle: 'monthly',  nextDate: '2026-05-03', color: '#F59E0B', active: true  },
  { id: 5,  name: 'Broadband',     category: 'Bills',         amount: 999,  cycle: 'monthly',  nextDate: '2026-05-20', color: '#6E6E73', active: true  },
  { id: 6,  name: 'Gym',           category: 'Health',        amount: 1500, cycle: 'monthly',  nextDate: '2026-05-01', color: '#F97316', active: true  },
  { id: 7,  name: 'Amazon Prime',  category: 'Shopping',      amount: 1499, cycle: 'yearly',   nextDate: '2026-09-14', color: '#FF9900', active: true  },
  { id: 8,  name: 'Adobe CC',      category: 'Software',      amount: 5299, cycle: 'yearly',   nextDate: '2026-11-22', color: '#FF0000', active: false },
];

function RecurringScreen() {
  const [items, setItems] = React.useState(RECURRING_DATA);
  const [activeFilter, setActiveFilter] = React.useState('all');

  const toggle = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));

  const monthly = items.filter(i => i.active && i.cycle === 'monthly').reduce((s, i) => s + i.amount, 0);
  const yearly  = items.filter(i => i.active && i.cycle === 'yearly').reduce((s, i) => s + i.amount, 0);
  const monthlyEquiv = Math.round(monthly + yearly / 12);

  const daysUntil = (dateStr) => {
    const today = new Date();
    const d = new Date(dateStr);
    return Math.ceil((d - today) / 86400000);
  };

  const filtered = activeFilter === 'all' ? items : items.filter(i => i.cycle === activeFilter);

  const urgency = (days) => {
    if (days <= 2) return '#FF3B30';
    if (days <= 7) return '#FF9500';
    return '#8E8E93';
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>May 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Recurring</h1>
      </div>

      {/* ── Summary Card ── */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            <div style={{ flex: 1, borderRight: '1px solid #F2F2F7', paddingRight: 18 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Monthly Cost</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{fmt(monthlyEquiv)}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', marginTop: 3 }}>incl. yearly split</p>
            </div>
            <div style={{ flex: 1, paddingLeft: 18 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Active subs</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#007AFF', letterSpacing: -0.5 }}>{items.filter(i => i.active).length}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', marginTop: 3 }}>{items.filter(i => !i.active).length} paused</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upcoming this week ── */}
      {(() => {
        const soon = items.filter(i => i.active && daysUntil(i.nextDate) <= 7).sort((a, b) => daysUntil(a.nextDate) - daysUntil(b.nextDate));
        if (!soon.length) return null;
        return (
          <div style={{ padding: '0 20px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Due Soon</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {soon.map(item => {
                const days = daysUntil(item.nextDate);
                return (
                  <div key={item.id} style={{ flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '14px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${urgency(days)}` }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 4 }}>{item.name}</p>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1C1C1E', marginBottom: 4 }}>{fmt(item.amount)}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: urgency(days), fontWeight: 600 }}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Filter ── */}
      <div style={{ padding: '0 20px 10px', display: 'flex', gap: 8 }}>
        {[['all', 'All'], ['monthly', 'Monthly'], ['yearly', 'Yearly']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveFilter(val)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: activeFilter === val ? '#1C1C1E' : '#FFFFFF',
            color: activeFilter === val ? '#FFFFFF' : '#3C3C43',
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Items list ── */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {filtered.map((item, i) => {
            const days = daysUntil(item.nextDate);
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                borderBottom: i < filtered.length - 1 ? '1px solid #F2F2F7' : 'none',
                opacity: item.active ? 1 : 0.45,
                transition: 'opacity 0.2s',
              }}>
                {/* Color dot */}
                <div style={{ width: 42, height: 42, borderRadius: 13, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 5, background: item.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 3 }}>{item.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{item.category}</span>
                    <span style={{ width: 3, height: 3, borderRadius: 2, background: '#C7C7CC', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: urgency(days), fontWeight: 600 }}>
                      {days <= 0 ? 'Today' : `${days}d`}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{fmt(item.amount)}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'capitalize' }}>{item.cycle}</p>
                </div>

                {/* Toggle */}
                <div onClick={() => toggle(item.id)} style={{
                  width: 44, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
                  background: item.active ? '#34C759' : '#E5E5EA',
                  position: 'relative', transition: 'background 0.25s',
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: item.active ? 21 : 3,
                    width: 20, height: 20, borderRadius: 10, background: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RecurringScreen });
