// CategoryDetail.jsx — Live category drill-down

function CategoryDetailScreen({ store, category, onBack, onSelectTx }) {
  const locale = store.user.locale || 'en';
  const cat = findCat(store, category) || { id: category, name: category, nameHi: category, color: '#007AFF', emoji: '✦' };
  const mk = monthKey();
  const spent = spentInCategory(store, cat.id, mk);
  const budget = budgetLimit(store, cat.id, mk);
  const txs = (store.transactions || []).filter((tx) => tx.categoryId === cat.id);
  const pct = budget > 0 ? spent / budget : 0;
  const over = budget > 0 && pct >= 0.9;

  const byDate = {};
  txs.forEach((tx) => {
    const d = relDate(tx.date, locale);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(tx);
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
      <div style={{ padding: '70px 20px 0' }}>
        <button type="button" aria-label={t(locale, 'close')} onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>{locale === 'hi' ? 'वापस' : 'Back'}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }} aria-hidden="true">{cat.emoji}</div>
          <div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E' }}>{catLabel(cat, locale)}</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>{txs.length}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{t(locale, 'spentMonth')}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: over ? '#FF3B30' : cat.color }}>{fmt(spent)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{t(locale, 'budgets')}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E' }}>{budget > 0 ? fmt(budget) : '—'}</p>
            </div>
          </div>
          {budget > 0 && (
            <>
              <div style={{ height: 6, background: '#F2F2F7', borderRadius: 3, marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: over ? '#FF3B30' : '#8E8E93', fontWeight: over ? 600 : 400 }}>
                {pct >= 1 ? t(locale, 'overspent') : over ? t(locale, 'nearLimit') : Math.round(pct * 100) + '%'}
              </span>
            </>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        {txs.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingTop: 24 }}>{t(locale, 'noTxns')}</p>
        ) : Object.entries(byDate).map(([label, group]) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 8 }}>{label}</p>
            <div style={{ background: '#FFFFFF', borderRadius: 18 }}>
              {group.map((tx) => (
                <div
                  key={tx.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTx && onSelectTx(tx)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700 }}>{tx.merchant}</span>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: tx.type === 'income' ? '#16A34A' : '#FF3B30' }}>{tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}</span>
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
