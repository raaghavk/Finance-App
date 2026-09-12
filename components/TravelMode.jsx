// TravelMode.jsx — persisted trips; free demo (1 trip / 8 expenses), full travel on Pro

function CountryPickerScreen({ countries, selectedCountry, onSelect, onBack, onConfirm, locale }) {
  const [search, setSearch] = React.useState('');
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;
  const cream = ZENITH.cream;
  return (
    <div style={{ height: '100%', background: page, display: 'flex', flexDirection: 'column', paddingTop: 'var(--zenith-pad-top)' }}>
      <div style={{ padding: '4px 20px 14px', flexShrink: 0 }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: accent, fontWeight: 500 }}>{t(locale, 'cancel')}</span>
        </button>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 14 }}>{t(locale, 'chooseCountry')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: card, borderRadius: 14, padding: '11px 14px', boxShadow: zenithSoftShadow() }}>
          <input
            autoFocus
            type="text"
            placeholder="USD, Thailand, AED…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: 14, color: ink }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
          {filtered.map((c, i) => (
            <button key={c.code} type="button" onClick={() => onSelect(c.code)} style={{
              display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '13px 18px', cursor: 'pointer',
              border: 'none', borderBottom: i < filtered.length - 1 ? '1px solid ' + cream : 'none',
              background: selectedCountry === c.code ? cream : card, textAlign: 'left',
            }}>
              <span style={{ fontSize: 24 }}>{c.flag}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{c.name}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted }}>{c.code} · 1 {c.code} = ₹{c.rate}</p>
              </div>
            </button>
          ))}
        </div>
        <div style={{ height: 100 }} />
      </div>
      <div style={{ padding: '12px 20px var(--zenith-pad-bottom)', flexShrink: 0 }}>
        <button type="button" onClick={onConfirm} style={{
          width: '100%', padding: '17px', border: 'none', borderRadius: 18,
          cursor: selectedCountry ? 'pointer' : 'default',
          background: selectedCountry ? accent : cream,
          color: selectedCountry ? '#FFFFFF' : muted,
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700,
        }}>{t(locale, 'activateTravel')}</button>
      </div>
    </div>
  );
}

function TripExpenseForm({ locale, trip, store, initial, onSave, onCancel, onDelete }) {
  const [merchant, setMerchant] = React.useState(initial && initial.merchant ? initial.merchant : '');
  const [amount, setAmount] = React.useState(initial && initial.amount != null ? String(initial.amount) : '');
  const [cat, setCat] = React.useState((initial && initial.cat) || 'Food');
  const [postHome, setPostHome] = React.useState(!!(initial && initial.postHome));
  const accounts = (store && store.accounts) || [];
  const [accountId, setAccountId] = React.useState((initial && initial.accountId) || (accounts[0] && accounts[0].id) || 'cash');
  const ok = merchant.trim() && (parseFloat(amount) || 0) > 0;
  const rate = Number(trip.rate) || 1;
  const inr = Math.round((parseFloat(amount) || 0) * rate);
  const card = ZENITH.card;
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const accent = ZENITH.accent;
  const cream = ZENITH.cream;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div role="dialog" aria-label={t(locale, 'addTripExpense')} style={{
        width: '100%', background: card, borderRadius: '24px 24px 0 0',
        padding: '16px 20px var(--zenith-pad-bottom)', maxHeight: '85%',
        display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 32px rgba(15,23,42,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: ink }}>{t(locale, 'addTripExpense')}</h2>
          <button type="button" onClick={onCancel} aria-label="Close" style={{
            width: 36, height: 36, border: 'none', borderRadius: 12, background: cream, cursor: 'pointer', fontSize: 18, color: ink,
          }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 6 }}>{t(locale, 'note')}</label>
          <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Pad Thai, Grab, hotel…" style={moneyInputStyle()} />
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '12px 0 6px' }}>{trip.currency}</label>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={moneyInputStyle()} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 6 }}>≈ {fmt(inr)}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {(TRAVEL_CATS || ['Food', 'Other']).map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} style={{
                padding: '8px 12px', border: 'none', borderRadius: 12, cursor: 'pointer',
                background: cat === c ? accent : cream, color: cat === c ? '#fff' : ink,
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
              }}>{c}</button>
            ))}
          </div>
          <button type="button" onClick={() => setPostHome((v) => !v)} style={{
            marginTop: 16, width: '100%', textAlign: 'left', border: 'none', borderRadius: 14, padding: '12px 14px',
            background: cream, cursor: 'pointer',
          }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{t(locale, 'logToHome')}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 3 }}>{postHome ? (locale === 'hi' ? 'घर के वॉलेट में भी लिखा जाएगा' : 'Also posts to your home wallet') : (locale === 'hi' ? 'केवल ट्रिप बही' : 'Trip ledger only')}</p>
          </button>
          {postHome && accounts.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {accounts.map((a) => (
                <button key={a.id} type="button" onClick={() => setAccountId(a.id)} style={{
                  padding: '8px 12px', border: 'none', borderRadius: 12, cursor: 'pointer',
                  background: accountId === a.id ? accent : cream, color: accountId === a.id ? '#fff' : ink,
                  fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                }}>{acctLabel(a, locale) || a.name}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexShrink: 0 }}>
          {initial && initial.id && onDelete ? (
            <button type="button" onClick={onDelete} style={{
              padding: '14px 16px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
              fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer',
            }}>{t(locale, 'delete')}</button>
          ) : null}
          <button type="button" disabled={!ok} onClick={() => onSave({
            merchant: merchant.trim(), amount: parseFloat(amount) || 0, cat, inr, date: (initial && initial.date) || todayISO(),
            postHome, accountId,
          })} style={{
            flex: 1, padding: '14px', border: 'none', borderRadius: 14,
            background: ok ? accent : cream, color: ok ? '#fff' : muted, fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: ok ? 'pointer' : 'default',
          }}>{t(locale, 'save')}</button>
        </div>
      </div>
    </div>
  );
}

