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

function LocalWalletsStrip({ store, locale, onOpen }) {
  const rows = typeof localAccountBalances === 'function' ? localAccountBalances(store) : [];
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#0F172A';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#64748B';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  const cream = typeof ZENITH !== 'undefined' ? ZENITH.cream : '#E8EEF7';
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ padding: '0 24px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: ink }}>{t(locale, 'wallets')}</h3>
        {onOpen ? (
          <button type="button" onClick={onOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.accent, fontWeight: 600 }}>{t(locale, 'seeAll')}</button>
        ) : null}
      </div>
      <div style={{ overflowX: 'auto', paddingLeft: 20, paddingRight: 20, display: 'flex', gap: 12 }}>
        {rows.map((row) => {
          const cap = typeof accountBudgetLimit === 'function' ? accountBudgetLimit(store, row.id) : 0;
          const spent = typeof spentOnAccount === 'function' ? spentOnAccount(store, row.id) : 0;
          const pct = cap > 0 ? Math.min(spent / cap, 1) : 0;
          return (
            <div key={row.id} style={{
              minWidth: 168, background: card, borderRadius: 22, padding: '16px 16px 14px',
              boxShadow: '0 2px 14px rgba(15,23,42,0.06)', flexShrink: 0,
            }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: row.color, marginBottom: 8 }}>
                {acctLabel(row, locale) || row.name}
              </p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: ink, letterSpacing: -0.5 }}>{fmt(row.balance)}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 4 }}>{t(locale, 'notionBalance')}</p>
              {cap > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 4, background: cream, borderRadius: 2 }}>
                    <div style={{ height: '100%', width: (pct * 100) + '%', background: pct >= 1 ? '#EF4444' : row.color, borderRadius: 2 }} />
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted, marginTop: 4 }}>{fmt(spent)} / {fmt(cap)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HealthScoreCard({ store, locale, onOpen }) {
  const health = typeof healthScore === 'function' ? healthScore(store) : { score: 0, label: 'start' };
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const card = ZENITH.card;
  const accent = ZENITH.accent;
  const labelMap = { strong: t(locale, 'strong'), ok: t(locale, 'okLabel'), watch: t(locale, 'watch'), tight: t(locale, 'tight'), start: t(locale, 'startTracking') };
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (health.score / 100) * circ;
  return (
    <div style={{ padding: '0 20px', marginBottom: 18 }}>
      <button type="button" onClick={onOpen} style={{
        width: '100%', background: card, border: 'none', borderRadius: 22, padding: '16px 18px',
        boxShadow: zenithSoftShadow(), cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
      }}>
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r={r} fill="none" stroke={ZENITH.cream} strokeWidth="8" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={accent} strokeWidth="8"
            strokeDasharray={dash + ' ' + circ} strokeLinecap="round" transform="rotate(-90 36 36)" />
          <text x="36" y="41" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="16" fontWeight="800" fill={ink}>{health.score}</text>
        </svg>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink }}>{t(locale, 'healthScore')}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginTop: 4 }}>{labelMap[health.label] || health.label}</p>
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: accent, fontWeight: 600 }}>{t(locale, 'insights')}</span>
      </button>
    </div>
  );
}

