// TravelExtras.jsx — Trip setup, history, recap, emergency assist (Zenith tokens)

function travelChrome() {
  const Z = typeof ZENITH !== 'undefined' ? ZENITH : {};
  return {
    page: Z.page || '#F2F5FA',
    ink: Z.ink || '#0F172A',
    muted: Z.muted || '#64748B',
    accent: Z.accent || '#2563EB',
    card: Z.card || '#FFFFFF',
    cream: Z.cream || '#E8EEF7',
    hairline: Z.hairline || 'rgba(15,23,42,0.08)',
    shadow: typeof zenithSoftShadow === 'function' ? zenithSoftShadow() : '0 2px 14px rgba(15,23,42,0.06)',
    hero: typeof zenithHeroGradient === 'function' ? zenithHeroGradient() : 'linear-gradient(145deg, #2563EB, #1D4ED8)',
    heroShadow: typeof zenithHeroShadow === 'function' ? zenithHeroShadow() : '0 12px 40px rgba(29,78,216,0.28)',
  };
}

function TravelBack({ onBack, label }) {
  const { accent } = travelChrome();
  return (
    <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: accent, fontWeight: 500 }}>{label || 'Back'}</span>
    </button>
  );
}

function TripSetupScreen({ tripName, setTripName, startDate, setStartDate, endDate, setEndDate, budget, setBudget, onBack, onNext }) {
  const { page, ink, muted, accent, card, cream, shadow } = travelChrome();
  const valid = tripName.trim().length > 0 && budget && parseFloat(budget) > 0;
  return (
    <div style={{ height: '100%', background: page, display: 'flex', flexDirection: 'column', paddingTop: 'var(--zenith-pad-top)' }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <TravelBack onBack={onBack} />
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 4 }}>Trip details</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>Give your trip a name and set a budget</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Trip name</p>
        <div style={{ background: card, borderRadius: 16, padding: '4px 16px', marginBottom: 20, boxShadow: shadow }}>
          <input
            type="text" placeholder="e.g. Bangkok 2026" value={tripName} onChange={(e) => setTripName(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', padding: '13px 0', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: ink }}
          />
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Dates</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: card, borderRadius: 16, padding: '13px 16px', boxShadow: shadow }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, fontWeight: 600 }}>Start</p>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink, width: '100%' }} />
          </div>
          <div style={{ flex: 1, background: card, borderRadius: 16, padding: '13px 16px', boxShadow: shadow }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, fontWeight: 600 }}>End</p>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink, width: '100%' }} />
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Trip budget (₹)</p>
        <div style={{ background: card, borderRadius: 18, padding: '20px', marginBottom: 20, textAlign: 'center', boxShadow: shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: accent }}>₹</span>
            <input
              type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: ink, width: 200, textAlign: 'center' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[25000, 50000, 100000].map((v) => (
            <button key={v} type="button" onClick={() => setBudget(String(v))} style={{ background: card, border: 'none', borderRadius: 12, padding: '10px 4px', cursor: 'pointer', boxShadow: shadow, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: ink }}>₹{(v / 1000)}k</button>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>

      <div style={{ padding: '12px 20px var(--zenith-pad-bottom)', flexShrink: 0, background: page, borderTop: '0.5px solid ' + cream }}>
        <button type="button" onClick={() => valid && onNext()} style={{
          width: '100%', padding: '17px', border: 'none', borderRadius: 18, cursor: valid ? 'pointer' : 'default',
          background: valid ? accent : cream, color: valid ? '#FFFFFF' : muted,
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700,
          boxShadow: valid ? '0 8px 24px rgba(37,99,235,0.35)' : 'none',
        }}>Choose Destination →</button>
      </div>
    </div>
  );
}

