// Search.jsx — Transaction search & filter

const ALL_TRANSACTIONS = [
  { id: 1,  merchant: 'Blue Tokai Coffee',  category: 'Food & Drink',   amount: 340,  date: '2026-04-20', color: '#FF6B6B' },
  { id: 2,  merchant: 'BookMyShow',          category: 'Entertainment',  amount: 720,  date: '2026-04-19', color: '#A78BFA' },
  { id: 3,  merchant: 'Blinkit',             category: 'Groceries',      amount: 1240, date: '2026-04-19', color: '#34D399' },
  { id: 4,  merchant: 'Ola Cabs',            category: 'Transport',      amount: 180,  date: '2026-04-18', color: '#60A5FA' },
  { id: 5,  merchant: 'Zomato',              category: 'Food & Drink',   amount: 580,  date: '2026-04-18', color: '#FF6B6B' },
  { id: 6,  merchant: 'DMart',               category: 'Groceries',      amount: 4360, date: '2026-04-16', color: '#34D399' },
  { id: 7,  merchant: 'Rapido',              category: 'Transport',      amount: 120,  date: '2026-04-15', color: '#60A5FA' },
  { id: 8,  merchant: 'Swiggy',              category: 'Food & Drink',   amount: 460,  date: '2026-04-14', color: '#FF6B6B' },
  { id: 9,  merchant: 'Netflix',             category: 'Entertainment',  amount: 649,  date: '2026-04-12', color: '#A78BFA' },
  { id: 10, merchant: 'PharmEasy',           category: 'Health',         amount: 1100, date: '2026-04-10', color: '#F97316' },
  { id: 11, merchant: 'Amazon',              category: 'Shopping',       amount: 2340, date: '2026-04-09', color: '#EC4899' },
  { id: 12, merchant: 'Myntra',              category: 'Shopping',       amount: 1890, date: '2026-04-07', color: '#EC4899' },
  { id: 13, merchant: 'BEST Bus',            category: 'Transport',      amount: 40,   date: '2026-04-06', color: '#60A5FA' },
  { id: 14, merchant: 'Starbucks',           category: 'Food & Drink',   amount: 580,  date: '2026-04-05', color: '#FF6B6B' },
  { id: 15, merchant: 'Electricity Bill',    category: 'Bills',          amount: 2800, date: '2026-04-03', color: '#6E6E73' },
];

const FILTER_CATS = ['All', 'Food & Drink', 'Groceries', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Bills'];
const SORT_OPTIONS = [['date', 'Newest'], ['amount_desc', 'Highest'], ['amount_asc', 'Lowest']];

function SearchScreen() {
  const [query, setQuery] = React.useState('');
  const [activeCat, setActiveCat] = React.useState('All');
  const [sort, setSort] = React.useState('date');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef(null);

  let results = ALL_TRANSACTIONS.filter(tx => {
    const matchQ = !query || tx.merchant.toLowerCase().includes(query.toLowerCase()) || tx.category.toLowerCase().includes(query.toLowerCase());
    const matchC = activeCat === 'All' || tx.category === activeCat;
    return matchQ && matchC;
  });

  if (sort === 'amount_desc') results = [...results].sort((a, b) => b.amount - a.amount);
  else if (sort === 'amount_asc') results = [...results].sort((a, b) => a.amount - b.amount);

  const totalShown = results.reduce((s, t) => s + t.amount, 0);

  const highlight = (text) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <span>
        {text.slice(0, idx)}
        <span style={{ background: '#FFF3B0', borderRadius: 3, padding: '0 1px' }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </span>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>

      {/* ── Header + Search bar ── */}
      <div style={{ paddingTop: 70, padding: '70px 20px 12px', background: '#F2F2F7' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 14 }}>Search</h1>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFFFFF', borderRadius: 16,
          padding: '12px 16px',
          border: `1.5px solid ${focused ? '#007AFF' : 'transparent'}`,
          boxShadow: focused ? '0 0 0 3px rgba(0,122,255,0.1)' : '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'all 0.2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="5" stroke={focused ? '#007AFF' : '#C7C7CC'} strokeWidth="1.6"/>
            <path d="M10 10l4 4" stroke={focused ? '#007AFF' : '#C7C7CC'} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search transactions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#1C1C1E',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: '#C7C7CC', border: 'none', borderRadius: 10, width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Category chips ── */}
      <div style={{ padding: '8px 0 8px 20px', overflowX: 'auto', display: 'flex', gap: 8 }}>
        {FILTER_CATS.map(c => (
          <button key={c} onClick={() => setActiveCat(c)} style={{
            padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: activeCat === c ? '#007AFF' : '#FFFFFF',
            color: activeCat === c ? '#FFFFFF' : '#3C3C43',
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.15s',
          }}>{c}</button>
        ))}
        <div style={{ width: 12, flexShrink: 0 }} />
      </div>

      {/* ── Sort + results count ── */}
      <div style={{ padding: '4px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>
          {results.length} result{results.length !== 1 ? 's' : ''} · {fmt(totalShown)}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {SORT_OPTIONS.map(([val, label]) => (
            <button key={val} onClick={() => setSort(val)} style={{
              padding: '5px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: sort === val ? '#1C1C1E' : 'transparent',
              color: sort === val ? '#FFFFFF' : '#8E8E93',
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Results list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#3C3C43', marginBottom: 6 }}>No results</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>Try a different search or filter</p>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {results.map((tx, i) => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px',
                borderBottom: i < results.length - 1 ? '1px solid #F2F2F7' : 'none',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: tx.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: tx.color }}>
                    {tx.merchant.split(' ').slice(0,2).map(w => w[0]).join('')}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{highlight(tx.merchant)}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{tx.category} · {relDate(tx.date)}</p>
                </div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', flexShrink: 0 }}>−{fmt(tx.amount)}</p>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

Object.assign(window, { SearchScreen, ALL_TRANSACTIONS });
