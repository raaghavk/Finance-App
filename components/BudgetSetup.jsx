// BudgetSetup.jsx — Live store budgets + optional monthly income

function BudgetSetupScreen({ store, onSetBudget, onSetIncome }) {
  const locale = store.user.locale || 'en';
  const mk = monthKey();
  const rows = categorySpendRows(store, mk);
  const [editing, setEditing] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const [incomeEdit, setIncomeEdit] = React.useState(false);
  const [incomeDraft, setIncomeDraft] = React.useState(String(store.monthlyIncome || ''));

  const income = Number(store.monthlyIncome) || 0;
  const totalBudget = rows.reduce((s, c) => s + c.budget, 0);
  const unallocated = income - totalBudget;
  const listed = rows.filter((c) => c.type === 'expense');

  const commit = (catId) => {
    const val = parseInt(draft, 10);
    if (!isNaN(val) && val >= 0) onSetBudget(catId, val);
    setEditing(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>{monthLabel(undefined, locale)}</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{t(locale, 'budgets')}</h1>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#1C1C1E', borderRadius: 22, padding: '20px 22px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'monthlyIncome')}</p>
          {incomeEdit ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, color: '#fff' }}>₹</span>
              <input
                autoFocus
                type="number"
                aria-label={t(locale, 'monthlyIncome')}
                value={incomeDraft}
                onChange={(e) => setIncomeDraft(e.target.value)}
                onBlur={() => {
                  const n = parseFloat(incomeDraft);
                  onSetIncome(Number.isFinite(n) && n >= 0 ? n : 0);
                  setIncomeEdit(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseFloat(incomeDraft);
                    onSetIncome(Number.isFinite(n) && n >= 0 ? n : 0);
                    setIncomeEdit(false);
                  }
                }}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff',
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setIncomeEdit(true); setIncomeDraft(String(store.monthlyIncome || '')); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12, textAlign: 'left' }}
            >
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1 }}>
                {income > 0 ? fmt(income) : t(locale, 'setIncome')}
              </p>
            </button>
          )}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 14, lineHeight: 1.4 }}>{t(locale, 'incomeHint')}</p>

          {income > 0 && (
            <>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginBottom: 12, display: 'flex' }}>
                {listed.filter((c) => c.budget > 0).map((c) => (
                  <div key={c.id} style={{ height: '100%', width: `${(c.budget / income) * 100}%`, background: c.color }} />
                ))}
                {unallocated > 0 && (
                  <div style={{ height: '100%', width: `${(unallocated / income) * 100}%`, background: 'rgba(255,255,255,0.18)' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{t(locale, 'allocated')}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>{fmt(totalBudget)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{t(locale, 'unallocated')}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: unallocated >= 0 ? '#34D399' : '#FF3B30' }}>{fmt(Math.abs(unallocated))}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 }}>{t(locale, 'categories')}</p>
        <div style={{ background: '#FFFFFF', borderRadius: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {listed.map((cat, i) => {
            const pct = cat.budget > 0 ? cat.spent / cat.budget : 0;
            const over = cat.budget > 0 && pct >= 0.9;
            const blown = cat.budget > 0 && pct >= 1;
            const isEditing = editing === cat.id;
            return (
              <div key={cat.id} style={{ padding: '14px 18px', borderBottom: i < listed.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }} aria-hidden="true">
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>{catLabel(cat, locale)}</span>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: '#007AFF' }}>₹</span>
                          <input
                            autoFocus
                            type="number"
                            aria-label={catLabel(cat, locale)}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => commit(cat.id)}
                            onKeyDown={(e) => e.key === 'Enter' && commit(cat.id)}
                            style={{
                              width: 80, border: 'none', outline: 'none',
                              borderBottom: '2px solid #007AFF',
                              fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
                              color: '#007AFF', background: 'transparent', textAlign: 'right',
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-label={t(locale, 'edit') + ' ' + catLabel(cat, locale)}
                          onClick={() => { setEditing(cat.id); setDraft(String(cat.budget || '')); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: over ? '#FF3B30' : '#1C1C1E' }}>
                            {cat.budget > 0 ? fmt(cat.budget) : '₹0'}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M1 9l2-0.5 5.5-5.5L7 2 1.5 7.5 1 9z" stroke="#8E8E93" strokeWidth="1.2" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{fmt(cat.spent)}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: over ? '#FF3B30' : '#8E8E93', fontWeight: over ? 600 : 400 }}>
                        {blown ? t(locale, 'overspent') : over ? t(locale, 'nearLimit') : cat.budget > 0 ? fmt(cat.budget - cat.spent) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BudgetSetupScreen });