function TripHistoryScreen({ trips, onBack, onSelect }) {
  const { page, ink, muted, card, cream, shadow } = travelChrome();
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: page, display: 'flex', flexDirection: 'column', paddingTop: 'var(--zenith-pad-top)' }}>
      <div style={{ padding: '4px 20px 16px', flexShrink: 0 }}>
        <TravelBack onBack={onBack} />
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: ink, letterSpacing: -0.5 }}>Trip History</h1>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px var(--zenith-pad-bottom)' }}>
        {(trips || []).map((t) => (
          <button key={t.id} type="button" onClick={() => onSelect(t)} style={{ width: '100%', textAlign: 'left', background: card, border: 'none', borderRadius: 22, padding: '18px 20px', marginBottom: 12, cursor: 'pointer', boxShadow: shadow }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 26 }}>{t.flag}</span>
                <div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink }}>{t.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted }}>{t.dates} · {t.country}</p>
                </div>
              </div>
              <div style={{ background: t.overBudget ? '#FEF2F2' : '#ECFDF5', borderRadius: 10, padding: '4px 10px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: t.overBudget ? '#DC2626' : '#059669' }}>{t.overBudget ? 'Over' : 'On Track'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Total Spent</p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: ink }}>₹{(t.spentINR || 0).toLocaleString('en-IN')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>Budget</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: muted }}>₹{(t.budgetINR || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div style={{ height: 4, background: cream, borderRadius: 2, marginTop: 10 }}>
              <div style={{ height: '100%', width: Math.min((t.spentINR || 0) / Math.max(t.budgetINR || 1, 1), 1) * 100 + '%', borderRadius: 2, background: t.overBudget ? '#F87171' : 'linear-gradient(90deg,#2563EB,#34D399)' }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TripSummaryScreen({ trip, onDone }) {
  const { page, ink, muted, accent, card, cream, shadow, hero, heroShadow } = travelChrome();
  const entries = Object.entries(trip.byCategory || {}).filter(([, amt]) => Number(amt) > 0);
  const topCat = (entries.slice().sort((a, b) => b[1] - a[1])[0]) || ['—', 0];
  const pctOfBudget = trip.budgetINR > 0 ? Math.round((trip.spentINR / trip.budgetINR) * 100) : 0;
  const CAT_COLORS = (typeof TRAVEL_CAT_COLORS !== 'undefined' && TRAVEL_CAT_COLORS) || { Food: '#F97316', Transport: '#3B82F6', Stay: '#8B5CF6', Shopping: '#EC4899', Groceries: '#10B981', Other: '#64748B' };
  const foreignTotal = Math.max(Number(trip.spentForeign) || 0, entries.reduce((s, [, amt]) => s + Number(amt), 0), 1);
  return (
    <div style={{ height: '100%', background: page, overflowY: 'auto', paddingTop: 'var(--zenith-pad-top)', paddingBottom: 'var(--zenith-pad-bottom)' }}>
      <div style={{ padding: '4px 20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>{trip.flag}</div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 4 }}>Trip Complete</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>{trip.name} · {trip.dates}</p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ background: hero, borderRadius: 26, padding: '26px 24px', marginBottom: 16, boxShadow: heroShadow }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Total Spent</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, marginBottom: 4 }}>₹{(trip.spentINR || 0).toLocaleString('en-IN')}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{trip.spentForeign} {trip.code} · {pctOfBudget}% of budget</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: card, borderRadius: 18, padding: '16px', boxShadow: shadow }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Avg / day</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: ink }}>₹{Math.round((trip.spentINR || 0) / Math.max(trip.days || 1, 1)).toLocaleString('en-IN')}</p>
          </div>
          <div style={{ background: card, borderRadius: 18, padding: '16px', boxShadow: shadow }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Top Category</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: CAT_COLORS[topCat[0]] || ink }}>{topCat[0]}</p>
          </div>
        </div>

        {entries.length > 0 && (
          <div style={{ background: card, borderRadius: 20, padding: '16px 18px', marginBottom: 20, boxShadow: shadow }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink, marginBottom: 14 }}>Spend by Category</p>
            {entries.map(([cat, amt]) => {
              const pct = Math.max(0.08, Number(amt) / foreignTotal);
              return (
                <div key={cat} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: muted }}>{cat}</span>
                    <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 700, color: ink }}>{trip.code} {Number(amt).toFixed(0)}</span>
                  </div>
                  <div style={{ height: 6, background: cream, borderRadius: 3 }}>
                    <div style={{ height: '100%', width: (pct * 100) + '%', background: CAT_COLORS[cat] || accent, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button type="button" onClick={onDone} style={{ width: '100%', padding: '17px', border: 'none', borderRadius: 18, cursor: 'pointer', background: accent, color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}>Save to History</button>
      </div>
    </div>
  );
}

function EmergencyScreen({ country, onBack }) {
  const { page, ink, muted, accent, card, cream, shadow } = travelChrome();
  const contacts = [
    { label: 'Local emergency', num: '112', icon: '🚨' },
    { label: 'Indian embassy', num: country ? 'mea.gov.in · ' + country.name : 'mea.gov.in', icon: '🏛️' },
    { label: 'Your bank', num: 'Use the number on the back of your card', icon: '💳' },
    { label: 'Travel insurance', num: 'Keep the policy PDF in Files', icon: '📄' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: page, display: 'flex', flexDirection: 'column', paddingTop: 'var(--zenith-pad-top)' }}>
      <div style={{ padding: '4px 20px 16px', flexShrink: 0 }}>
        <TravelBack onBack={onBack} />
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 4 }}>Emergency Assist</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>{country ? 'While in ' + country.name : 'Help when you need it'}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px var(--zenith-pad-bottom)' }}>
        <div style={{ background: '#FEF2F2', borderRadius: 20, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🆘</span>
          <div>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: ink, marginBottom: 2 }}>Pro includes this sheet on every trip</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted }}>Zenith does not freeze cards. Call your bank.</p>
          </div>
        </div>
        <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: shadow }}>
          {contacts.map((c, i) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < contacts.length - 1 ? '1px solid ' + cream : 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink, marginBottom: 2 }}>{c.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted }}>{c.num}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TripSetupScreen, TripHistoryScreen, TripSummaryScreen, EmergencyScreen });
