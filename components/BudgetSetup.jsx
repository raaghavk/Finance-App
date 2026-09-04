// BudgetSetup.jsx — Set & edit per-category budgets

function BudgetSetupScreen() {
  const [categories, setCategories] = React.useState([
    { name: 'Food & Drink', emoji: '🍜', color: '#FF6B6B', budget: 6000, spent: 3920 },
    { name: 'Groceries',    emoji: '🛒', color: '#34D399', budget: 8000, spent: 5600 },
    { name: 'Transport',    emoji: '🚗', color: '#60A5FA', budget: 3000, spent: 1800 },
    { name: 'Entertainment',emoji: '🎬', color: '#A78BFA', budget: 3000, spent: 2320 },
    { name: 'Health',       emoji: '💊', color: '#F97316', budget: 2000, spent: 0    },
    { name: 'Shopping',     emoji: '🛍️', color: '#EC4899', budget: 4000, spent: 0    },
    { name: 'Bills',        emoji: '📄', color: '#6E6E73', budget: 5000, spent: 0    },
  ]);
  const [editing, setEditing] = React.useState(null); // index of row being edited
  const [draft, setDraft] = React.useState('');
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent  = categories.reduce((s, c) => s + c.spent,  0);
  const income = 80000;
  const unallocated = income - totalBudget;

  const commit = (i) => {
    const val = parseInt(draft, 10);
    if (!isNaN(val) && val >= 0) {
      setCategories(prev => prev.map((c, idx) => idx === i ? { ...c, budget: val } : c));
    }
    setEditing(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>May 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Budget</h1>
      </div>

      {/* ── Income vs Budget summary ── */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#1C1C1E', borderRadius: 22, padding: '20px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Monthly Income</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, marginBottom: 18 }}>₹{income.toLocaleString('en-IN')}</p>

          {/* Stacked allocation bar */}
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 12, display: 'flex' }}>
            {categories.map(c => (
              <div key={c.name} style={{ height: '100%', width: `${(c.budget / income) * 100}%`, background: c.color, transition: 'width 0.4s ease' }} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Allocated</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>₹{totalBudget.toLocaleString('en-IN')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>Unallocated</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: unallocated >= 0 ? '#34D399' : '#FF3B30' }}>₹{Math.abs(unallocated).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category budgets list ── */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Categories</p>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'visible', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {categories.map((cat, i) => {
            const pct = cat.budget > 0 ? cat.spent / cat.budget : 0;
            const over = pct >= 0.9;
            const isEditing = editing === i;
            return (
              <div key={cat.name} style={{
                padding: '14px 18px',
                borderBottom: i < categories.length - 1 ? '1px solid #F2F2F7' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Emoji icon */}
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {cat.emoji}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>{cat.name}</span>

                      {/* Editable budget */}
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, color: '#007AFF' }}>₹</span>
                          <input
                            autoFocus
                            type="number"
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onBlur={() => commit(i)}
                            onKeyDown={e => e.key === 'Enter' && commit(i)}
                            style={{
                              width: 80, border: 'none', outline: 'none',
                              borderBottom: '2px solid #007AFF',
                              fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
                              color: '#007AFF', background: 'transparent', textAlign: 'right',
                            }}
                          />
                        </div>
                      ) : (
                        <button onClick={() => { setEditing(i); setDraft(String(cat.budget)); }} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: over ? '#FF3B30' : '#1C1C1E' }}>₹{cat.budget.toLocaleString('en-IN')}</span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 9l2-0.5 5.5-5.5L7 2 1.5 7.5 1 9z" stroke="#C7C7CC" strokeWidth="1.2" strokeLinejoin="round"/>
                            <path d="M7 2l1.5 1.5" stroke="#C7C7CC" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: over ? '#FF3B30' : cat.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#C7C7CC' }}>₹{cat.spent.toLocaleString('en-IN')} spent</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: over ? '#FF3B30' : '#C7C7CC', fontWeight: over ? 600 : 400 }}>
                        {over ? 'Near limit' : `₹${(cat.budget - cat.spent).toLocaleString('en-IN')} left`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add category ── */}
      <div style={{ padding: '0 20px' }}>
        <button style={{
          width: '100%', padding: '16px', border: '1.5px dashed #C7C7CC', borderRadius: 18,
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#C7C7CC" strokeWidth="1.5"/>
            <path d="M9 5v8M5 9h8" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#8E8E93' }}>Add Category</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { BudgetSetupScreen });
