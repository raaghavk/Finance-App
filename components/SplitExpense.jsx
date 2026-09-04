// SplitExpense.jsx — Split bills with friends

function SplitExpenseScreen({ onBack }) {
  const [amount, setAmount] = React.useState('2400');
  const [desc, setDesc] = React.useState('Dinner at Fatty Bao');
  const [friends, setFriends] = React.useState([
    { id: 1, name: 'Arjun',   initial: 'A', color: '#007AFF', included: true,  paid: false },
    { id: 2, name: 'Priya',   initial: 'P', color: '#FF6B6B', included: true,  paid: true  },
    { id: 3, name: 'Rohit',   initial: 'R', color: '#34D399', included: true,  paid: false },
    { id: 4, name: 'Sneha',   initial: 'S', color: '#A78BFA', included: false, paid: false },
    { id: 5, name: 'Vikram',  initial: 'V', color: '#F97316', included: false, paid: false },
  ]);
  const [splitType, setSplitType] = React.useState('equal'); // equal | custom | percentage
  const [sent, setSent] = React.useState(false);

  const included = friends.filter(f => f.included);
  const perPerson = included.length > 0 ? (parseFloat(amount) || 0) / included.length : 0;
  const youOwe = perPerson;
  const othersOwe = perPerson * (included.length - 1);

  const toggle = (id) => setFriends(prev => prev.map(f => f.id === id ? { ...f, included: !f.included } : f));
  const markPaid = (id) => setFriends(prev => prev.map(f => f.id === id ? { ...f, paid: !f.paid } : f));

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>May 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Split</h1>
      </div>

      {/* Amount + desc */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Total Bill</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#007AFF' }}>₹</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Manrope, sans-serif', fontSize: 48, fontWeight: 800, color: '#1C1C1E',
              width: '100%', letterSpacing: -1,
            }} />
          </div>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this for?" style={{
            width: '100%', border: 'none', borderTop: '1px solid #F2F2F7', outline: 'none', background: 'transparent',
            fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1C1C1E', paddingTop: 14,
          }} />
        </div>
      </div>

      {/* Split type */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ display: 'flex', background: 'rgba(120,120,128,0.12)', borderRadius: 14, padding: 3 }}>
          {[['equal','Equal'],['custom','Custom'],['percentage','%']].map(([val, label]) => (
            <button key={val} onClick={() => setSplitType(val)} style={{
              flex: 1, padding: '9px 0', border: 'none', cursor: 'pointer', borderRadius: 11,
              background: splitType === val ? '#FFFFFF' : 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
              color: splitType === val ? '#1C1C1E' : '#8E8E93',
              boxShadow: splitType === val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Friends */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Split With</p>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {friends.map((f, i) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < friends.length - 1 ? '1px solid #F2F2F7' : 'none', opacity: f.included ? 1 : 0.5, transition: 'opacity 0.2s' }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>{f.initial}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{f.name}</p>
                {f.included && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: f.paid ? '#34D399' : '#8E8E93', fontWeight: f.paid ? 600 : 400 }}>{f.paid ? '✓ Paid' : `Owes ${fmt(perPerson)}`}</p>}
              </div>
              {f.included && (
                <button onClick={() => markPaid(f.id)} style={{
                  background: f.paid ? '#EDFDF5' : '#F2F2F7', border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: f.paid ? '#34D399' : '#8E8E93',
                  marginRight: 8,
                }}>{f.paid ? 'Paid' : 'Mark paid'}</button>
              )}
              <div onClick={() => toggle(f.id)} style={{
                width: 24, height: 24, borderRadius: 12, border: `2px solid ${f.included ? '#007AFF' : '#E5E5EA'}`,
                background: f.included ? '#007AFF' : 'transparent', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}>
                {f.included && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#007AFF', borderRadius: 22, padding: '18px 20px', boxShadow: '0 8px 24px rgba(0,122,255,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Your share</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>{fmt(youOwe)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Others owe</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: -0.5 }}>{fmt(othersOwe)}</p>
            </div>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{included.length} people · {fmt(perPerson)} each</p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <button onClick={() => setSent(true)} style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: 18, cursor: 'pointer',
          background: sent ? '#34D399' : '#1C1C1E', color: '#FFFFFF',
          fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700,
          transition: 'background 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {sent ? '✓ Requests Sent!' : '📲 Send Requests via UPI'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SplitExpenseScreen });
