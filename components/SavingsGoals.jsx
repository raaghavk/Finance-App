// SavingsGoals.jsx — Visual savings goal tracker

const GOALS_DATA = [
  {
    id: 1, name: 'Emergency Fund', emoji: '🛡️',
    target: 300000, saved: 187000, color: '#007AFF',
    deadline: 'Dec 2026', monthly: 18000,
  },
  {
    id: 2, name: 'MacBook Pro', emoji: '💻',
    target: 200000, saved: 68000, color: '#5856D6',
    deadline: 'Aug 2026', monthly: 22000,
  },
  {
    id: 3, name: 'Goa Trip', emoji: '🏖️',
    target: 45000, saved: 31500, color: '#34D399',
    deadline: 'Jun 2026', monthly: 6750,
  },
  {
    id: 4, name: 'New Bike', emoji: '🏍️',
    target: 150000, saved: 12000, color: '#FF9500',
    deadline: 'Mar 2027', monthly: 10000,
  },
];

function SavingsGoalsScreen() {
  const [goals, setGoals] = React.useState(GOALS_DATA);
  const [selected, setSelected] = React.useState(null);
  const [addAmount, setAddAmount] = React.useState('');

  const totalSaved  = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  const addSavings = (id) => {
    const val = parseFloat(addAmount);
    if (isNaN(val) || val <= 0) return;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.min(g.saved + val, g.target) } : g));
    setAddAmount('');
    setSelected(null);
  };

  const monthsLeft = (deadline) => {
    const [mon, yr] = deadline.split(' ');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const target = new Date(parseInt(yr), months.indexOf(mon));
    const now = new Date('2026-05-01');
    return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: '4px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>May 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Goals</h1>
      </div>

      {/* ── Total summary ── */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: '#1C1C1E', borderRadius: 22, padding: '20px 22px', boxShadow: '0 4px 20px rgba(0,0,0,0.18)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Total Saved</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, marginBottom: 16 }}>₹{totalSaved.toLocaleString('en-IN')}</p>

          {/* Progress track */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 10, display: 'flex' }}>
            {goals.map(g => (
              <div key={g.id} style={{
                height: '100%',
                width: `${(g.saved / totalTarget) * 100}%`,
                background: g.color,
                transition: 'width 0.5s ease',
              }} />
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {Math.round(totalSaved / totalTarget * 100)}% of ₹{(totalTarget / 100000).toFixed(1)}L total goal
          </p>
        </div>
      </div>

      {/* ── Goal Cards ── */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.map(goal => {
          const pct = goal.saved / goal.target;
          const remaining = goal.target - goal.saved;
          const ml = monthsLeft(goal.deadline);
          const onTrack = goal.monthly * ml >= remaining;
          const isSelected = selected === goal.id;

          return (
            <div key={goal.id}
              style={{
                background: '#FFFFFF', borderRadius: 22,
                overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: isSelected ? `1.5px solid ${goal.color}` : '1.5px solid transparent',
                transition: 'border-color 0.2s',
              }}
            >
              <div
                onClick={() => setSelected(isSelected ? null : goal.id)}
                style={{ padding: '18px 18px 14px', cursor: 'pointer' }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: goal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      {goal.emoji}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#1C1C1E', marginBottom: 3 }}>{goal.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 3, background: onTrack ? '#34D399' : '#FF9500' }} />
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: onTrack ? '#34D399' : '#FF9500', fontWeight: 600 }}>
                          {onTrack ? 'On track' : 'Needs boost'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{Math.round(pct * 100)}%</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93' }}>{goal.deadline}</p>
                  </div>
                </div>

                {/* Progress ring + amounts */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  {/* Mini ring */}
                  <svg width={52} height={52} viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
                    <circle cx={26} cy={26} r={20} fill="none" stroke="#F2F2F7" strokeWidth={5} />
                    <circle cx={26} cy={26} r={20} fill="none"
                      stroke={goal.color} strokeWidth={5}
                      strokeDasharray={`${pct * 125.66} 125.66`}
                      strokeDashoffset={31.4}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.6s ease' }}
                    />
                  </svg>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', marginBottom: 2 }}>Saved</p>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: goal.color }}>₹{goal.saved.toLocaleString('en-IN')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', marginBottom: 2 }}>Remaining</p>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>₹{remaining.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {/* Bar */}
                    <div style={{ height: 5, background: '#F2F2F7', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct * 100}%`, background: goal.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>
                    +₹{goal.monthly.toLocaleString('en-IN')}/mo · {ml} months left
                  </p>
                  <div style={{ transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
                      <path d="M1 1l6 6 6-6" stroke="#C7C7CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expand: add savings */}
              {isSelected && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F2F2F7' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', fontWeight: 600, marginBottom: 10, paddingTop: 14 }}>ADD TO THIS GOAL</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1000, 5000, 10000].map(amt => (
                      <button key={amt} onClick={() => { setAddAmount(String(amt)); }} style={{
                        flex: 1, padding: '10px 0', border: `1.5px solid ${addAmount === String(amt) ? goal.color : '#F2F2F7'}`,
                        borderRadius: 12, background: addAmount === String(amt) ? goal.color + '12' : 'transparent',
                        cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700,
                        color: addAmount === String(amt) ? goal.color : '#3C3C43', transition: 'all 0.15s',
                      }}>₹{(amt / 1000).toFixed(0)}k</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={addAmount}
                      onChange={e => setAddAmount(e.target.value)}
                      style={{
                        flex: 1, padding: '12px 14px', border: '1.5px solid #F2F2F7', borderRadius: 12,
                        fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1C1C1E',
                        background: '#F9F9F9', outline: 'none',
                      }}
                    />
                    <button onClick={() => addSavings(goal.id)} style={{
                      padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: goal.color, color: '#FFFFFF',
                      fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
                    }}>Add</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* New goal */}
        <button style={{
          width: '100%', padding: '18px', border: '1.5px dashed #C7C7CC', borderRadius: 22,
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#C7C7CC" strokeWidth="1.5"/>
            <path d="M9 5v8M5 9h8" stroke="#C7C7CC" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#8E8E93' }}>New Goal</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SavingsGoalsScreen });
