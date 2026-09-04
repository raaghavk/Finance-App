// AddExpense.jsx — Numpad expense entry screen

const EXPENSE_CATEGORIES = [
  { name: 'Food & Drink', color: '#FF6B6B', emoji: '🍜' },
  { name: 'Transport', color: '#60A5FA', emoji: '🚗' },
  { name: 'Groceries', color: '#34D399', emoji: '🛒' },
  { name: 'Entertainment', color: '#A78BFA', emoji: '🎬' },
  { name: 'Health', color: '#F97316', emoji: '💊' },
  { name: 'Shopping', color: '#EC4899', emoji: '🛍️' },
  { name: 'Bills', color: '#6E6E73', emoji: '📄' },
  { name: 'Other', color: '#121212', emoji: '✦' },
];

function AddExpenseScreen({ onClose, onSave }) {
  const [amount, setAmount] = React.useState('0');
  const [note, setNote] = React.useState('');
  const [selectedCat, setSelectedCat] = React.useState(null);
  const [saved, setSaved] = React.useState(false);

  const handleNum = (n) => {
    setAmount(prev => {
      if (prev === '0' && n !== '.') return String(n);
      if (n === '.' && prev.includes('.')) return prev;
      if (prev.replace('.', '').length >= 7) return prev;
      return prev + n;
    });
  };

  const handleBack = () => {
    setAmount(prev => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1) || '0';
    });
  };

  const numpad = [
    [1,2,3],[4,5,6],[7,8,9],['.', 0, '⌫']
  ];

  const handleSave = () => {
    if (parseFloat(amount) === 0) return;
    setSaved(true);
    setTimeout(() => { onSave && onSave({ amount: parseFloat(amount), note, category: selectedCat }); }, 600);
  };

  const cat = selectedCat ? EXPENSE_CATEGORIES.find(c => c.name === selectedCat) : null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        paddingTop: 72, paddingLeft: 24, paddingRight: 24, paddingBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onClose} style={{
          background: '#F5F5F7', border: 'none', borderRadius: 14,
          width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="#121212" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>Add Expense</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Amount Display */}
      <div style={{
        padding: '16px 24px 8px',
        textAlign: 'center',
        flex: '0 0 auto',
      }}>
        <div style={{
          background: '#F5F5F7', borderRadius: 24, padding: '24px 20px',
        }}>
          {cat && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, marginBottom: 12,
              background: cat.color + '18',
            }}>
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: cat.color }}>{cat.name}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 700, color: '#007AFF' }}>₹</span>
            <span style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: amount.length > 5 ? 44 : 64,
              fontWeight: 800, color: '#121212',
              letterSpacing: -2,
              transition: 'font-size 0.15s',
            }}>{parseFloat(amount) === 0 ? '0' : amount}</span>
          </div>
          <input
            type="text"
            placeholder="What's this for?"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6E6E73',
              textAlign: 'center', width: '100%', marginTop: 10,
            }}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div style={{ padding: '12px 16px', overflowX: 'auto', display: 'flex', gap: 8 }}>
        {EXPENSE_CATEGORIES.map(c => (
          <button key={c.name} onClick={() => setSelectedCat(c.name === selectedCat ? null : c.name)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            flexShrink: 0,
            background: selectedCat === c.name ? c.color : '#F5F5F7',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 14 }}>{c.emoji}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: selectedCat === c.name ? '#fff' : '#121212', whiteSpace: 'nowrap' }}>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Numpad */}
      <div style={{ flex: 1, padding: '8px 20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {numpad.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            {row.map((key) => (
              <button
                key={key}
                onClick={() => key === '⌫' ? handleBack() : handleNum(key)}
                style={{
                  height: 64, borderRadius: 18, border: 'none', cursor: 'pointer',
                  background: key === '⌫' ? '#F0F0F3' : '#F5F5F7',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: key === '⌫' ? 20 : 26,
                  fontWeight: 700, color: '#121212',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.1s, background 0.1s',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {key === '⌫' ? (
                  <svg width="22" height="16" viewBox="0 0 22 16">
                    <path d="M7 1h12a2 2 0 012 2v10a2 2 0 01-2 2H7l-6-7 6-7z" fill="none" stroke="#6E6E73" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M9.5 5.5l5 5M14.5 5.5l-5 5" stroke="#6E6E73" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ) : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Save FAB */}
      <div style={{ padding: '16px 20px 40px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleSave}
          style={{
            width: 64, height: 64, borderRadius: 32, border: 'none', cursor: 'pointer',
            background: saved ? '#34D399' : (parseFloat(amount) > 0 ? '#007AFF' : '#E5E5EA'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: parseFloat(amount) > 0 ? '0 8px 24px rgba(0,122,255,0.4)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            transform: saved ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {saved ? (
            <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
              <path d="M2 9l7 7L22 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4v14M4 11h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { AddExpenseScreen, EXPENSE_CATEGORIES });
