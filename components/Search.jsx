// Search.jsx — Activity: live transactions + search

function ActivityScreen({ store, onSelectTx }) {
  const locale = store.user.locale || 'en';
  const [query, setQuery] = React.useState('');
  const [activeCat, setActiveCat] = React.useState('All');
  const [sort, setSort] = React.useState('date');
  const [focused, setFocused] = React.useState(false);

  const cats = store.categories.filter((c) => c.type === 'expense' || c.type === 'income');
  const list = [...(store.transactions || [])];

  let results = list.filter((tx) => {
    const cat = findCat(store, tx.categoryId);
    const label = cat ? catLabel(cat, locale) : '';
    const acct = findAccount(store, tx.accountId);
    const hay = ((tx.merchant || '') + ' ' + (tx.note || '') + ' ' + (tx.merchantUpi || '') + ' ' + label + ' ' + (acct ? acct.name : '')).toLowerCase();
    const matchQ = !query || hay.includes(query.toLowerCase());
    const matchC = activeCat === 'All' || tx.categoryId === activeCat;
    return matchQ && matchC;
  });

  if (sort === 'amount_desc') results.sort((a, b) => b.amount - a.amount);
  else if (sort === 'amount_asc') results.sort((a, b) => a.amount - b.amount);
  else results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const totalShown = results.filter((t) => t.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
      <div style={{ padding: '70px 20px 12px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 14 }}>{t(locale, 'activity')}</h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FFFFFF', borderRadius: 16, padding: '12px 16px',
          border: `1.5px solid ${focused ? '#007AFF' : 'transparent'}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke={focused ? '#007AFF' : '#8E8E93'} strokeWidth="1.6"/>
            <path d="M10 10l4 4" stroke={focused ? '#007AFF' : '#8E8E93'} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            aria-label={t(locale, 'search')}
            placeholder={t(locale, 'searchPh')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, background: 'transparent' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setActiveCat('All')}
            style={{
              flexShrink: 0, padding: '8px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeCat === 'All' ? '#007AFF' : '#FFFFFF',
              color: activeCat === 'All' ? '#fff' : '#1C1C1E',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
            }}
          >{t(locale, 'all')}</button>
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCat(c.id)}
              style={{
                flexShrink: 0, padding: '8px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeCat === c.id ? c.color : '#FFFFFF',
                color: activeCat === c.id ? '#fff' : '#1C1C1E',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              }}
            >{catLabel(c, locale)}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[['date', locale === 'hi' ? 'नया' : 'Newest'], ['amount_desc', locale === 'hi' ? 'ज़्यादा' : 'Highest'], ['amount_asc', locale === 'hi' ? 'कम' : 'Lowest']].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSort(id)}
              style={{
                padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: sort === id ? '#E8F1FF' : 'transparent',
                color: sort === id ? '#007AFF' : '#8E8E93',
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 110px' }}>
        {results.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1C1C1E' }}>{t(locale, 'noTxns')}</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 10 }}>{fmt(totalShown)}</p>
            <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden' }}>
              {results.map((tx, i) => {
                const cat = findCat(store, tx.categoryId);
                const sign = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '−';
                const color = tx.type === 'income' ? '#16A34A' : tx.type === 'transfer' ? '#64748B' : '#FF3B30';
                return (
                  <div
                    key={tx.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectTx && onSelectTx(tx)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSelectTx && onSelectTx(tx); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      borderBottom: i < results.length - 1 ? '1px solid #F2F2F7' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: (cat ? cat.color : '#007AFF') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }} aria-hidden="true">
                      {cat ? cat.emoji : '✦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>{tx.merchant}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>
                        {relDate(tx.date, locale)} · {cat ? catLabel(cat, locale) : ''} · {tx.method || ''}
                        {tx.merchantUpi ? ' · ' + tx.merchantUpi : ''}
                      </p>
                    </div>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color }}>{sign}{fmt(tx.amount)}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ActivityScreen, SearchScreen: ActivityScreen });
