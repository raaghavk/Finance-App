// Home.jsx — Main dashboard screen

const CATEGORIES_DATA = [
  { name: 'Food & Drink', spent: 3920, budget: 6000, color: '#FF6B6B', emoji: '🍜' },
  { name: 'Groceries', spent: 5600, budget: 8000, color: '#34D399', emoji: '🛒' },
  { name: 'Transport', spent: 1800, budget: 3000, color: '#60A5FA', emoji: '🚗' },
  { name: 'Entertainment', spent: 2320, budget: 3000, color: '#A78BFA', emoji: '🎬' },
];

const TRANSACTIONS_DATA = [
  { id: 1, merchant: 'Blue Tokai Coffee', category: 'Food & Drink', amount: 340, date: '2026-04-20', color: '#FF6B6B' },
  { id: 2, merchant: 'BookMyShow', category: 'Entertainment', amount: 720, date: '2026-04-19', color: '#A78BFA' },
  { id: 3, merchant: 'Blinkit', category: 'Groceries', amount: 1240, date: '2026-04-19', color: '#34D399' },
  { id: 4, merchant: 'Ola Cabs', category: 'Transport', amount: 180, date: '2026-04-18', color: '#60A5FA' },
  { id: 5, merchant: 'Zomato', category: 'Food & Drink', amount: 580, date: '2026-04-18', color: '#FF6B6B' },
  { id: 6, merchant: 'DMart', category: 'Groceries', amount: 4360, date: '2026-04-16', color: '#34D399' },
  { id: 7, merchant: 'Rapido', category: 'Transport', amount: 120, date: '2026-04-15', color: '#60A5FA' },
];

function fmt(n) { return '₹' + n.toLocaleString('en-IN'); }

function relDate(d) {
  if (d === '2026-04-20') return 'Today';
  if (d === '2026-04-19') return 'Yesterday';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function MerchantIcon({ merchant, color }) {
  const initials = merchant.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
      background: color + '20',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color }}>{initials}</span>
    </div>
  );
}

function HomeScreen({ userName, startBalance, onSelectTx, transactions, onAddCategory, onNavigate }) {
  const MONTHLY_BUDGET = 30000;
  const totalSpent = CATEGORIES_DATA.reduce((s, c) => s + c.spent, 0); // 13640
  const leftToSpend = MONTHLY_BUDGET - totalSpent;
  const daysLeft = 10;
  const dailyAllowance = Math.round(leftToSpend / daysLeft);
  const spentPct = totalSpent / MONTHLY_BUDGET;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const txByDate = {};
  TRANSACTIONS_DATA.forEach(tx => {
    const label = relDate(tx.date);
    if (!txByDate[label]) txByDate[label] = [];
    txByDate[label].push(tx);
  });

  return (
    <div style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      paddingTop: 70, paddingBottom: 110,
      background: '#FFFFFF',
    }}>
      {/* Greeting + top-right icons */}
      <div style={{ padding: '0 24px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6E6E73', marginBottom: 4 }}>{greeting}</p>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#121212' }}>{userName || 'Friend'} 👋</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          {/* Notification bell */}
          <button onClick={() => onNavigate && onNavigate('notifications')} style={{
            width: 38, height: 38, borderRadius: 12, background: '#F5F5F7', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5C9 1.5 4.5 4 4.5 9v3.5H13.5V9c0-5-4.5-7.5-4.5-7.5z" stroke="#121212" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M7 13.5c0 1.1.9 2 2 2s2-.9 2-2" stroke="#121212" strokeWidth="1.5"/>
            </svg>
            <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, background: '#FF3B30', border: '1.5px solid #F5F5F7' }} />
          </button>
          {/* Profile avatar */}
          <button onClick={() => onNavigate && onNavigate('profile')} style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(145deg, #007AFF, #5856D6)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
              {(userName || 'Z')[0].toUpperCase()}
            </span>
          </button>
        </div>
      </div>

      {/* ── Left to Spend Card ── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div onClick={() => onNavigate && onNavigate('budget')} style={{
          background: 'linear-gradient(145deg, #007AFF 0%, #0056CC 100%)',
          borderRadius: 28,
          padding: '28px 24px 24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,122,255,0.35)',
          cursor: 'pointer',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' }}>Left to Spend</p>
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'white' }}>April 2026</span>
              </div>
            </div>

            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 52, fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: 20, letterSpacing: -1 }}>
              {fmt(leftToSpend)}
            </h2>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${spentPct * 100}%`, background: 'rgba(255,255,255,0.9)', borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>DAILY ALLOWANCE</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{fmt(dailyAllowance)}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>/day</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>DAYS LEFT</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{daysLeft}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Spent this month ── */}
      <div style={{ padding: '0 24px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6E6E73', marginBottom: 2 }}>Spent this month</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#121212' }}>{fmt(totalSpent)}</p>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6E6E73' }}>of {fmt(MONTHLY_BUDGET)} budget</p>
        </div>
      </div>

      {/* ── Category Cards (horizontal scroll) ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ padding: '0 24px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>Categories</h3>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#007AFF', fontWeight: 500 }}>See All</span>
        </div>
        <div style={{ overflowX: 'auto', paddingLeft: 20, paddingRight: 20, display: 'flex', gap: 12 }}>
          {CATEGORIES_DATA.map(cat => {
            const pct = cat.spent / cat.budget;
            const over = pct >= 0.9;
            return (
              <div key={cat.name} onClick={() => onNavigate && onNavigate('categoryDetail', cat.name)} style={{
                minWidth: 150, background: '#F5F5F7', borderRadius: 20, padding: '18px 16px',
                flexShrink: 0, cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{cat.emoji}</div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: '#121212', marginBottom: 2 }}>{cat.name}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6E6E73', marginBottom: 12 }}>{fmt(cat.spent)} / {fmt(cat.budget)}</p>
                <div style={{ height: 4, background: '#E5E5EA', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 2 }} />
                </div>
                {over && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#FF3B30', fontWeight: 600, marginTop: 6 }}>Near limit</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>Recent Activity</h3>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#007AFF', fontWeight: 500 }}>All</span>
        </div>

        {Object.entries(txByDate).map(([dateLabel, txs]) => (
          <div key={dateLabel} style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#AAAAAA', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>{dateLabel}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {txs.map((tx, i) => (
                <div
                  key={tx.id}
                  onClick={() => onSelectTx(tx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 0',
                    borderBottom: i < txs.length - 1 ? '1px solid #F0F0F3' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <MerchantIcon merchant={tx.merchant} color={tx.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#121212', marginBottom: 3 }}>{tx.merchant}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#6E6E73' }}>{tx.category}</p>
                  </div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#121212' }}>−{fmt(tx.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, CATEGORIES_DATA, TRANSACTIONS_DATA, fmt, relDate });
