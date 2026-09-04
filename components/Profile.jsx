// Profile.jsx — User profile, settings, and data management

const DEFAULT_CATS = [
  { id: 1, name: 'Food & Drink', emoji: '🍜', color: '#FF6B6B', subs: ['Restaurants', 'Coffee', 'Takeaway'] },
  { id: 2, name: 'Groceries',    emoji: '🛒', color: '#34D399', subs: ['Supermarket', 'Vegetables', 'Dairy'] },
  { id: 3, name: 'Transport',    emoji: '🚗', color: '#60A5FA', subs: ['Cab', 'Bus', 'Fuel', 'Metro'] },
  { id: 4, name: 'Entertainment',emoji: '🎬', color: '#A78BFA', subs: ['Movies', 'Events', 'Streaming'] },
  { id: 5, name: 'Health',       emoji: '💊', color: '#F97316', subs: ['Medicine', 'Doctor', 'Gym'] },
  { id: 6, name: 'Shopping',     emoji: '🛍️', color: '#EC4899', subs: ['Clothing', 'Electronics', 'Home'] },
  { id: 7, name: 'Bills',        emoji: '📄', color: '#6E6E73', subs: ['Electricity', 'Internet', 'Rent'] },
];

function CategoryManager() {
  const [cats, setCats] = React.useState(DEFAULT_CATS);
  const [expanded, setExpanded] = React.useState(null);
  const [editingCat, setEditingCat] = React.useState(null);
  const [newSubInput, setNewSubInput] = React.useState('');
  const [addingCat, setAddingCat] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatEmoji, setNewCatEmoji] = React.useState('✦');

  const EMOJIS = ['🍜','🛒','🚗','🎬','💊','🛍️','📄','✈️','🏠','📚','🎮','🐾','☕','🎵','🏋️'];
  const COLORS = ['#FF6B6B','#34D399','#60A5FA','#A78BFA','#F97316','#EC4899','#6E6E73','#F59E0B','#007AFF','#5856D6'];

  const addSub = (catId) => {
    if (!newSubInput.trim()) return;
    setCats(prev => prev.map(c => c.id === catId ? { ...c, subs: [...c.subs, newSubInput.trim()] } : c));
    setNewSubInput('');
  };
  const removeSub = (catId, sub) => setCats(prev => prev.map(c => c.id === catId ? { ...c, subs: c.subs.filter(s => s !== sub) } : c));
  const removeCat = (catId) => { setCats(prev => prev.filter(c => c.id !== catId)); if (expanded === catId) setExpanded(null); };
  const addCat = () => {
    if (!newCatName.trim()) return;
    setCats(prev => [...prev, { id: Date.now(), name: newCatName.trim(), emoji: newCatEmoji, color: COLORS[prev.length % COLORS.length], subs: [] }]);
    setNewCatName(''); setNewCatEmoji('✦'); setAddingCat(false);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', padding: '0 24px', marginBottom: 10 }}>Categories & Sub-categories</p>
      <div style={{ background: '#FFFFFF', marginHorizontal: 0, borderTop: '1px solid #F0F0F3', borderBottom: '1px solid #F0F0F3' }}>
        {cats.map((cat, i) => (
          <div key={cat.id} style={{ borderBottom: i < cats.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
            {/* Category row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cat.emoji}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{cat.name}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{cat.subs.length} sub-categories</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={e => { e.stopPropagation(); removeCat(cat.id); }} style={{ background: '#FFF0F0', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
                <div style={{ transform: expanded === cat.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1l5 5 5-5" stroke="#C7C7CC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Sub-categories expandable */}
            {expanded === cat.id && (
              <div style={{ padding: '0 18px 14px 66px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {cat.subs.map(sub => (
                    <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: 5, background: cat.color + '15', borderRadius: 20, padding: '5px 10px' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: cat.color }}>{sub}</span>
                      <button onClick={() => removeSub(cat.id, sub)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke={cat.color} strokeWidth="1.4" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text" placeholder="Add sub-category…" value={newSubInput}
                    onChange={e => setNewSubInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSub(cat.id)}
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #E5E5EA', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 13, outline: 'none', background: '#FFFFFF' }}
                  />
                  <button onClick={() => addSub(cat.id)} style={{ background: cat.color, border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>Add</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add new category */}
        {addingCat ? (
          <div style={{ padding: '14px 18px', borderTop: '1px solid #F2F2F7' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 10 }}>New Category</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewCatEmoji(e)} style={{ width: 32, height: 32, borderRadius: 10, border: `2px solid ${newCatEmoji === e ? '#007AFF' : 'transparent'}`, background: newCatEmoji === e ? '#F0F7FF' : '#F5F5F7', cursor: 'pointer', fontSize: 16 }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus type="text" placeholder="Category name"
                value={newCatName} onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCat()}
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #007AFF', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none' }}
              />
              <button onClick={addCat} style={{ background: '#007AFF', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Save</button>
              <button onClick={() => setAddingCat(false)} style={{ background: '#F5F5F7', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingCat(true)} style={{
            width: '100%', padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #F2F2F7',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, border: '1.5px dashed #C7C7CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="#C7C7CC" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#8E8E93' }}>Add Category</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ userName, startBalance }) {
  const [notifs, setNotifs] = React.useState(true);
  const [dailyReminder, setDailyReminder] = React.useState(false);
  const [biometrics, setBiometrics] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [currency, setCurrency] = React.useState('INR');

  const totalSpent = 13640;
  const totalTransactions = 7;
  const daysTracking = 20;
  const savedVsBudget = 16360;

  const Toggle = ({ value, onChange }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14, cursor: 'pointer',
        background: value ? '#007AFF' : '#E5E5EA',
        position: 'relative',
        transition: 'background 0.25s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: value ? 23 : 3,
        width: 22, height: 22, borderRadius: 11,
        background: '#FFFFFF',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );

  const Row = ({ label, detail, children, danger, sub, first, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', gap: 12,
      borderBottom: last ? 'none' : '1px solid #F0F0F3',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: danger ? '#FF3B30' : '#121212' }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#AAAAAA', marginTop: 2 }}>{sub}</p>}
      </div>
      {detail && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#AAAAAA' }}>{detail}</span>}
      {children}
      {!children && !detail && (
        <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
          <path d="M1 1l6 5.5L1 12" stroke="#C7C7CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      {title && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#AAAAAA', letterSpacing: 0.8, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{title}</p>}
      <div style={{ background: '#FFFFFF', marginHorizontal: 0, borderTop: '1px solid #F0F0F3', borderBottom: '1px solid #F0F0F3' }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F5F5F7', paddingTop: 70, paddingBottom: 100 }}>

      {/* ── Profile Hero ── */}
      <div style={{ padding: '0 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{
          width: 84, height: 84, borderRadius: 28,
          background: 'linear-gradient(145deg, #007AFF, #5856D6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
          boxShadow: '0 8px 28px rgba(0,122,255,0.35)',
          position: 'relative',
        }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#FFFFFF' }}>
            {(userName || 'Z')[0].toUpperCase()}
          </span>
          {/* Edit badge */}
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 26, height: 26, borderRadius: 13,
            background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 10l2-0.7L9 3.8 8.2 3l-5.5 5.5L1.5 10z" stroke="#007AFF" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M7.5 2.5l2 2" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#121212', marginBottom: 4 }}>
          {userName || 'Zenith User'}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>
          Tracking since Apr 8, 2026
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 20, width: '100%',
        }}>
          {[
            { label: 'Days', value: daysTracking, color: '#007AFF' },
            { label: 'Transactions', value: totalTransactions, color: '#5856D6' },
            { label: 'Saved', value: `₹${(savedVsBudget/1000).toFixed(0)}k`, color: '#34D399' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '14px 10px',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#AAAAAA', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Budget ── */}
      <Section title="Budget">
        <Row label="Monthly Budget" detail="₹30,000" last />
      </Section>

      {/* ── Preferences ── */}
      <Section title="Preferences">
        <Row label="Home Currency" detail={currency}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['INR', 'USD', 'EUR'].map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                padding: '5px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: currency === c ? '#007AFF' : '#F0F0F3',
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
                color: currency === c ? '#FFFFFF' : '#6E6E73',
                transition: 'all 0.15s',
              }}>{c}</button>
            ))}
          </div>
        </Row>
        <Row label="Spending Notifications" sub="Alerts when nearing budget limits">
          <Toggle value={notifs} onChange={setNotifs} />
        </Row>
        <Row label="Daily Reminder" sub="Log expenses at 9:00 PM">
          <Toggle value={dailyReminder} onChange={setDailyReminder} />
        </Row>
        <Row label="Haptics">
          <Toggle value={haptics} onChange={setHaptics} />
        </Row>
        <Row label="Face ID / Biometrics" last>
          <Toggle value={biometrics} onChange={setBiometrics} />
        </Row>
      </Section>

      {/* ── Privacy & Data ── */}
      <Section title="Privacy & Data">
        <Row label="Export Data" sub="Download your full history as CSV" />
        <Row label="Backup Locally" sub="Save encrypted backup to device" />
        <Row label="Privacy Policy" last />
      </Section>

      {/* ── Categories ── */}
      <CategoryManager />

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone">
        <Row label="Clear All Data" danger sub="Permanently delete all transactions" last />
      </Section>

      {/* Version footer */}
      <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#C7C7CC' }}>Zenith v1.0.0 · No data leaves your device</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34D399' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#34D399', fontWeight: 600 }}>Privacy Protected</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
