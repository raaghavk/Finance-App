// TravelExtras.jsx — Trip setup, trip history, trip summary/recap, emergency assistance

function TripSetupScreen({ tripName, setTripName, startDate, setStartDate, endDate, setEndDate, budget, setBudget, onBack, onNext }) {
  const valid = tripName.trim().length > 0 && budget && parseFloat(budget) > 0;
  return (
    <div style={{ height: '100%', background: '#F2F2F7', display: 'flex', flexDirection: 'column', paddingTop: 70 }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>Back</span>
        </button>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 4 }}>Trip details</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>Give your trip a name and set a budget</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Trip name</p>
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '4px 16px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <input
            type="text" placeholder="e.g. Swiss Alps 2026" value={tripName} onChange={e => setTripName(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', padding: '13px 0', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}
          />
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Dates</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, fontWeight: 600 }}>Start</p>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', width: '100%' }} />
          </div>
          <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '13px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, fontWeight: 600 }}>End</p>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', width: '100%' }} />
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Trip budget (₹)</p>
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '20px', marginBottom: 20, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#007AFF' }}>₹</span>
            <input
              type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="280000"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#1C1C1E', width: 200, textAlign: 'center' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[150000, 280000, 500000].map(v => (
            <button key={v} onClick={() => setBudget(String(v))} style={{ background: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 4px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#3C3C43' }}>₹{(v/1000)}k</button>
          ))}
        </div>
        <div style={{ height: 100 }} />
      </div>

      <div style={{ padding: '12px 20px 24px', flexShrink: 0, background: 'rgba(242,242,247,0.95)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => valid && onNext()} style={{
          width: '100%', padding: '17px', border: 'none', borderRadius: 18, cursor: valid ? 'pointer' : 'default',
          background: valid ? '#007AFF' : '#E5E5EA', color: valid ? '#FFFFFF' : '#AAAAAA',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700,
          boxShadow: valid ? '0 8px 24px rgba(0,122,255,0.35)' : 'none', transition: 'all 0.2s',
        }}>Choose Destination →</button>
      </div>
    </div>
  );
}

function TripHistoryScreen({ trips, onBack, onSelect }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: '#F2F2F7', display: 'flex', flexDirection: 'column', paddingTop: 70 }}>
      <div style={{ padding: '4px 20px 16px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>Back</span>
        </button>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Trip History</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        {trips.map(t => (
          <button key={t.id} onClick={() => onSelect(t)} style={{ width: '100%', textAlign: 'left', background: '#FFFFFF', border: 'none', borderRadius: 22, padding: '18px 20px', marginBottom: 12, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{t.flag}</span>
                <div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>{t.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{t.dates} · {t.country}</p>
                </div>
              </div>
              <div style={{ background: t.overBudget ? '#FFF0F0' : '#EDFDF5', borderRadius: 10, padding: '4px 10px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: t.overBudget ? '#FF3B30' : '#34D399' }}>{t.overBudget ? 'Over' : 'On Track'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Total Spent</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>₹{t.spentINR.toLocaleString('en-IN')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Budget</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#8E8E93' }}>₹{t.budgetINR.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2, marginTop: 10 }}>
              <div style={{ height: '100%', width: `${Math.min(t.spentINR / t.budgetINR, 1) * 100}%`, borderRadius: 2, background: t.overBudget ? '#FF6B6B' : 'linear-gradient(90deg,#007AFF,#34D399)' }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TripSummaryScreen({ trip, onDone }) {
  const topCat = Object.entries(trip.byCategory).sort((a,b) => b[1]-a[1])[0];
  const pctOfBudget = trip.pctOfBudget ?? Math.round((trip.spentINR / trip.budgetINR) * 100);
  const CAT_COLORS = { Food:'#FF6B6B', Transport:'#60A5FA', Stay:'#A78BFA', Shopping:'#EC4899', Groceries:'#34D399', Other:'#6E6E73' };
  return (
    <div style={{ height: '100%', background: '#F2F2F7', overflowY: 'auto', paddingTop: 70, paddingBottom: 40 }}>
      <div style={{ padding: '4px 20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>{trip.flag}</div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 4 }}>Trip Complete</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>{trip.name} · {trip.dates}</p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ background: 'linear-gradient(145deg, #1C1C2E 0%, #0D1117 100%)', borderRadius: 26, padding: '26px 24px', marginBottom: 16, boxShadow: '0 12px 36px rgba(0,0,0,0.24)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,122,255,0.07)' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Total Spent</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, marginBottom: 4 }}>₹{trip.spentINR.toLocaleString('en-IN')}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{trip.spentForeign} {trip.code} across {trip.days} days · {pctOfBudget}% of budget</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Avg / day</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1C1C1E' }}>₹{Math.round(trip.spentINR/trip.days).toLocaleString('en-IN')}</p>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Top Category</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: CAT_COLORS[topCat[0]] || '#1C1C1E' }}>{topCat[0]}</p>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px 18px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 14 }}>Spend by Category</p>
          {Object.entries(trip.byCategory).map(([cat, amt]) => {
            const pct = amt / trip.spentForeign;
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#3C3C43' }}>{cat}</span>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 700, color: '#1C1C1E' }}>{trip.code} {amt.toFixed(0)}</span>
                </div>
                <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${pct*100}%`, background: CAT_COLORS[cat] || '#8E8E93', borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onDone} style={{ width: '100%', padding: '17px', border: 'none', borderRadius: 18, cursor: 'pointer', background: '#007AFF', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,122,255,0.35)' }}>Save to History</button>
      </div>
    </div>
  );
}

function EmergencyScreen({ country, onBack }) {
  const contacts = [
    { label: 'Local Emergency', num: '112', icon: '🚨' },
    { label: 'Indian Embassy', num: '+41 31 350 3000', icon: '🏛️' },
    { label: 'Zenith Card Lock', num: 'In-app instant lock', icon: '🔒', action: true },
    { label: 'Travel Insurance', num: 'Policy #ZN-88213', icon: '📄' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: '#F2F2F7', display: 'flex', flexDirection: 'column', paddingTop: 70 }}>
      <div style={{ padding: '4px 20px 16px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>Back</span>
        </button>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 4 }}>Emergency Assist</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>{country ? `While in ${country.name}` : 'Help when you need it'}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px' }}>
        <div style={{ background: '#FFF0F0', borderRadius: 20, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🆘</span>
          <div>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>Lost your card?</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>Freeze it instantly, no call needed</p>
          </div>
        </div>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {contacts.map((c, i) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < contacts.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{c.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{c.num}</p>
              </div>
              {c.action ? (
                <button style={{ background: '#FFF0F0', border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#FF3B30' }}>Lock</button>
              ) : (
                <button style={{ background: '#F0F7FF', border: 'none', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#007AFF' }}>Call</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TripSetupScreen, TripHistoryScreen, TripSummaryScreen, EmergencyScreen });
