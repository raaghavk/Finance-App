// Home.jsx — Left to spend from the live store (empty first run)

function MerchantIcon({ merchant, color }) {
  const initials = String(merchant || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
      background: (color || '#007AFF') + '20',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} aria-hidden="true">
      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: color || '#007AFF' }}>{initials}</span>
    </div>
  );
}

function HomeScreen({ store, onSelectTx, onNavigate, onAdd }) {
  const locale = store.user.locale || 'en';
  const mk = monthKey();
  const rows = categorySpendRows(store, mk);
  const activeCats = rows.filter((c) => c.spent > 0 || c.budget > 0);
  const totalSpent = monthExpenseTotal(store, mk);
  const budget = totalBudgetLimit(store, mk);
  const left = leftToSpend(store, mk);
  const daysLeft = daysLeftInMonth();
  const dailyAllowance = Math.max(0, Math.round(left / daysLeft));
  const spentPct = budget > 0 ? Math.min(totalSpent / budget, 1) : 0;
  const recents = [...(store.transactions || [])]
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id).localeCompare(String(a.id)))
    .slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t(locale, 'goodMorning') : hour < 17 ? t(locale, 'goodAfternoon') : t(locale, 'goodEvening');
  const alerts = buildAlerts(store);
  const unread = alerts.filter((a) => !store.alertsRead[a.id]).length;

  const txByDate = {};
  recents.forEach((tx) => {
    const label = relDate(tx.date, locale);
    if (!txByDate[label]) txByDate[label] = [];
    txByDate[label].push(tx);
  });

  const amountColor = (tx) => {
    if (tx.type === 'income') return '#16A34A';
    if (tx.type === 'transfer') return '#64748B';
    return '#FF3B30';
  };

  return (
    <div style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      paddingTop: 70, paddingBottom: 110,
      background: '#FFFFFF',
    }}>
      <div style={{ padding: '0 24px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6E6E73', marginBottom: 4 }}>{greeting}</p>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#121212' }}>{store.user.name} 👋</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          <button
            type="button"
            aria-label={t(locale, 'notifications')}
            onClick={() => onNavigate && onNavigate('notifications')}
            style={{
              width: 38, height: 38, borderRadius: 12, background: '#F5F5F7', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 1.5C9 1.5 4.5 4 4.5 9v3.5H13.5V9c0-5-4.5-7.5-4.5-7.5z" stroke="#121212" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M7 13.5c0 1.1.9 2 2 2s2-.9 2-2" stroke="#121212" strokeWidth="1.5"/>
            </svg>
            {unread > 0 && (
              <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, background: '#FF3B30', border: '1.5px solid #F5F5F7' }} />
            )}
          </button>
          <button
            type="button"
            aria-label={t(locale, 'profile')}
            onClick={() => onNavigate && onNavigate('you')}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(145deg, #007AFF, #5856D6)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
              {(store.user.name || 'Z')[0].toUpperCase()}
            </span>
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div
          role="button"
          tabIndex={0}
          aria-label={t(locale, 'leftToSpend')}
          onClick={() => onNavigate && onNavigate('budget')}
          onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate('budget'); }}
          style={{
            background: 'linear-gradient(145deg, #007AFF 0%, #0056CC 100%)',
            borderRadius: 28,
            padding: '28px 24px 24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,122,255,0.35)',
            cursor: 'pointer',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.78)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{t(locale, 'leftToSpend')}</p>
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'white' }}>{monthLabel(undefined, locale)}</span>
              </div>
            </div>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 48, fontWeight: 800, color: '#FFFFFF', lineHeight: 1, marginBottom: 20, letterSpacing: -1 }}>
              {fmt(left)}
            </h2>
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${spentPct * 100}%`, background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{t(locale, 'dailyAllow')}</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{fmt(dailyAllowance)}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>/day</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{t(locale, 'daysLeft')}</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>{daysLeft}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', marginBottom: 2 }}>{t(locale, 'spentMonth')}</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#121212' }}>{fmt(totalSpent)}</p>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>
            {budget > 0 ? t(locale, 'ofBudget', { n: fmt(budget) }) : t(locale, 'noBudgetYet')}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ padding: '0 24px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>{t(locale, 'categories')}</h3>
          <button type="button" onClick={() => onNavigate && onNavigate('budget')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#007AFF', fontWeight: 600 }}>
            {t(locale, 'seeAll')}
          </button>
        </div>
        {activeCats.length === 0 ? (
          <p style={{ padding: '0 24px', fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>{t(locale, 'noBudgetYet')}</p>
        ) : (
          <div style={{ overflowX: 'auto', paddingLeft: 20, paddingRight: 20, display: 'flex', gap: 12 }}>
            {activeCats.map((cat) => {
              const pct = cat.budget > 0 ? cat.spent / cat.budget : 0;
              const over = cat.budget > 0 && pct >= 0.9;
              const blown = cat.budget > 0 && pct >= 1;
              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  aria-label={catLabel(cat, locale)}
                  onClick={() => onNavigate && onNavigate('categoryDetail', cat.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate('categoryDetail', cat.id); }}
                  style={{
                    minWidth: 150, background: '#F5F5F7', borderRadius: 20, padding: '18px 16px',
                    flexShrink: 0, cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 10 }} aria-hidden="true">{cat.emoji}</div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: '#121212', marginBottom: 2 }}>{catLabel(cat, locale)}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', marginBottom: 12 }}>
                    {fmt(cat.spent)}{cat.budget > 0 ? ' / ' + fmt(cat.budget) : ''}
                  </p>
                  {cat.budget > 0 && (
                    <div style={{ height: 4, background: '#E5E5EA', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 2 }} />
                    </div>
                  )}
                  {over && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#FF3B30', fontWeight: 600, marginTop: 6 }}>
                      {blown ? t(locale, 'overspent') : t(locale, 'nearLimit')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>{t(locale, 'recent')}</h3>
          <button type="button" onClick={() => onNavigate && onNavigate('activity')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#007AFF', fontWeight: 600 }}>
            {t(locale, 'all')}
          </button>
        </div>

        {recents.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', background: '#F5F5F7', borderRadius: 22 }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#121212', marginBottom: 6 }}>{t(locale, 'emptyHome')}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6E6E73', marginBottom: 16, lineHeight: 1.45 }}>{t(locale, 'emptyHomeSub')}</p>
            <button
              type="button"
              aria-label={t(locale, 'firstExpense')}
              onClick={() => onAdd && onAdd()}
              style={{
                padding: '12px 20px', border: 'none', borderRadius: 14, cursor: 'pointer',
                background: '#007AFF', color: '#fff',
                fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700,
              }}
            >{t(locale, 'firstExpense')}</button>
          </div>
        ) : Object.entries(txByDate).map(([dateLabel, txs]) => (
          <div key={dateLabel} style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 }}>{dateLabel}</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {txs.map((tx, i) => {
                const cat = findCat(store, tx.categoryId);
                const sign = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '' : '−';
                return (
                  <div
                    key={tx.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectTx(tx)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSelectTx(tx); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 0',
                      borderBottom: i < txs.length - 1 ? '1px solid #F0F0F3' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <MerchantIcon merchant={tx.merchant} color={cat ? cat.color : '#007AFF'} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#121212', marginBottom: 3 }}>{tx.merchant}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>{cat ? catLabel(cat, locale) : tx.categoryId}</p>
                    </div>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: amountColor(tx) }}>
                      {sign}{fmt(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, MerchantIcon });
