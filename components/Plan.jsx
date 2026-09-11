// Plan.jsx — Budgets, recurring, goals hub

function PlanScreen({ store, onNavigate }) {
  const locale = store.user.locale || 'en';
  const mk = monthKey();
  const budget = totalBudgetLimit(store, mk);
  const spent = monthExpenseTotal(store, mk);

  const cards = [
    { id: 'budget', title: t(locale, 'budgets'), sub: budget > 0 ? fmt(spent) + ' / ' + fmt(budget) : t(locale, 'noBudgetYet'), emoji: '🎯' },
    { id: 'recurring', title: t(locale, 'recurring'), sub: (store.recurring || []).filter((r) => r.active).length
      ? String((store.recurring || []).filter((r) => r.active).length) + (locale === 'hi' ? ' सक्रिय' : ' active')
      : (locale === 'hi' ? 'बिल और सब्सक्रिप्शन' : 'Bills & subscriptions'), emoji: '🔄' },
    { id: 'goals', title: t(locale, 'goals'), sub: (store.goals || []).length
      ? String((store.goals || []).length)
      : (locale === 'hi' ? 'बचत लक्ष्य' : 'Savings targets'), emoji: '🏆' },
    { id: 'insights', title: t(locale, 'insights'), sub: locale === 'hi' ? 'इस vs पिछले महीने' : 'This vs last month', emoji: '📊' },
    { id: 'travel', title: t(locale, 'travel'), sub: zenithIsPro && zenithIsPro(store) ? t(locale, 'paid') : t(locale, 'demoTrip'), emoji: '✈️' },
  ];
  if (typeof zenithNotionEnabled === 'function' && zenithNotionEnabled()) {
    cards.unshift({ id: 'notionBudgets', title: t(locale, 'notionBudgets'), sub: t(locale, 'notionLeftMonth'), emoji: '📒' });
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: typeof ZENITH !== 'undefined' ? ZENITH.page : '#F2F2F7', paddingTop: 'var(--zenith-pad-top)', paddingBottom: 'var(--zenith-pad-bottom)' }}>
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>{monthLabel(undefined, locale)}</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{t(locale, 'plan')}</h1>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            aria-label={card.title}
            onClick={() => onNavigate && onNavigate(card.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF', border: 'none', borderRadius: 20,
              padding: '18px 16px', cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 28 }} aria-hidden="true">{card.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1C1C1E' }}>{card.title}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginTop: 3 }}>{card.sub}</p>
            </div>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
              <path d="M1 1l6 6-6 6" stroke="#C7C7CC" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PlanScreen });
