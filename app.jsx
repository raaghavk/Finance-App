// app.jsx — Zenith: complete routing with all screens

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#007AFF",
  "userName": "",
  "startOnHome": false,
  "showTravelBadge": true
}/*EDITMODE-END*/;

function NavBtn({ icon, label, active, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', minWidth: 48,
      WebkitTapHighlightColor: 'transparent',
    }}>
      {icon}
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: active ? 700 : 400, color: active ? accent : '#AAAAAA', lineHeight: 1 }}>{label}</span>
    </button>
  );
}

function MoreSheet({ onNavigate, onClose, accent, activeTab }) {
  const items = [
    { id: 'budget',       label: 'Budget',      sub: 'Set category limits',     emoji: '🎯' },
    { id: 'goals',        label: 'Goals',        sub: 'Track savings targets',   emoji: '🏆' },
    { id: 'recurring',    label: 'Recurring',    sub: 'Subs & bills',            emoji: '🔄' },
    { id: 'search',       label: 'Search',       sub: 'Find transactions',       emoji: '🔍' },
    { id: 'networth',     label: 'Net Worth',    sub: 'Assets vs liabilities',   emoji: '📊' },
    { id: 'reports',      label: 'Reports',      sub: 'Monthly summaries',       emoji: '📋' },
    { id: 'split',        label: 'Split',        sub: 'Share expenses',          emoji: '👥' },
    { id: 'calendar',     label: 'Calendar',     sub: 'Day-by-day cashflow',     emoji: '📅' },
    { id: 'notifications',label: 'Alerts',       sub: 'Budget & bill alerts',    emoji: '🔔' },
    { id: 'profile',      label: 'Profile',      sub: 'Settings & data',         emoji: '👤' },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 71,
        background: '#F2F2F7', borderRadius: '28px 28px 0 0',
        padding: '0 20px 40px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
        animation: 'slideUp 0.32s cubic-bezier(0.4,0,0.2,1)',
        maxHeight: '85%', overflowY: 'auto',
      }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 18px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#C7C7CC' }} />
        </div>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#1C1C1E', marginBottom: 16 }}>More</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} style={{
              background: '#FFFFFF', border: `1.5px solid ${activeTab === item.id ? accent : 'transparent'}`,
              borderRadius: 20, padding: '16px 14px', cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{item.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ZenithApp() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('zenith_state') || '{}'); } catch { return {}; } })();

  const [tweaks, setTweaks]             = React.useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen]     = React.useState(false);
  const [screen, setScreen]             = React.useState(() => TWEAK_DEFAULTS.startOnHome ? 'home' : (localStorage.getItem('zenith_screen') || 'onboarding'));
  const [onboardStep, setOnboardStep]   = React.useState(0);
  const [userName, setUserName]         = React.useState(saved.userName || TWEAK_DEFAULTS.userName || '');
  const [startBalance, setStartBalance] = React.useState(saved.balance || 50000);
  const [fabOpen, setFabOpen]           = React.useState(false);
  const [moreOpen, setMoreOpen]         = React.useState(false);
  const [drawerTx, setDrawerTx]         = React.useState(null);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [activeTab, setActiveTab]       = React.useState('home');
  const [prevTab, setPrevTab]           = React.useState('home');
  const [transactions, setTransactions] = React.useState(TRANSACTIONS_DATA || []);
  const [categoryArg, setCategoryArg]   = React.useState(null);

  React.useEffect(() => { localStorage.setItem('zenith_screen', screen); }, [screen]);
  React.useEffect(() => { localStorage.setItem('zenith_state', JSON.stringify({ userName, balance: startBalance })); }, [userName, startBalance]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode')   setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const accent = tweaks.accentColor;

  // All slide-transition tabs
  const TABS = ['home','analysis','travel','profile','budget','goals','recurring','search','networth','reports','split','calendar','notifications','categoryDetail'];

  const goTab = (tab, arg) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
    setScreen(tab);
    setFabOpen(false);
    setMoreOpen(false);
    if (arg !== undefined) setCategoryArg(arg);
  };

  const goBack = () => goTab(prevTab === activeTab ? 'home' : prevTab);

  const openDrawer = (tx) => { setDrawerTx(tx); setTimeout(() => setDrawerVisible(true), 20); };
  const closeDrawer = () => { setDrawerVisible(false); setTimeout(() => setDrawerTx(null), 400); };

  const onboardNext = () => {
    if (onboardStep < 2) setOnboardStep(s => s + 1);
    else { setScreen('home'); setActiveTab('home'); }
  };

  const showChrome = screen !== 'onboarding';

  const burstItems = [
    { label: 'Voice', angle: -55, icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="7" y="1" width="6" height="10" rx="3" stroke="white" strokeWidth="1.8"/><path d="M3 9.5C3 13.09 6.13 16 10 16s7-2.91 7-6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="10" y1="16" x2="10" y2="19" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      action: () => { setFabOpen(false); setTimeout(() => setScreen('voiceEntry'), 80); } },
    { label: 'Scan',  angle: 0,   icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.8"/><rect x="13" y="1" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.8"/><rect x="1" y="13" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.8"/><rect x="13" y="13" width="6" height="6" rx="1.5" stroke="white" strokeWidth="1.8"/></svg>,
      action: () => { setFabOpen(false); setTimeout(() => setScreen('cameraScan'), 80); } },
    { label: 'Manual',angle: 55,  icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17l3-1 9-9-2-2-9 9-1 3z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/><path d="M13 5l2 2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>,
      action: () => { setFabOpen(false); setTimeout(() => setScreen('addExpense'), 80); } },
  ];

  const MORE_TABS = ['budget','goals','recurring','search','networth','reports','split','calendar','notifications','profile'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0A0A0A' }} id="device-scaler">
      <div style={{ position: 'relative' }}>
        <IOSDevice width={402} height={874}>
          <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#F2F2F7' }}>

            {/* Onboarding */}
            {screen === 'onboarding' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                <OnboardingScreen step={onboardStep} onNext={onboardNext} setUserName={setUserName} setStartBalance={setStartBalance} />
              </div>
            )}

            {/* Screen stack */}
            {showChrome && TABS.map(tab => {
              const tabIdx = TABS.indexOf(tab);
              const activeIdx = TABS.indexOf(activeTab);
              const dir = tabIdx >= activeIdx ? '100%' : '-100%';
              return (
                <div key={tab} style={{
                  position: 'absolute', inset: 0,
                  transform: activeTab === tab ? 'translateX(0)' : `translateX(${dir})`,
                  transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
                  zIndex: activeTab === tab ? 2 : 1,
                  willChange: 'transform',
                }}>
                  {tab === 'home'          && <HomeScreen userName={userName} startBalance={startBalance} onSelectTx={openDrawer} transactions={transactions} onNavigate={(t, arg) => goTab(t, arg)} />}
                  {tab === 'analysis'      && <AnalysisScreen onNavigate={(t, arg) => goTab(t, arg)} />}
                  {tab === 'travel'        && <TravelScreen />}
                  {tab === 'profile'       && <ProfileScreen userName={userName} startBalance={startBalance} />}
                  {tab === 'budget'        && <BudgetSetupScreen />}
                  {tab === 'goals'         && <SavingsGoalsScreen />}
                  {tab === 'recurring'     && <RecurringScreen />}
                  {tab === 'search'        && <SearchScreen />}
                  {tab === 'networth'      && <NetWorthScreen onBack={goBack} />}
                  {tab === 'reports'       && <ReportsScreen onBack={goBack} initialMonth={typeof categoryArg === 'number' ? categoryArg : undefined} />}
                  {tab === 'split'         && <SplitExpenseScreen onBack={goBack} />}
                  {tab === 'calendar'      && <CashflowCalendarScreen onBack={goBack} onSelectTx={openDrawer} />}
                  {tab === 'notifications' && <NotificationsScreen onBack={goBack} />}
                  {tab === 'categoryDetail'&& <CategoryDetailScreen category={categoryArg} onBack={goBack} />}
                </div>
              );
            })}

            {/* Add Expense overlay */}
            {showChrome && (
              <div style={{
                position: 'absolute', inset: 0,
                zIndex: screen === 'addExpense' ? 10 : -1,
                transform: screen === 'addExpense' ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                <AddExpenseScreen
                  onClose={() => setScreen(activeTab)}
                  onSave={(entry) => {
                    setTransactions(prev => [{ id: Date.now(), merchant: entry.note || 'Expense', category: entry.category || 'Other', amount: entry.amount, date: '2026-05-02', color: '#007AFF' }, ...prev]);
                    setScreen(activeTab);
                  }}
                />
              </div>
            )}

            {/* Voice Entry overlay */}
            {showChrome && (
              <div style={{
                position: 'absolute', inset: 0,
                zIndex: screen === 'voiceEntry' ? 11 : -1,
                transform: screen === 'voiceEntry' ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                <VoiceEntryScreen
                  onClose={() => setScreen(activeTab)}
                  onSave={(entry) => {
                    setTransactions(prev => [{ id: Date.now(), merchant: entry.merchant || 'Voice Entry', category: entry.category || 'Other', amount: entry.amount, date: '2026-05-02', color: '#007AFF' }, ...prev]);
                    setScreen(activeTab);
                  }}
                />
              </div>
            )}

            {/* Camera Scan overlay */}
            {showChrome && (
              <div style={{
                position: 'absolute', inset: 0,
                zIndex: screen === 'cameraScan' ? 11 : -1,
                transform: screen === 'cameraScan' ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                <CameraScanScreen
                  onClose={() => setScreen(activeTab)}
                  onSave={(entry) => {
                    setTransactions(prev => [{ id: Date.now(), merchant: entry.note || 'Scanned Receipt', category: entry.category || 'Food & Drink', amount: entry.amount, date: '2026-05-02', color: '#FF6B6B' }, ...prev]);
                    setScreen(activeTab);
                  }}
                />
              </div>
            )}

            {/* FAB blur overlay */}
            {fabOpen && (
              <div onClick={() => setFabOpen(false)} style={{
                position: 'absolute', inset: 0, zIndex: 40,
                backdropFilter: 'blur(18px) brightness(0.88)',
                WebkitBackdropFilter: 'blur(18px) brightness(0.88)',
                background: 'rgba(255,255,255,0.1)',
              }} />
            )}

            {/* Burst buttons */}
            {showChrome && burstItems.map((item, i) => {
              const rad = (item.angle - 90) * Math.PI / 180;
              const dist = 108;
              const tx = Math.cos(rad) * dist;
              const ty = Math.sin(rad) * dist;
              return (
                <div key={item.label} style={{
                  position: 'absolute', bottom: 44, left: '50%', marginLeft: -28,
                  width: 56, height: 56, zIndex: 50,
                  transform: fabOpen ? `translate(${tx}px,${ty}px) scale(1)` : 'translate(0,0) scale(0.4)',
                  opacity: fabOpen ? 1 : 0,
                  transition: `transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i*0.05}s, opacity 0.25s ${i*0.05}s`,
                  pointerEvents: fabOpen ? 'auto' : 'none',
                }}>
                  <button onClick={item.action || (() => setFabOpen(false))} style={{
                    width: 56, height: 56, borderRadius: 28,
                    background: 'rgba(22,22,30,0.88)', border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.32)',
                  }}>
                    {item.icon}
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 }}>{item.label}</span>
                  </button>
                </div>
              );
            })}

            {/* Bottom Nav */}
            {showChrome && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
                height: 86, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: 10,
                background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderTop: '0.5px solid rgba(0,0,0,0.08)',
              }}>
                <NavBtn label="Home" active={activeTab==='home'} accent={accent} onClick={() => goTab('home')}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" stroke={activeTab==='home'?accent:'#AAAAAA'} strokeWidth="1.9" strokeLinejoin="round" fill={activeTab==='home'?accent+'18':'none'}/></svg>}
                />
                <NavBtn label="Analysis" active={activeTab==='analysis'} accent={accent} onClick={() => goTab('analysis')}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="13" width="4" height="8" rx="1.5" stroke={activeTab==='analysis'?accent:'#AAAAAA'} fill={activeTab==='analysis'?accent+'18':'none'} strokeWidth="1.9"/><rect x="10" y="8" width="4" height="13" rx="1.5" stroke={activeTab==='analysis'?accent:'#AAAAAA'} fill={activeTab==='analysis'?accent+'18':'none'} strokeWidth="1.9"/><rect x="17" y="3" width="4" height="18" rx="1.5" stroke={activeTab==='analysis'?accent:'#AAAAAA'} fill={activeTab==='analysis'?accent+'18':'none'} strokeWidth="1.9"/></svg>}
                />
                <div style={{ width: 58 }} />
                <NavBtn label="Travel" active={activeTab==='travel'} accent={accent} onClick={() => goTab('travel')}
                  icon={<div style={{ position: 'relative' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 16l-3-8-5 3-3-7-3 7-5-3-3 8h22z" stroke={activeTab==='travel'?accent:'#AAAAAA'} fill={activeTab==='travel'?accent+'18':'none'} strokeWidth="1.9" strokeLinejoin="round"/></svg>
                    {tweaks.showTravelBadge && <div style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 4, background: '#34D399', border: '1.5px solid white' }} />}
                  </div>}
                />
                <NavBtn label="More" active={MORE_TABS.includes(activeTab)} accent={accent} onClick={() => setMoreOpen(true)}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.8" fill={MORE_TABS.includes(activeTab)?accent:'#AAAAAA'}/><circle cx="12" cy="12" r="1.8" fill={MORE_TABS.includes(activeTab)?accent:'#AAAAAA'}/><circle cx="19" cy="12" r="1.8" fill={MORE_TABS.includes(activeTab)?accent:'#AAAAAA'}/></svg>}
                />
              </div>
            )}

            {/* FAB */}
            {showChrome && (
              <button onClick={() => { setFabOpen(o => !o); setMoreOpen(false); }} style={{
                position: 'absolute', bottom: 26, left: '50%', marginLeft: -29,
                width: 58, height: 58, borderRadius: 29,
                background: fabOpen ? '#1C1C2E' : accent, border: 'none', cursor: 'pointer', zIndex: 51,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: fabOpen ? '0 8px 32px rgba(0,0,0,0.4)' : `0 8px 24px ${accent}60`,
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                transform: fabOpen ? 'rotate(45deg) scale(1.06)' : 'rotate(0deg) scale(1)',
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v16M3 11h16" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
              </button>
            )}

            {/* More Sheet */}
            {moreOpen && showChrome && <MoreSheet onNavigate={goTab} onClose={() => setMoreOpen(false)} accent={accent} activeTab={activeTab} />}

            {/* Transaction Drawer */}
            {drawerTx && (
              <>
                <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', opacity: drawerVisible ? 1 : 0, transition: 'opacity 0.3s' }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 61,
                  background: '#FFFFFF', borderRadius: '28px 28px 0 0', padding: '0 24px 52px',
                  transform: drawerVisible ? 'translateY(0)' : 'translateY(100%)',
                  transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 18px' }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 17, background: (drawerTx.color||'#007AFF')+'20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: drawerTx.color||'#007AFF' }}>{drawerTx.merchant.split(' ').slice(0,2).map(w=>w[0]).join('')}</span>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 19, fontWeight: 800, color: '#1C1C1E', marginBottom: 3 }}>{drawerTx.merchant}</h2>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>{drawerTx.category}</p>
                    </div>
                  </div>
                  <div style={{ background: '#F5F5F7', borderRadius: 18, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>Amount</p>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#1C1C1E', letterSpacing: -1 }}>−{fmt(drawerTx.amount)}</p>
                  </div>
                  {[['Date', relDate(drawerTx.date)], ['Category', drawerTx.category], ['Payment', 'UPI / Cash']].map(([l,v],i,arr) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length-1 ? '1px solid #F0F0F3' : 'none' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>{l}</span>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, borderRadius: 14, border: '1.5px dashed #E0E0E0', padding: '18px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#C7C7CC', fontWeight: 500 }}>Tap to attach receipt</p>
                  </div>
                  <button onClick={closeDrawer} style={{ marginTop: 12, width: '100%', padding: '14px', border: 'none', cursor: 'pointer', background: '#FFF0F0', borderRadius: 14, fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#FF3B30' }}>Delete Transaction</button>
                </div>
              </>
            )}

          </div>
        </IOSDevice>

        {/* Tweaks Panel */}
        {tweaksOpen && (
          <div style={{ position: 'absolute', bottom: 20, right: -220, width: 200, background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid #F0F0F3', fontFamily: 'Inter, sans-serif' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#121212', marginBottom: 14 }}>Tweaks</p>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: '#6E6E73', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Accent</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['#007AFF','#5856D6','#FF2D55','#FF9500','#34C759','#AF52DE'].map(c => (
                  <button key={c} onClick={() => { setTweaks(t=>({...t,accentColor:c})); window.parent.postMessage({type:'__edit_mode_set_keys',edits:{accentColor:c}},'*'); }} style={{ width: 28, height: 28, borderRadius: 14, border: `2.5px solid ${tweaks.accentColor===c?'#121212':'transparent'}`, background: c, cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 10 }}>
              <input type="checkbox" checked={tweaks.startOnHome} onChange={e => { setTweaks(t=>({...t,startOnHome:e.target.checked})); window.parent.postMessage({type:'__edit_mode_set_keys',edits:{startOnHome:e.target.checked}},'*'); }} />
              <span style={{ fontSize: 12, color: '#121212', fontWeight: 500 }}>Start on Home</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14 }}>
              <input type="checkbox" checked={tweaks.showTravelBadge} onChange={e => { setTweaks(t=>({...t,showTravelBadge:e.target.checked})); window.parent.postMessage({type:'__edit_mode_set_keys',edits:{showTravelBadge:e.target.checked}},'*'); }} />
              <span style={{ fontSize: 12, color: '#121212', fontWeight: 500 }}>Travel Badge</span>
            </label>
            <div style={{ borderTop: '1px solid #F0F0F3', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => goTab('home')} style={{ padding: '8px', border: 'none', cursor: 'pointer', background: '#F5F5F7', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#6E6E73' }}>🏠 Home</button>
              <button onClick={() => { setScreen('onboarding'); setOnboardStep(0); }} style={{ padding: '8px', border: 'none', cursor: 'pointer', background: '#F5F5F7', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#6E6E73' }}>↺ Onboarding</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ZenithApp />);
