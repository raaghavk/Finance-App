// Search.jsx — Activity: live transactions + search + date range

function ActivityScreen({ store, onSelectTx, onNavigate }) {
  const locale = store.user.locale || 'en';
  const [query, setQuery] = React.useState('');
  const [activeCat, setActiveCat] = React.useState('All');
  const [sort, setSort] = React.useState('date');
  const [focused, setFocused] = React.useState(false);
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');

  const cats = store.categories.filter((c) => c.type === 'expense' || c.type === 'income');
  const list = [...(store.transactions || [])];
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;
  const cream = ZENITH.cream;

  let results = list.filter((tx) => {
    const cat = findCat(store, tx.categoryId);
    const label = cat ? catLabel(cat, locale) : '';
    const hay = ((tx.merchant || '') + ' ' + (tx.note || '') + ' ' + label).toLowerCase();
    const matchQ = !query || hay.includes(query.toLowerCase());
    const matchC = activeCat === 'All' || tx.categoryId === activeCat;
    const matchFrom = !fromDate || (tx.date || '') >= fromDate;
    const matchTo = !toDate || (tx.date || '') <= toDate;
    return matchQ && matchC && matchFrom && matchTo;
  });

  if (sort === 'amount_desc') results.sort((a, b) => b.amount - a.amount);
  else if (sort === 'amount_asc') results.sort((a, b) => a.amount - b.amount);
  else results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const totalShown = results.filter((row) => row.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const grouped = {};
  results.forEach((tx) => {
    const label = relDate(tx.date, locale);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(tx);
  });
  const presets = [
    { id: 'all', label: t(locale, 'all'), from: '', to: '' },
    { id: 'month', label: t(locale, 'thisMonth'), from: monthKey() + '-01', to: todayISO() },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: page }}>
      <div style={{ padding: 'var(--zenith-pad-top) 20px 12px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 14 }}>{t(locale, 'activity')}</h1>
        {typeof SourceSwitch === 'function' && typeof zenithNotionEnabled === 'function' && zenithNotionEnabled() && (
          <SourceSwitch
            locale={locale}
            active="local"
            onLocal={() => {}}
            onNotion={() => onNavigate && onNavigate('notionExpenses')}
          />
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: card, borderRadius: 16, padding: '12px 16px',
          border: '1.5px solid ' + (focused ? accent : 'transparent'),
          boxShadow: zenithSoftShadow(),
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="5" stroke={focused ? accent : muted} strokeWidth="1.6"/>
            <path d="M10 10l4 4" stroke={focused ? accent : muted} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            aria-label={t(locale, 'search')}
            placeholder={t(locale, 'searchPh')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, background: 'transparent', color: ink }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', overflowX: 'auto' }}>
          {presets.map((p) => (
            <button key={p.id} type="button" onClick={() => { setFromDate(p.from); setToDate(p.to); }} style={{
              padding: '6px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: fromDate === p.from && toDate === p.to ? cream : 'transparent',
              color: fromDate === p.from && toDate === p.to ? accent : muted,
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
            }}>{p.label}</button>
          ))}
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted, flexShrink: 0 }}>{t(locale, 'fromDate')}
            <input type="date" aria-label={t(locale, 'fromDate')} value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ marginLeft: 6, border: 'none', background: cream, borderRadius: 8, padding: '4px 6px', color: ink }} />
          </label>
          <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted, flexShrink: 0 }}>{t(locale, 'toDate')}
            <input type="date" aria-label={t(locale, 'toDate')} value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ marginLeft: 6, border: 'none', background: cream, borderRadius: 8, padding: '4px 6px', color: ink }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setActiveCat('All')}
            style={{
              flexShrink: 0, padding: '8px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: activeCat === 'All' ? accent : card,
              color: activeCat === 'All' ? '#fff' : ink,
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
                background: activeCat === c.id ? c.color : card,
                color: activeCat === c.id ? '#fff' : ink,
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
                background: sort === id ? cream : 'transparent',
                color: sort === id ? accent : muted,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 110px' }}>
        {results.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: ink }}>{t(locale, 'noTxns')}</p>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 10 }}>{fmt(totalShown)}</p>
            {Object.entries(grouped).map(([dateLabel, txs]) => (
              <div key={dateLabel} style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>{dateLabel}</p>
                <div style={{ background: card, borderRadius: 22, overflow: 'hidden' }}>
                  {txs.map((tx, i) => {
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
                          borderBottom: i < txs.length - 1 ? '1px solid ' + cream : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: (cat ? cat.color : accent) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }} aria-hidden="true">
                          {cat ? cat.emoji : '✦'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink }}>{tx.merchant}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>{cat ? catLabel(cat, locale) : ''} · {tx.method}</p>
                        </div>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color }}>{sign}{fmt(tx.amount)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ActivityScreen, SearchScreen: ActivityScreen });