function GoalsPeek({ store, locale, onOpen }) {
  const goals = store.goals || [];
  if (!goals.length) return null;
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const card = ZENITH.card;
  const cream = ZENITH.cream;
  return (
    <div style={{ padding: '0 20px', marginBottom: 18 }}>
      <button type="button" onClick={onOpen} style={{
        width: '100%', background: card, border: 'none', borderRadius: 22, padding: '16px 18px',
        boxShadow: zenithSoftShadow(), cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{t(locale, 'goals')}</p>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.accent, fontWeight: 600 }}>{t(locale, 'seeAll')}</span>
        </div>
        {goals.slice(0, 3).map((g) => {
          const pct = g.target > 0 ? Math.min(g.saved / g.target, 1) : 0;
          return (
            <div key={g.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: ink }}>{g.emoji} {g.name}</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: ink }}>{Math.round(pct * 100)}%</p>
              </div>
              <div style={{ height: 4, background: cream, borderRadius: 2 }}>
                <div style={{ height: '100%', width: (pct * 100) + '%', background: g.color, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </button>
    </div>
  );
}

function InsightsDigest({ store, locale, onOpen }) {
  const insight = typeof monthInsights === 'function' ? monthInsights(store) : null;
  if (!insight || insight.spent <= 0) return null;
  const muted = ZENITH.muted;
  const card = ZENITH.card;
  const ink = ZENITH.ink;
  const vs = insight.delta == null ? t(locale, 'noChange')
    : insight.delta < 0 ? t(locale, 'lessSpend') : t(locale, 'moreSpend');
  return (
    <div style={{ padding: '0 20px', marginBottom: 18 }}>
      <button type="button" onClick={onOpen} style={{
        width: '100%', background: card, border: 'none', borderRadius: 22, padding: '14px 18px',
        boxShadow: zenithSoftShadow(), cursor: 'pointer', textAlign: 'left',
      }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink, marginBottom: 4 }}>{t(locale, 'insightsDigest')}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>
          {vs}{insight.delta != null ? ' · ' + Math.abs(Math.round(insight.delta * 100)) + '%' : ''} · {fmt(insight.spent)}
        </p>
      </button>
    </div>
  );
}

function LocalBudgetsPreview({ store, locale, onOpen }) {
  const rows = categorySpendRows(store).filter((c) => c.budget > 0).slice(0, 4);
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#0F172A';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#64748B';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  const cream = typeof ZENITH !== 'undefined' ? ZENITH.cream : '#E8EEF7';
  return (
    <div style={{ padding: '0 20px', marginBottom: 24 }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t(locale, 'budgets')}
        onClick={() => onOpen && onOpen()}
        onKeyDown={(e) => { if (e.key === 'Enter') onOpen && onOpen(); }}
        style={{
          background: card, borderRadius: 24, padding: '16px 18px 12px',
          boxShadow: '0 2px 14px rgba(15,23,42,0.06)', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{t(locale, 'budgets')}</p>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB', fontWeight: 600 }}>{t(locale, 'seeAll')}</span>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginBottom: 8 }}>{t(locale, 'localLedger')}</p>
        {rows.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, padding: '8px 0 4px' }}>{t(locale, 'noBudgetYet')}</p>
        ) : rows.map((row) => {
          const pct = row.budget > 0 ? Math.min(row.spent / row.budget, 1) : 0;
          return (
            <div key={row.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{catLabel(row, locale)}</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: ink }}>{fmt(Math.max(row.budget - row.spent, 0))}</p>
              </div>
              <div style={{ height: 6, background: cream, borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: row.color, borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>
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
      paddingTop: 'var(--zenith-pad-top)', paddingBottom: 'var(--zenith-pad-bottom)',
      background: typeof ZENITH !== 'undefined' ? ZENITH.page : '#FFFFFF',
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
              background: 'linear-gradient(145deg, #2563EB, #1D4ED8)',
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
            background: 'linear-gradient(145deg, #2563EB 0%, #1D4ED8 100%)',
            borderRadius: 28,
            padding: '28px 24px 24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(29,78,216,0.32)',
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

      {typeof zenithNotionEnabled === 'function' && zenithNotionEnabled() ? (
        <>
          <NotionHomeCard locale={locale} onOpen={() => onNavigate && onNavigate('notionExpenses')} />
          <NotionAccountsStrip locale={locale} onOpen={() => onNavigate && onNavigate('notionAccounts')} />
          <NotionBudgetsPreview locale={locale} onOpen={() => onNavigate && onNavigate('notionBudgets')} />
        </>
      ) : (
        <>
          <LocalWalletsStrip store={store} locale={locale} onOpen={() => onNavigate && onNavigate('you')} />
          <HealthScoreCard store={store} locale={locale} onOpen={() => onNavigate && onNavigate('insights')} />
          <GoalsPeek store={store} locale={locale} onOpen={() => onNavigate && onNavigate('goals')} />
          <InsightsDigest store={store} locale={locale} onOpen={() => onNavigate && onNavigate('insights')} />
          <LocalBudgetsPreview store={store} locale={locale} onOpen={() => onNavigate && onNavigate('budget')} />
        </>
      )}

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
          <button type="button" onClick={() => onNavigate && onNavigate('budget')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF', fontWeight: 600 }}>
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
          <button type="button" onClick={() => onNavigate && onNavigate('activity')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF', fontWeight: 600 }}>
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
                background: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF', color: '#fff',
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

Object.assign(window, { HomeScreen, MerchantIcon, LocalWalletsStrip, LocalBudgetsPreview, HealthScoreCard, GoalsPeek, InsightsDigest });
