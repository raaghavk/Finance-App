// TravelMode.jsx — Live travel mode: activate, track, convert, per-trip ledger

function CountryPickerScreen({ countries, selectedCountry, onSelect, onBack, onConfirm }) {
  const [search, setSearch] = React.useState('');
  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ height: '100%', background: '#F2F2F7', display: 'flex', flexDirection: 'column', paddingTop: 70 }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>Back</span>
        </button>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 14 }}>Where are you going?</h1>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', borderRadius: 14, padding: '11px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="#C7C7CC" strokeWidth="1.6"/>
            <path d="M10 10l4 4" stroke="#C7C7CC" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="Search country or currency..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1C1C1E' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: '#C7C7CC', border: 'none', borderRadius: 10, width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>No countries found</p>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {filtered.map((c, i) => (
              <div key={c.code} onClick={() => onSelect(c.code)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer',
                borderBottom: i < filtered.length - 1 ? '1px solid #F2F2F7' : 'none',
                background: selectedCountry === c.code ? '#F0F7FF' : '#FFFFFF',
                transition: 'background 0.12s',
              }}>
                <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 1 }}>{c.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{c.code} · 1 {c.code} = ₹{c.rate}</p>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${selectedCountry === c.code ? '#007AFF' : '#E5E5EA'}`, background: selectedCountry === c.code ? '#007AFF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                  {selectedCountry === c.code && <div style={{ width: 8, height: 8, borderRadius: 4, background: '#FFFFFF' }} />}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 100 }} />
      </div>

      <div style={{ padding: '12px 20px 24px', flexShrink: 0, background: 'rgba(242,242,247,0.95)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
        <button onClick={onConfirm} style={{
          width: '100%', padding: '17px', border: 'none', borderRadius: 18,
          cursor: selectedCountry ? 'pointer' : 'default',
          background: selectedCountry ? '#007AFF' : '#E5E5EA',
          color: selectedCountry ? '#FFFFFF' : '#AAAAAA',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700,
          boxShadow: selectedCountry ? '0 8px 24px rgba(0,122,255,0.35)' : 'none',
          transition: 'all 0.2s',
        }}>Activate Travel Mode →</button>
      </div>
    </div>
  );
}

function TravelScreen() {
  const [travelActive, setTravelActive] = React.useState(false);
  const [activatingStep, setActivatingStep] = React.useState(0); // 0=off,1=setup,2=country,3=live
  // reset when screen becomes active again from off
  React.useEffect(() => { if (!travelActive) setActivatingStep(0); }, [travelActive]);
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('dashboard'); // dashboard | expenses | convert
  const [convertAmount, setConvertAmount] = React.useState('1000');
  const [convertDir, setConvertDir] = React.useState('home_to_foreign'); // home_to_foreign | foreign_to_home

  const [tripName, setTripName] = React.useState('');
  const [startDate, setStartDate] = React.useState('2026-05-14');
  const [endDate, setEndDate] = React.useState('2026-05-22');
  const [tripBudgetINR, setTripBudgetINR] = React.useState('280000');
  const [showHistory, setShowHistory] = React.useState(false);
  const [showSOS, setShowSOS] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);
  const [summaryTrip, setSummaryTrip] = React.useState(null);
  const [historyDetail, setHistoryDetail] = React.useState(null);
  const [pastTrips, setPastTrips] = React.useState([
    { id: 1, name: 'Bangkok Getaway', flag: '🇹🇭', country: 'Thailand', code: 'THB', dates: 'Feb 3 – Feb 9', days: 6, spentINR: 68400, budgetINR: 90000, spentForeign: 2145, overBudget: false, byCategory: { Food: 620, Stay: 890, Transport: 310, Shopping: 325 } },
    { id: 2, name: 'Dubai Weekend', flag: '🇦🇪', country: 'UAE', code: 'AED', dates: 'Dec 18 – Dec 21', days: 3, spentINR: 112300, budgetINR: 100000, spentForeign: 4945, overBudget: true, byCategory: { Stay: 2100, Food: 980, Shopping: 1500, Transport: 365 } },
    { id: 3, name: 'Tokyo Spring', flag: '🇯🇵', country: 'Japan', code: 'JPY', dates: 'Mar 21 – Mar 29', days: 8, spentINR: 156800, budgetINR: 180000, spentForeign: 280000, overBudget: false, byCategory: { Food: 92000, Stay: 120000, Transport: 41000, Shopping: 27000 } },
  ]);

  const COUNTRIES = [
    { name: 'Afghanistan', flag: '🇦🇫', code: 'AFN', symbol: '؋', rate: 1.13 },
    { name: 'Australia', flag: '🇦🇺', code: 'AUD', symbol: 'A$', rate: 54.32 },
    { name: 'Bahrain', flag: '🇧🇭', code: 'BHD', symbol: 'BD', rate: 221.45 },
    { name: 'Bangladesh', flag: '🇧🇩', code: 'BDT', symbol: '৳', rate: 0.76 },
    { name: 'Brazil', flag: '🇧🇷', code: 'BRL', symbol: 'R$', rate: 16.52 },
    { name: 'Canada', flag: '🇨🇦', code: 'CAD', symbol: 'C$', rate: 61.34 },
    { name: 'China', flag: '🇨🇳', code: 'CNY', symbol: '¥', rate: 11.52 },
    { name: 'Denmark', flag: '🇩🇰', code: 'DKK', symbol: 'kr', rate: 12.03 },
    { name: 'Egypt', flag: '🇪🇬', code: 'EGP', symbol: '£', rate: 1.73 },
    { name: 'Europe', flag: '🇪🇺', code: 'EUR', symbol: '€', rate: 89.54 },
    { name: 'Hong Kong', flag: '🇭🇰', code: 'HKD', symbol: 'HK$', rate: 10.69 },
    { name: 'Indonesia', flag: '🇮🇩', code: 'IDR', symbol: 'Rp', rate: 0.0051 },
    { name: 'Israel', flag: '🇮🇱', code: 'ILS', symbol: '₪', rate: 22.87 },
    { name: 'Japan', flag: '🇯🇵', code: 'JPY', symbol: '¥', rate: 0.56 },
    { name: 'Jordan', flag: '🇯🇴', code: 'JOD', symbol: 'JD', rate: 117.64 },
    { name: 'Kenya', flag: '🇰🇪', code: 'KES', symbol: 'KSh', rate: 0.64 },
    { name: 'Kuwait', flag: '🇰🇼', code: 'KWD', symbol: 'KD', rate: 272.18 },
    { name: 'Malaysia', flag: '🇲🇾', code: 'MYR', symbol: 'RM', rate: 18.92 },
    { name: 'Maldives', flag: '🇲🇻', code: 'MVR', symbol: 'Rf', rate: 6.48 },
    { name: 'Mexico', flag: '🇲🇽', code: 'MXN', symbol: '$', rate: 4.22 },
    { name: 'Nepal', flag: '🇳🇵', code: 'NPR', symbol: '₨', rate: 0.62 },
    { name: 'New Zealand', flag: '🇳🇿', code: 'NZD', symbol: 'NZ$', rate: 49.87 },
    { name: 'Norway', flag: '🇳🇴', code: 'NOK', symbol: 'kr', rate: 7.94 },
    { name: 'Oman', flag: '🇴🇲', code: 'OMR', symbol: 'ر.ع.', rate: 216.89 },
    { name: 'Pakistan', flag: '🇵🇰', code: 'PKR', symbol: '₨', rate: 0.30 },
    { name: 'Philippines', flag: '🇵🇭', code: 'PHP', symbol: '₱', rate: 1.48 },
    { name: 'Qatar', flag: '🇶🇦', code: 'QAR', symbol: 'ر.ق', rate: 22.92 },
    { name: 'Russia', flag: '🇷🇺', code: 'RUB', symbol: '₽', rate: 0.97 },
    { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SAR', symbol: 'ر.س', rate: 22.25 },
    { name: 'Singapore', flag: '🇸🇬', code: 'SGD', symbol: 'S$', rate: 62.18 },
    { name: 'South Africa', flag: '🇿🇦', code: 'ZAR', symbol: 'R', rate: 4.56 },
    { name: 'South Korea', flag: '🇰🇷', code: 'KRW', symbol: '₩', rate: 0.061 },
    { name: 'Sri Lanka', flag: '🇱🇰', code: 'LKR', symbol: '₨', rate: 0.28 },
    { name: 'Sweden', flag: '🇸🇪', code: 'SEK', symbol: 'kr', rate: 8.12 },
    { name: 'Switzerland', flag: '🇨🇭', code: 'CHF', symbol: 'CHF', rate: 93.28 },
    { name: 'Taiwan', flag: '🇹🇼', code: 'TWD', symbol: 'NT$', rate: 2.59 },
    { name: 'Thailand', flag: '🇹🇭', code: 'THB', symbol: '฿', rate: 2.32 },
    { name: 'Turkey', flag: '🇹🇷', code: 'TRY', symbol: '₺', rate: 2.46 },
    { name: 'UAE', flag: '🇦🇪', code: 'AED', symbol: 'د.إ', rate: 22.71 },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'GBP', symbol: '£', rate: 104.72 },
    { name: 'United States', flag: '🇺🇸', code: 'USD', symbol: '$', rate: 83.45 },
    { name: 'Vietnam', flag: '🇻🇳', code: 'VND', symbol: '₫', rate: 0.0033 },
  ];

  const country = selectedCountry ? COUNTRIES.find(c => c.code === selectedCountry) : null;

  const [expenses, setExpenses] = React.useState([
    { id: 1, merchant: 'Airport Hotel',   cat: 'Stay',      amount: 189,  inr: 17629, date: 'Today'     },
    { id: 2, merchant: 'Fondue Stübli',   cat: 'Food',      amount: 68.5, inr: 6390,  date: 'Today'     },
    { id: 3, merchant: 'Swiss Rail Pass', cat: 'Transport', amount: 220,  inr: 20522, date: 'Yesterday' },
    { id: 4, merchant: 'Lindt Shop',      cat: 'Shopping',  amount: 84,   inr: 7836,  date: 'Yesterday' },
    { id: 5, merchant: 'Migros',          cat: 'Groceries', amount: 42.5, inr: 3964,  date: 'Apr 16'    },
  ]);

  const totalForeign = expenses.reduce((s, e) => s + e.amount, 0);
  const totalINR     = expenses.reduce((s, e) => s + e.inr, 0);
  const tripBudget   = { foreign: 3000, inr: 280000 };
  const budgetPct    = totalForeign / tripBudget.foreign;
  const daysLeft     = 8;

  const CATS = ['Food','Transport','Stay','Shopping','Groceries','Other'];
  const CAT_COLORS = { Food:'#FF6B6B', Transport:'#60A5FA', Stay:'#A78BFA', Shopping:'#EC4899', Groceries:'#34D399', Other:'#6E6E73' };

  const convertedAmount = () => {
    if (!country) return 0;
    const n = parseFloat(convertAmount) || 0;
    return convertDir === 'home_to_foreign'
      ? (n / country.rate).toFixed(2)
      : (n * country.rate).toFixed(0);
  };

  // ── TRIP SUMMARY (post-trip recap) ──
  if (showSummary && summaryTrip) {
    return (
      <TripSummaryScreen trip={summaryTrip} onDone={() => {
        setPastTrips(p => [summaryTrip, ...p]);
        setShowSummary(false); setSummaryTrip(null);
        setTravelActive(false); setActivatingStep(0); setSelectedCountry(null);
        setTripName(''); setExpenses([]);
      }} />
    );
  }

  // ── OFF STATE ──
  if (!travelActive) {
    return (
      <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
        <div style={{ padding: '4px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>May 2026</p>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Travel</h1>
          </div>
          {pastTrips.length > 0 && (
            <button onClick={() => setShowHistory(true)} style={{ background: '#FFFFFF', border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#007AFF', marginTop: 20 }}>History</button>
          )}
        </div>

        {/* Hero card */}
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            background: 'linear-gradient(145deg, #1C1C2E 0%, #0D1117 100%)',
            borderRadius: 28, padding: '32px 28px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
          }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,122,255,0.07)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 10 }}>
                Heading somewhere?
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
                Activate Travel Mode to track spending in local currency, get live rates, and keep your home budget separate.
              </p>
              <button
                onClick={() => { setTravelActive(true); setActivatingStep(1); setTripName(''); }}
                style={{
                  background: '#007AFF', border: 'none', borderRadius: 16,
                  padding: '16px 28px', cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF',
                  boxShadow: '0 8px 28px rgba(0,122,255,0.45)',
                }}
              >Start a Trip →</button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ padding: '0 20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 }}>What you get</p>
          <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {[
              { icon: '💱', title: 'Live exchange rates', sub: 'Real-time INR conversion for 150+ currencies' },
              { icon: '📊', title: 'Separate trip budget', sub: 'Your home budget stays untouched' },
              { icon: '🧾', title: 'Per-trip ledger', sub: 'Full expense history for every trip' },
              { icon: '📍', title: 'Auto-detect country', sub: 'Switch currency when you land' },
            ].map((f, i, arr) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < arr.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{f.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showHistory && (
        <TripHistoryScreen trips={pastTrips} onBack={() => { setShowHistory(false); setHistoryDetail(null); }} onSelect={t => setHistoryDetail(t)} />
      )}
      {historyDetail && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
          <TripSummaryScreen trip={historyDetail} onDone={() => setHistoryDetail(null)} />
        </div>
      )}
      </div>
    );
  }

  // ── SETUP: Trip Details ──
  if (activatingStep === 1) {
    return (
      <TripSetupScreen
        tripName={tripName} setTripName={setTripName}
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        budget={tripBudgetINR} setBudget={setTripBudgetINR}
        onBack={() => { setTravelActive(false); }}
        onNext={() => setActivatingStep(2)}
      />
    );
  }

  // ── SETUP: Country Selection ──
  if (activatingStep === 2) {
    return (
      <CountryPickerScreen
        countries={COUNTRIES}
        selectedCountry={selectedCountry}
        onSelect={setSelectedCountry}
        onBack={() => setActivatingStep(1)}
        onConfirm={() => { if (selectedCountry) setActivatingStep(3); }}
      />
    );
  }

  // ── LIVE TRAVEL MODE ──
  const TabBar = () => (
    <div style={{ display: 'flex', background: 'rgba(120,120,128,0.12)', borderRadius: 12, padding: 3, margin: '0 20px 16px' }}>
      {[['dashboard','Dashboard'],['expenses','Expenses'],['convert','Convert']].map(([val, label]) => (
        <button key={val} onClick={() => setActiveTab(val)} style={{
          flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', borderRadius: 10,
          fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
          background: activeTab === val ? '#FFFFFF' : 'transparent',
          color: activeTab === val ? '#1C1C1E' : '#8E8E93',
          boxShadow: activeTab === val ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.2s',
        }}>{label}</button>
      ))}
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7', position: 'relative' }}>
      {/* Header */}
      <div style={{ paddingTop: 70, padding: '70px 20px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{country.flag}</span>
              <div style={{ background: '#007AFF', borderRadius: 8, padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: 3, background: 'white' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>TRAVEL MODE</span>
              </div>
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{country.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowSOS(true)} style={{
              background: '#FFFFFF', border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>🆘</button>
            <button onClick={() => {
              const days = daysLeft;
              const byCategory = expenses.reduce((acc, e) => { acc[e.cat] = (acc[e.cat]||0) + e.amount; return acc; }, {});
              setSummaryTrip({
                id: Date.now(), name: tripName || `${country.name} Trip`, flag: country.flag, country: country.name, code: country.code,
                dates: `${startDate} – ${endDate}`, days: 8, spentINR: totalINR, budgetINR: parseFloat(tripBudgetINR) || tripBudget.inr,
                spentForeign: totalForeign, overBudget: totalINR > (parseFloat(tripBudgetINR) || tripBudget.inr), pctOfBudget: Math.round(budgetPct*100), byCategory,
              });
              setShowSummary(true);
            }} style={{
              background: '#FFFFFF', border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#FF3B30',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>End Trip</button>
          </div>
        </div>
      </div>
      {showSOS && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 25 }}>
          <EmergencyScreen country={country} onBack={() => setShowSOS(false)} />
        </div>
      )}

      <TabBar />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '0 20px' }}>
            {/* Balance card */}
            <div style={{
              background: 'linear-gradient(145deg, #1C1C2E 0%, #0D1117 100%)',
              borderRadius: 24, padding: '22px 22px', marginBottom: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(0,122,255,0.07)' }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Trip Spent</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{country.code}</span>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 44, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, lineHeight: 1 }}>{totalForeign.toFixed(2)}</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>≈ ₹{totalINR.toLocaleString('en-IN')}</p>

              {/* Budget bar */}
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${Math.min(budgetPct, 1) * 100}%`, borderRadius: 2, background: budgetPct > 0.8 ? '#FF6B6B' : 'linear-gradient(90deg,#007AFF,#34D399)', transition: 'width 0.6s ease' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Daily Left</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#007AFF' }}>{country.code} {((tripBudget.foreign - totalForeign) / daysLeft).toFixed(0)}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Days Left</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>{daysLeft}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>Budget</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>{country.code} {tripBudget.foreign}</p>
                </div>
              </div>
            </div>

            {/* Rate pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', borderRadius: 16, padding: '12px 16px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: 20 }}>{country.flag}</span>
              <span style={{ fontSize: 20 }}>🇮🇳</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>1 {country.code} = ₹{country.rate}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>Rate updated just now</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EDFDF5', borderRadius: 10, padding: '4px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: '#34D399' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#34D399' }}>Live</span>
              </div>
            </div>

            {/* Category mini breakdown */}
            <div style={{ background: '#FFFFFF', borderRadius: 20, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 14 }}>By Category</p>
              {Object.entries(
                expenses.reduce((acc, e) => { acc[e.cat] = (acc[e.cat] || 0) + e.amount; return acc; }, {})
              ).map(([cat, amt]) => {
                const pct = amt / totalForeign;
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: '#3C3C43' }}>{cat}</span>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 700, color: '#1C1C1E' }}>{country.code} {amt.toFixed(2)}</span>
                    </div>
                    <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct * 100}%`, background: CAT_COLORS[cat] || '#8E8E93', borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── EXPENSES TAB ── */}
        {activeTab === 'expenses' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>Trip Expenses</p>
              <div style={{ background: '#F0F7FF', borderRadius: 10, padding: '5px 10px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#007AFF' }}>{expenses.length} items</span>
              </div>
            </div>
            {Object.entries(
              expenses.reduce((acc, e) => { const d = e.date; if (!acc[d]) acc[d] = []; acc[d].push(e); return acc; }, {})
            ).map(([date, exps]) => (
              <div key={date} style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>{date}</p>
                <div style={{ background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  {exps.map((exp, i) => (
                    <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < exps.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 13, background: (CAT_COLORS[exp.cat] || '#8E8E93') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 800, color: CAT_COLORS[exp.cat] || '#8E8E93' }}>
                          {exp.merchant.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{exp.merchant}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{exp.cat}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{country.code} {exp.amount}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>₹{exp.inr.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONVERTER TAB ── */}
        {activeTab === 'convert' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 18 }}>Currency Converter</p>

              {/* Direction toggle */}
              <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: 14, padding: 3, marginBottom: 20 }}>
                <button onClick={() => setConvertDir('home_to_foreign')} style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 11,
                  background: convertDir === 'home_to_foreign' ? '#FFFFFF' : 'transparent',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                  color: convertDir === 'home_to_foreign' ? '#1C1C1E' : '#8E8E93',
                  boxShadow: convertDir === 'home_to_foreign' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}>🇮🇳 ₹ → {country.flag} {country.code}</button>
                <button onClick={() => setConvertDir('foreign_to_home')} style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 11,
                  background: convertDir === 'foreign_to_home' ? '#FFFFFF' : 'transparent',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
                  color: convertDir === 'foreign_to_home' ? '#1C1C1E' : '#8E8E93',
                  boxShadow: convertDir === 'foreign_to_home' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}>{country.flag} {country.code} → 🇮🇳 ₹</button>
              </div>

              {/* Input */}
              <div style={{ background: '#F2F2F7', borderRadius: 18, padding: '20px', marginBottom: 12, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  {convertDir === 'home_to_foreign' ? 'Indian Rupees (₹)' : `${country.name} (${country.code})`}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#007AFF' }}>
                    {convertDir === 'home_to_foreign' ? '₹' : country.symbol}
                  </span>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={e => setConvertAmount(e.target.value)}
                    style={{
                      border: 'none', outline: 'none', background: 'transparent',
                      fontFamily: 'Manrope, sans-serif', fontSize: 44, fontWeight: 800, color: '#1C1C1E',
                      width: 160, textAlign: 'center',
                    }}
                  />
                </div>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: 18, background: '#007AFF', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M2 8l5 5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Result */}
              <div style={{ background: '#007AFF', borderRadius: 18, padding: '20px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                  {convertDir === 'foreign_to_home' ? 'Indian Rupees (₹)' : `${country.name} (${country.code})`}
                </p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 44, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1 }}>
                  {convertDir === 'home_to_foreign' ? country.symbol : '₹'} {convertedAmount()}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                  Rate: 1 {country.code} = ₹{country.rate}
                </p>
              </div>
            </div>

            {/* Quick amounts */}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Quick Convert</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(convertDir === 'home_to_foreign' ? [500, 1000, 2000, 5000] : [10, 50, 100, 500]).map(amt => (
                <button key={amt} onClick={() => setConvertAmount(String(amt))} style={{
                  background: '#FFFFFF', border: 'none', borderRadius: 16, padding: '14px', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  textAlign: 'left',
                }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1C1C1E', marginBottom: 3 }}>
                    {convertDir === 'home_to_foreign' ? `₹${amt}` : `${country.symbol}${amt}`}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>
                    ≈ {convertDir === 'home_to_foreign' ? `${country.symbol}${(amt / country.rate).toFixed(2)}` : `₹${(amt * country.rate).toFixed(0)}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TravelScreen });