function TravelScreen({ store, onStartTrip, onEndTrip, onAddExpense, onSaveExpense, onDeleteExpense, onUpdateTrip, onNeedPro, onBack, onUnlockPro }) {
  const locale = store.user.locale || 'en';
  const live = typeof activeTrip === 'function' ? activeTrip(store) : null;
  const past = (store.trips || []).filter((t) => t.status === 'ended');
  const isPro = typeof zenithIsPro === 'function' && zenithIsPro(store);
  const [step, setStep] = React.useState(0);
  const [tripName, setTripName] = React.useState('');
  const [startDate, setStartDate] = React.useState(todayISO());
  const [endDate, setEndDate] = React.useState(typeof addDaysISO === 'function' ? addDaysISO(todayISO(), 7) : todayISO());
  const [tripBudgetINR, setTripBudgetINR] = React.useState('50000');
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [tab, setTab] = React.useState('dashboard');
  const [convertAmount, setConvertAmount] = React.useState('1000');
  const [convertDir, setConvertDir] = React.useState('home_to_foreign');
  const [showHistory, setShowHistory] = React.useState(false);
  const [historyDetail, setHistoryDetail] = React.useState(null);
  const [showSOS, setShowSOS] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);
  const [expenseSheet, setExpenseSheet] = React.useState(false);
  const [editExp, setEditExp] = React.useState(null);
  const [tipPct, setTipPct] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [newCheck, setNewCheck] = React.useState('');
  const [rateDraft, setRateDraft] = React.useState('');
  const [forexDraft, setForexDraft] = React.useState(null);
  const countries = TRAVEL_COUNTRIES || [];
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;
  const cream = ZENITH.cream;

  const beginTrip = () => {
    if (!canStartTrip(store)) { onNeedPro && onNeedPro('trip'); return; }
    setStep(1);
  };

  const confirmCountry = () => {
    const country = findTravelCountry(selectedCountry);
    if (!country) return;
    onStartTrip && onStartTrip({
      name: tripName || country.name,
      countryCode: country.code,
      countryName: country.name,
      flag: country.flag,
      currency: country.code,
      symbol: country.symbol,
      rate: country.rate,
      startDate, endDate,
      budgetINR: parseFloat(tripBudgetINR) || 0,
    });
    setStep(0);
  };

  if (showSummary && live) {
    const spentINR = tripSpentINR(live);
    const spentForeign = tripSpentForeign(live);
    const byCategory = {};
    (live.expenses || []).forEach((e) => { byCategory[e.cat] = (byCategory[e.cat] || 0) + e.amount; });
    return (
      <TripSummaryScreen
        trip={{
          ...live,
          spentINR, spentForeign, overBudget: spentINR > (live.budgetINR || 0),
          days: tripDaysLeft(live),
          dates: live.startDate + ' – ' + live.endDate,
          code: live.currency,
          byCategory,
        }}
        onDone={() => { onEndTrip && onEndTrip(live.id); setShowSummary(false); }}
      />
    );
  }

  if (step === 1) {
    return (
      <TripSetupScreen
        tripName={tripName} setTripName={setTripName}
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        budget={tripBudgetINR} setBudget={setTripBudgetINR}
        onBack={() => setStep(0)}
        onNext={() => setStep(2)}
      />
    );
  }

  if (step === 2) {
    return (
      <CountryPickerScreen
        locale={locale}
        countries={countries}
        selectedCountry={selectedCountry}
        onSelect={setSelectedCountry}
        onBack={() => setStep(1)}
        onConfirm={() => { if (selectedCountry) confirmCountry(); }}
      />
    );
  }

  if (!live) {
    return (
      <div style={{ height: '100%', position: 'relative', background: page }}>
        <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 'var(--zenith-pad-bottom)' }}>
          {typeof ZenithScreenHeader === 'function' ? (
            <ZenithScreenHeader
              title={t(locale, 'travel')}
              leftLabel="‹"
              onLeft={onBack}
              rightLabel={past.length ? t(locale, 'travelHistory') : (isPro ? t(locale, 'paid') : t(locale, 'upgrade'))}
              onRight={() => {
                if (past.length && !canUseTravelHistory(store)) { onNeedPro && onNeedPro('history'); return; }
                if (past.length) setShowHistory(true);
                else onUnlockPro && onUnlockPro();
              }}
            />
          ) : null}
          <div style={{ padding: '0 20px', marginBottom: 20 }}>
            <div style={{
              background: zenithHeroGradient(), borderRadius: 28, padding: '32px 28px',
              boxShadow: zenithHeroShadow(), position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 10 }}>{t(locale, 'headingSomewhere')}</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: 20 }}>{t(locale, 'travelHero')}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 18 }}>{isPro ? t(locale, 'paid') : t(locale, 'travelDemo')}</p>
              <button type="button" onClick={beginTrip} style={{
                background: '#FFFFFF', border: 'none', borderRadius: 16, padding: '16px 28px', cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: accent,
              }}>{t(locale, 'startTrip')}</button>
            </div>
          </div>
          <div style={{ padding: '0 20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>{t(locale, 'whatYouGet')}</p>
            <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
              {[
                { icon: '💱', title: t(locale, 'liveRates'), sub: t(locale, 'liveRatesSub') },
                { icon: '📊', title: t(locale, 'tripBudgetSep'), sub: t(locale, 'tripBudgetSepSub') },
                { icon: '🧾', title: t(locale, 'perTripLedger'), sub: t(locale, 'perTripLedgerSub') },
                { icon: '🎒', title: t(locale, 'packingList'), sub: t(locale, 'checklistPro') },
                { icon: '🆘', title: t(locale, 'emergencyAssist'), sub: t(locale, 'emergencyAssistSub') },
              ].map((f, i, arr) => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < arr.length - 1 ? '1px solid ' + cream : 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{f.icon}</div>
                  <div>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{f.title}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted }}>{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showHistory && (
          <TripHistoryScreen trips={past.map((tr) => ({
            ...tr,
            spentINR: tripSpentINR(tr),
            spentForeign: tripSpentForeign(tr),
            dates: tr.startDate + ' – ' + tr.endDate,
            country: tr.countryName,
            overBudget: tripSpentINR(tr) > (tr.budgetINR || 0),
          }))} onBack={() => { setShowHistory(false); setHistoryDetail(null); }} onSelect={(tr) => setHistoryDetail(tr)} />
        )}
        {historyDetail && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
            <TripSummaryScreen trip={{
              ...historyDetail,
              code: historyDetail.currency,
              byCategory: (historyDetail.expenses || []).reduce((acc, e) => { acc[e.cat] = (acc[e.cat] || 0) + e.amount; return acc; }, { Other: 0 }),
              days: historyDetail.days || 1,
            }} onDone={() => setHistoryDetail(null)} />
          </div>
        )}
      </div>
    );
  }

  const country = { flag: live.flag, name: live.countryName, code: live.currency, symbol: live.symbol, rate: live.rate };
  const expenses = live.expenses || [];
  const totalForeign = tripSpentForeign(live);
  const totalINR = tripSpentINR(live);
  const budgetINR = live.budgetINR || 0;
  const budgetPct = budgetINR > 0 ? totalINR / budgetINR : 0;
  const daysLeft = tripDaysLeft(live);
  const convertedAmount = () => {
    const n = parseFloat(convertAmount) || 0;
    return convertDir === 'home_to_foreign' ? (n / country.rate).toFixed(2) : (n * country.rate).toFixed(0);
  };
  const catColors = TRAVEL_CAT_COLORS || {};

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: page, position: 'relative' }}>
      <div style={{ paddingTop: 'var(--zenith-pad-top)', padding: 'var(--zenith-pad-top) 20px 12px' }}>
        {!isPro && (
          <button type="button" onClick={() => onUnlockPro && onUnlockPro()} style={{
            width: '100%', marginBottom: 10, border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer',
            background: cream, color: accent, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, textAlign: 'left',
          }}>{t(locale, 'demoBanner')}</button>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{country.flag}</span>
              <div style={{ background: accent, borderRadius: 8, padding: '3px 8px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>TRAVEL</span>
              </div>
            </div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: ink }}>{live.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => {
              if (!canUseTravelSos(store)) { onNeedPro && onNeedPro('sos'); return; }
              setShowSOS(true);
            }} style={{ background: card, border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer' }}>🆘</button>
            <button type="button" onClick={() => setShowSummary(true)} style={{
              background: card, border: 'none', borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#EF4444',
            }}>{t(locale, 'endTrip')}</button>
          </div>
        </div>
      </div>
      {showSOS && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 25 }}>
          <EmergencyScreen country={country} onBack={() => setShowSOS(false)} />
        </div>
      )}
      <div style={{ display: 'flex', background: cream, borderRadius: 12, padding: 3, margin: '0 20px 16px' }}>
        {[['dashboard', t(locale, 'home')], ['expenses', t(locale, 'activity')], ['convert', t(locale, 'convert')], ['kit', t(locale, 'kit')]].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setTab(val)} style={{
            flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', borderRadius: 10,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
            background: tab === val ? card : 'transparent', color: tab === val ? ink : muted,
          }}>{label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--zenith-pad-bottom)' }}>
        {tab === 'dashboard' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ background: zenithHeroGradient(), borderRadius: 24, padding: '22px', marginBottom: 14, boxShadow: zenithHeroShadow() }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'tripSpent')}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>{country.code} {totalForeign.toFixed(2)}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>≈ {fmt(totalINR)}</p>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 12 }}>
                <div style={{ height: '100%', width: (Math.min(budgetPct, 1) * 100) + '%', borderRadius: 2, background: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{t(locale, 'dailyLeft')}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>{fmt(Math.max(budgetINR - totalINR, 0) / daysLeft)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{t(locale, 'daysLeft')}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>{daysLeft}</p>
                </div>
              </div>
            </div>
            <div style={{ background: card, borderRadius: 16, padding: '12px 16px', marginBottom: 14, boxShadow: zenithSoftShadow() }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginBottom: 6 }}>{t(locale, 'customRate')}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink, flex: 1 }}>1 {country.code} = ₹</p>
                <input
                  inputMode="decimal"
                  value={rateDraft !== '' ? rateDraft : String(live.rate)}
                  onChange={(e) => setRateDraft(e.target.value)}
                  onBlur={() => {
                    const n = parseFloat(rateDraft !== '' ? rateDraft : live.rate);
                    if (n > 0) onUpdateTrip && onUpdateTrip(live.id, { rate: n });
                    setRateDraft('');
                  }}
                  style={{ width: 96, border: 'none', outline: 'none', background: cream, borderRadius: 10, padding: '8px 10px', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink, textAlign: 'right' }}
                />
              </div>
            </div>
          </div>
        )}
        {tab === 'expenses' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink }}>{expenses.length} · {t(locale, 'activity')}</p>
              <button type="button" onClick={() => {
                if (!canAddTripExpense(store, live)) { onNeedPro && onNeedPro('expense'); return; }
                setEditExp(null);
                setExpenseSheet(true);
              }} style={{
                border: 'none', borderRadius: 12, padding: '8px 12px', cursor: 'pointer', background: accent, color: '#fff',
                fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800,
              }}>{t(locale, 'addTripExpense')}</button>
            </div>
            {expenses.length === 0 ? (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted }}>{t(locale, 'noTxns')}</p>
            ) : Object.keys(expenses.reduce((acc, e) => { acc[e.date || ''] = true; return acc; }, {})).sort().reverse().map((day) => (
              <div key={day} style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }}>{relDate(day, locale)}</p>
                {expenses.filter((e) => e.date === day).map((exp) => (
                  <button key={exp.id} type="button" onClick={() => { setEditExp(exp); setExpenseSheet(true); }} style={{
                    display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '12px 0', border: 'none',
                    borderBottom: '1px solid ' + cream, background: 'none', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: (catColors[exp.cat] || accent) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: catColors[exp.cat] || accent }}>
                      {(exp.merchant || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{exp.merchant}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted }}>{exp.cat}{exp.postHome ? ' · ' + t(locale, 'logToHome') : ''}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{country.code} {exp.amount}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted }}>{fmt(exp.inr)}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
        {tab === 'convert' && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ background: card, borderRadius: 22, padding: '20px', boxShadow: zenithSoftShadow() }}>
              <div style={{ display: 'flex', background: cream, borderRadius: 14, padding: 3, marginBottom: 20 }}>
                <button type="button" onClick={() => setConvertDir('home_to_foreign')} style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 11,
                  background: convertDir === 'home_to_foreign' ? card : 'transparent',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: ink,
                }}>₹ → {country.code}</button>
                <button type="button" onClick={() => setConvertDir('foreign_to_home')} style={{
                  flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 11,
                  background: convertDir === 'foreign_to_home' ? card : 'transparent',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: ink,
                }}>{country.code} → ₹</button>
              </div>
              <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} style={{
                width: '100%', border: 'none', outline: 'none', background: cream, borderRadius: 16, padding: '16px',
                fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, color: ink, textAlign: 'center',
              }} />
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: accent, textAlign: 'center', marginTop: 16 }}>
                {convertDir === 'home_to_foreign' ? country.symbol + ' ' + convertedAmount() : '₹' + convertedAmount()}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, textAlign: 'center', marginTop: 12, marginBottom: 8 }}>{t(locale, 'tipPct')}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {[0, 10, 12, 15, 20].map((pct) => (
                  <button key={pct} type="button" onClick={() => setTipPct(pct)} style={{
                    padding: '8px 10px', border: 'none', borderRadius: 10, cursor: 'pointer',
                    background: tipPct === pct ? accent : cream, color: tipPct === pct ? '#fff' : ink,
                    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                  }}>{pct}%</button>
                ))}
              </div>
              {tipPct > 0 && (
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink, textAlign: 'center', marginTop: 12 }}>
                  {t(locale, 'withTip')} · {convertDir === 'home_to_foreign'
                    ? country.symbol + ' ' + (parseFloat(convertedAmount()) * (1 + tipPct / 100)).toFixed(2)
                    : '₹' + Math.round(parseFloat(convertedAmount()) * (1 + tipPct / 100))}
                </p>
              )}
            </div>
          </div>
        )}
        {tab === 'kit' && (
          <div style={{ padding: '0 20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>{t(locale, 'forexCash')}</p>
            <div style={{ background: card, borderRadius: 16, padding: '12px 16px', marginBottom: 16, boxShadow: zenithSoftShadow(), display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: accent }}>{country.symbol}</span>
              <input
                inputMode="decimal"
                value={forexDraft != null ? forexDraft : String(live.forexCash || 0)}
                onChange={(e) => setForexDraft(e.target.value)}
                onBlur={() => {
                  const n = parseFloat(forexDraft != null ? forexDraft : live.forexCash);
                  onUpdateTrip && onUpdateTrip(live.id, { forexCash: isNaN(n) ? 0 : Math.max(0, n) });
                  setForexDraft(null);
                }}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: ink }}
              />
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>{t(locale, 'tripNotes')}</p>
            <textarea
              value={live.notes || ''}
              onChange={(e) => onUpdateTrip && onUpdateTrip(live.id, { notes: e.target.value })}
              placeholder={locale === 'hi' ? 'होटल, फ्लाइट, SIM…' : 'Hotel, flights, SIM…'}
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', border: 'none', borderRadius: 16, padding: '12px 14px', marginBottom: 16, fontFamily: 'Inter, sans-serif', fontSize: 14, color: ink, background: card, boxShadow: zenithSoftShadow(), resize: 'none' }}
            />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>{t(locale, 'packingList')}</p>
            <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow(), marginBottom: 12 }}>
              {(live.checklist || []).map((item, i, arr) => {
                const label = item.id === 'ck-pass' ? t(locale, 'ckPass')
                  : item.id === 'ck-fx' ? t(locale, 'ckFx')
                  : item.id === 'ck-sim' ? t(locale, 'ckSim')
                  : item.id === 'ck-ins' ? t(locale, 'ckIns')
                  : item.id === 'ck-stay' ? t(locale, 'ckStay')
                  : item.id === 'ck-med' ? t(locale, 'ckMed')
                  : item.label;
                return (
                  <button key={item.id} type="button" onClick={() => {
                    const next = (live.checklist || []).map((row) => (row.id === item.id ? { ...row, done: !row.done } : row));
                    onUpdateTrip && onUpdateTrip(live.id, { checklist: next });
                  }} style={{
                    display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '14px 16px', border: 'none',
                    borderBottom: i < arr.length - 1 ? '1px solid ' + cream : 'none', background: card, cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, border: item.done ? 'none' : '1.5px solid ' + muted,
                      background: item.done ? accent : 'transparent', flexShrink: 0,
                    }} />
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: item.done ? muted : ink, textDecoration: item.done ? 'line-through' : 'none' }}>{label}</p>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={newCheck}
                onChange={(e) => setNewCheck(e.target.value)}
                placeholder={t(locale, 'addCheckItem')}
                style={{ flex: 1, ...moneyInputStyle() }}
              />
              <button type="button" onClick={() => {
                if (!newCheck.trim()) return;
                if (typeof canAddChecklistItem === 'function' && !canAddChecklistItem(store, live)) {
                  onNeedPro && onNeedPro('checklist');
                  return;
                }
                const row = { id: 'ck-' + Date.now(), label: newCheck.trim(), done: false, custom: true };
                onUpdateTrip && onUpdateTrip(live.id, { checklist: (live.checklist || []).concat([row]) });
                setNewCheck('');
              }} style={{
                border: 'none', borderRadius: 12, padding: '0 14px', background: accent, color: '#fff',
                fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer',
              }}>+</button>
            </div>
            <button type="button" onClick={() => {
              const text = typeof tripSummaryText === 'function' ? tripSummaryText(live, locale) : live.name;
              if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }} style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: 14, cursor: 'pointer',
              background: cream, color: accent, fontFamily: 'Manrope, sans-serif', fontWeight: 800,
            }}>{copied ? t(locale, 'copied') : t(locale, 'copySummary')}</button>
          </div>
        )}
      </div>
      {(expenseSheet || editExp) && (
        <TripExpenseForm
          locale={locale}
          trip={live}
          store={store}
          initial={editExp}
          onCancel={() => { setExpenseSheet(false); setEditExp(null); }}
          onDelete={editExp && editExp.id ? () => {
            onDeleteExpense && onDeleteExpense(live.id, editExp.id);
            setExpenseSheet(false);
            setEditExp(null);
          } : null}
          onSave={(draft) => {
            if (editExp && editExp.id) onSaveExpense && onSaveExpense(live.id, editExp.id, draft);
            else onAddExpense && onAddExpense(live.id, draft);
            setExpenseSheet(false);
            setEditExp(null);
          }}
        />
      )}
    </div>
  );
}

Object.assign(window, { TravelScreen, CountryPickerScreen, TripExpenseForm });
