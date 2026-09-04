// CategoryDetail.jsx — Drill-down: expenses for a single category

function CategoryDetailScreen({ category, onBack }) {
  const cat = CATEGORIES_DATA.find(c => c.name === category) || { name: category, color: '#007AFF', emoji: '✦', spent: 0, budget: 0 };
  const txs = (window.ALL_TRANSACTIONS || TRANSACTIONS_DATA || []).filter(t => t.category === category);
  const pct = cat.budget > 0 ? cat.spent / cat.budget : 0;
  const over = pct >= 0.9;

  const byDate = {};
  txs.forEach(tx => {
    const d = relDate(tx.date);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(tx);
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
      {/* Header */}
      <div style={{ paddingTop: 70, padding: '70px 20px 0' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>Back</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{cat.emoji}</div>
          <div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{cat.name}</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>{txs.length} transactions</p>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Spent</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: over ? '#FF3B30' : cat.color, letterSpacing: -0.5 }}>{fmt(cat.spent)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Budget</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{fmt(cat.budget)}</p>
            </div>
          </div>
          <div style={{ height: 6, background: '#F2F2F7', borderRadius: 3, marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: over ? '#FF3B30' : '#8E8E93', fontWeight: over ? 600 : 400 }}>
              {over ? `⚠ Near limit (${Math.round(pct * 100)}%)` : `${Math.round(pct * 100)}% used`}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{fmt(Math.max(cat.budget - cat.spent, 0))} left</span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', paddingBottom: 100 }}>
        {Object.keys(byDate).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{cat.emoji}</div>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#3C3C43', marginBottom: 6 }}>No transactions yet</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>Expenses in {cat.name} will appear here</p>
          </div>
        ) : Object.entries(byDate).map(([date, list]) => (
          <div key={date} style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>{date}</p>
            <div style={{ background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {list.map((tx, i) => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < list.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: cat.color }}>{tx.merchant.split(' ').slice(0,2).map(w=>w[0]).join('')}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{tx.merchant}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{tx.category}</p>
                  </div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>−{fmt(tx.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CategoryDetailScreen });
