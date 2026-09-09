// app.jsx — Zenith v1: store, four-tab IA, honest first run

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#2563EB",
  "userName": "",
  "startOnHome": false,
  "showTravelBadge": false
}/*EDITMODE-END*/;

function NavBtn({ icon, label, active, accent, onClick }) {
  return (
    <button type="button" aria-label={label} aria-current={active ? 'page' : undefined} onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      background: 'none', border: 'none', cursor: 'pointer', padding: '0 6px', minWidth: 52,
      WebkitTapHighlightColor: 'transparent',
    }}>
      {icon}
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: active ? 700 : 500, color: active ? accent : '#8E8E93', lineHeight: 1 }}>{label}</span>
    </button>
  );
}

function ConfirmSheet({ title, sub, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        position: 'absolute', left: 20, right: 20, top: '36%', zIndex: 81,
        background: '#FFFFFF', borderRadius: 22, padding: '22px 20px 18px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#1C1C1E', marginBottom: 8 }}>{title}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6E6E73', lineHeight: 1.45, marginBottom: 18 }}>{sub}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#F2F2F7', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#FF3B30', color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </>
  );
}

function ZenithApp() {
  const [store, setStore] = React.useState(() => loadStore());
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [screen, setScreen] = React.useState(() => {
    const s = loadStore();
    if (TWEAK_DEFAULTS.startOnHome && s.onboardingComplete) return 'home';
    return s.onboardingComplete ? 'home' : 'onboarding';
  });
  const [onboardStep, setOnboardStep] = React.useState(0);
  const [fabOpen, setFabOpen] = React.useState(false);
  const [drawerTx, setDrawerTx] = React.useState(null);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [editTx, setEditTx] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('home');
  const [prevTab, setPrevTab] = React.useState('home');
  const [categoryArg, setCategoryArg] = React.useState(null);

  React.useEffect(() => { saveStore(store); }, [store]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const accent = tweaks.accentColor || zenithTone('accent');
  const locale = store.user.locale || 'en';
  const overlay = screen === 'addExpense' || screen === 'voiceEntry' || screen === 'cameraScan';
  const showChrome = screen !== 'onboarding' && !overlay;

  const TABS = ['home', 'activity', 'plan', 'you', 'accounts', 'categories', 'budget', 'goals', 'recurring', 'notifications', 'categoryDetail', 'notionExpenses', 'notionAccounts', 'notionBudgets'];

  const patch = (fn) => setStore((prev) => {
    const next = fn({
      ...prev,
      user: { ...prev.user },
      transactions: [...(prev.transactions || [])],
      budgets: [...(prev.budgets || [])],
      accounts: [...(prev.accounts || [])],
      categories: [...(prev.categories || [])],
      alertsRead: { ...(prev.alertsRead || {}) },
    });
    return next;
  });

  const goTab = (tab, arg) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
    setScreen(tab);
    setFabOpen(false);
    if (arg !== undefined) setCategoryArg(arg);
  };

  const goBack = () => goTab(prevTab === activeTab ? 'home' : prevTab);
  const openDrawer = (tx) => { setDrawerTx(tx); setConfirmDelete(false); setTimeout(() => setDrawerVisible(true), 20); };
  const closeDrawer = () => { setDrawerVisible(false); setConfirmDelete(false); setTimeout(() => setDrawerTx(null), 350); };

  const saveTxn = (entry) => {
    patch((s) => {
      const idx = s.transactions.findIndex((t) => t.id === entry.id);
      if (idx >= 0) {
        const next = [...s.transactions];
        next[idx] = { ...s.transactions[idx], ...entry };
        return { ...s, transactions: next };
      }
      return { ...s, transactions: [entry, ...s.transactions] };
    });
    setEditTx(null);
    setScreen(activeTab);
  };

  const deleteTxn = (id) => {
    patch((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
    closeDrawer();
  };

  const setBudget = (categoryId, limit) => {
    patch((s) => {
      const mk = monthKey();
      const rest = s.budgets.filter((b) => !(b.categoryId === categoryId && !b.accountId && b.monthKey === mk));
      return { ...s, budgets: [...rest, { categoryId, monthKey: mk, limit }] };
    });
  };

  const setAccountBudget = (accountId, limit) => {
    patch((s) => {
      const mk = monthKey();
      const rest = (s.budgets || []).filter((b) => !(b.accountId === accountId && b.monthKey === mk));
      const next = [...rest];
      if (limit > 0) next.push({ accountId, monthKey: mk, limit });
      return { ...s, budgets: next };
    });
  };

  const saveAccount = (id, draft) => {
    const created = id ? null : {
      id: typeof newMoneyId === 'function' ? newMoneyId('acct', draft.name) : ('acct-' + Date.now()),
      name: draft.name,
      nameHi: draft.name,
      opening: Number(draft.opening) || 0,
      custom: true,
    };
    patch((s) => {
      let accounts = [...(s.accounts || [])];
      if (id) {
        accounts = accounts.map((a) => (a.id === id ? { ...a, name: draft.name, nameHi: draft.name, opening: Number(draft.opening) || 0 } : a));
      } else {
        accounts = accounts.concat([created]);
      }
      const targetId = id || created.id;
      const cash = accounts.find((a) => a.id === 'cash');
      const openingCash = cash ? (Number(cash.opening) || 0) : s.openingCash;
      const mk = monthKey();
      let budgets = (s.budgets || []).filter((b) => !(b.accountId === targetId && b.monthKey === mk));
      if (Number(draft.cap) > 0) budgets = budgets.concat([{ accountId: targetId, monthKey: mk, limit: Number(draft.cap) }]);
      return { ...s, accounts, openingCash, budgets };
    });
    return created;
  };

  const deleteAccount = (id) => {
    patch((s) => {
      const accounts = (s.accounts || []).filter((a) => a.id !== id);
      if (accounts.length === 0) return s;
      const budgets = (s.budgets || []).filter((b) => b.accountId !== id);
      return { ...s, accounts, budgets };
    });
  };

  const saveCategory = (id, draft) => {
    const created = id ? null : {
      id: typeof newMoneyId === 'function' ? newMoneyId('cat', draft.name) : ('cat-' + Date.now()),
      name: draft.name,
      nameHi: draft.name,
      emoji: draft.emoji || '✦',
      color: draft.color || '#2563EB',
      type: draft.type || 'expense',
      group: 'custom',
      parentId: draft.parentId || null,
      custom: true,
    };
    patch((s) => {
      let categories = [...(s.categories || [])];
      if (id) {
        categories = categories.map((c) => (c.id === id ? {
          ...c,
          name: draft.name,
          nameHi: draft.name,
          emoji: draft.emoji,
          color: draft.color,
          parentId: draft.parentId !== undefined ? (draft.parentId || null) : c.parentId,
        } : c));
      } else {
        categories = categories.concat([created]);
      }
      return { ...s, categories };
    });
    return created;
  };

  const deleteCategory = (id) => {
    patch((s) => {
      const cats = s.categories || [];
      const target = cats.find((c) => c.id === id);
      if (!target) return s;
      const next = cats.filter((c) => c.id !== id).map((c) => (c.parentId === id ? { ...c, parentId: null } : c));
      if (!next.some((c) => c.type === 'expense')) return s;
      const fallback = next.find((c) => c.type === 'expense') || next[0];
      const transactions = (s.transactions || []).map((tx) => (tx.categoryId === id ? { ...tx, categoryId: fallback.id } : tx));
      const budgets = (s.budgets || []).filter((b) => b.categoryId !== id);
      return { ...s, categories: next, transactions, budgets };
    });
  };

  const reorderAccounts = (from, to) => {
    patch((s) => ({ ...s, accounts: typeof moveIndex === 'function' ? moveIndex(s.accounts, from, to) : s.accounts }));
  };

  const reorderCategory = (id, dir) => {
    patch((s) => {
      const cats = (s.categories || []).slice();
      const idx = cats.findIndex((c) => c.id === id);
      if (idx < 0) return s;
      const target = cats[idx];
      const siblingIdxs = [];
      cats.forEach((c, i) => {
        if ((c.parentId || null) === (target.parentId || null) && c.type === target.type) siblingIdxs.push(i);
      });
      const pos = siblingIdxs.indexOf(idx);
      const nextPos = pos + dir;
      if (pos < 0 || nextPos < 0 || nextPos >= siblingIdxs.length) return s;
      const swapWith = siblingIdxs[nextPos];
      const tmp = cats[idx];
      cats[idx] = cats[swapWith];
      cats[swapWith] = tmp;
      return { ...s, categories: cats };
    });
  };

  const toggleSubcategories = (on) => {
    patch((s) => ({ ...s, showSubcategories: !!on }));
  };

  const exportCsv = () => {
    const header = 'id,date,type,amount,category,merchant,method,account\n';
    const rows = (store.transactions || []).map((tx) => {
      const cat = findCat(store, tx.categoryId);
      return [tx.id, tx.date, tx.type, tx.amount, cat ? cat.name : '', JSON.stringify(tx.merchant || ''), tx.method, tx.accountId].join(',');
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zenith-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (!window.confirm(t(locale, 'confirmDelete'))) return;
    const fresh = createInitialStore();
    setStore(fresh);
    saveStore(fresh);
    setScreen('onboarding');
    setOnboardStep(0);
    setActiveTab('home');
  };

  const burstItems = [
    { label: 'Voice', angle: -55, action: () => { setFabOpen(false); setTimeout(() => setScreen('voiceEntry'), 80); } },
    { label: 'Scan', angle: 0, action: () => { setFabOpen(false); setTimeout(() => setScreen('cameraScan'), 80); } },
    { label: 'Manual', angle: 55, action: () => { setFabOpen(false); setEditTx(null); setTimeout(() => setScreen('addExpense'), 80); } },
  ];

  const drawerCat = drawerTx ? findCat(store, drawerTx.categoryId) : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100%',
      width: '100%',
      height: '100%',
      background: zenithTone('page'),
    }} id="device-scaler">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <IOSDevice width={402} height={874} native={true}>
          <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: zenithTone('page') }}>

            {screen === 'onboarding' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
                <OnboardingScreen
                  step={onboardStep}
                  locale={locale}
                  onSetLocale={(id) => patch((s) => ({ ...s, user: { ...s.user, locale: id } }))}
                  onSetName={(name) => patch((s) => ({ ...s, user: { ...s.user, name } }))}
                  onSetCash={(n) => patch((s) => ({
                    ...s,
                    openingCash: n,
                    accounts: (s.accounts || []).map((a) => (a.id === 'cash' ? { ...a, opening: n } : a)),
                  }))}
                  onNext={() => {
                    if (onboardStep < 3) setOnboardStep((x) => x + 1);
                    else {
                      patch((s) => ({ ...s, onboardingComplete: true, startedAt: s.startedAt || todayISO() }));
                      setScreen('home');
                      setActiveTab('home');
                    }
                  }}
                />
              </div>
            )}

            {screen !== 'onboarding' && TABS.map((tab) => {
              const tabIdx = TABS.indexOf(tab);
              const activeIdx = TABS.indexOf(activeTab);
              const dir = tabIdx >= activeIdx ? '100%' : '-100%';
              return (
                <div key={tab} style={{
                  position: 'absolute', inset: 0,
                  transform: activeTab === tab ? 'translateX(0)' : `translateX(${dir})`,
                  transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
                  zIndex: activeTab === tab ? 2 : 1,
                }}>
                  {tab === 'home' && <HomeScreen store={store} onSelectTx={openDrawer} onNavigate={goTab} onAdd={() => { setEditTx(null); setScreen('addExpense'); }} />}
                  {tab === 'activity' && <ActivityScreen store={store} onSelectTx={openDrawer} onNavigate={goTab} />}
                  {tab === 'plan' && <PlanScreen store={store} onNavigate={goTab} />}
                  {tab === 'you' && (
                    <ProfileScreen
                      store={store}
                      onSetLocale={(id) => patch((s) => ({ ...s, user: { ...s.user, locale: id } }))}
                      onReset={resetAll}
                      onNavigate={goTab}
                      onExport={exportCsv}
                      onSaveAccount={saveAccount}
                      onDeleteAccount={deleteAccount}
                    />
                  )}
                  {tab === 'accounts' && (
                    <AccountsManagerScreen
                      store={store}
                      onBack={() => goTab('you')}
                      onSaveAccount={saveAccount}
                      onDeleteAccount={deleteAccount}
                      onReorder={reorderAccounts}
                    />
                  )}
                  {tab === 'categories' && (
                    <CategoriesManagerScreen
                      store={store}
                      onBack={() => goTab('you')}
                      onSaveCategory={saveCategory}
                      onDeleteCategory={deleteCategory}
                      onReorder={reorderCategory}
                      onToggleSubcategories={toggleSubcategories}
                    />
                  )}
                  {tab === 'budget' && <BudgetSetupScreen store={store} onSetBudget={setBudget} onSetAccountBudget={setAccountBudget} onSetIncome={(n) => patch((s) => ({ ...s, monthlyIncome: n }))} />}
                  {tab === 'goals' && <SavingsGoalsScreen />}
                  {tab === 'recurring' && <RecurringScreen />}
                  {tab === 'notifications' && <NotificationsScreen store={store} onBack={goBack} onMarkRead={(id) => patch((s) => ({ ...s, alertsRead: { ...s.alertsRead, [id]: true } }))} />}
                  {tab === 'categoryDetail' && <CategoryDetailScreen store={store} category={categoryArg} onBack={goBack} onSelectTx={openDrawer} />}
                  {tab === 'notionExpenses' && <NotionExpensesScreen store={store} onNavigate={goTab} />}
                  {tab === 'notionAccounts' && <NotionAccountsScreen store={store} onNavigate={goTab} />}
                  {tab === 'notionBudgets' && <NotionBudgetsScreen store={store} onNavigate={goTab} />}
                </div>
              );
            })}

            {screen !== 'onboarding' && (
              <div style={{
                position: 'absolute', inset: 0,
                zIndex: screen === 'addExpense' ? 20 : -1,
                transform: screen === 'addExpense' ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {screen === 'addExpense' && (
                  <AddExpenseScreen
                    store={store}
                    initial={editTx}
                    onClose={() => { setEditTx(null); setScreen(activeTab); }}
                    onSave={saveTxn}
                    onQuickAddAccount={(draft) => saveAccount(null, draft)}
                    onQuickAddCategory={(draft) => saveCategory(null, draft)}
                  />
                )}
              </div>
            )}

            {screen !== 'onboarding' && (
              <div style={{
                position: 'absolute', inset: 0,
                zIndex: screen === 'voiceEntry' ? 21 : -1,
                transform: screen === 'voiceEntry' ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {screen === 'voiceEntry' && (
                  <VoiceEntryScreen
                    locale={locale}
                    onClose={() => setScreen(activeTab)}
                    onManual={() => { setEditTx(null); setScreen('addExpense'); }}
                    onDraft={(draft) => { setEditTx(draft); setScreen('addExpense'); }}
                  />
                )}
              </div>
            )}

            {screen !== 'onboarding' && (
              <div style={{
                position: 'absolute', inset: 0,
                zIndex: screen === 'cameraScan' ? 21 : -1,
                transform: screen === 'cameraScan' ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {screen === 'cameraScan' && (
                  <CameraScanScreen
                    locale={locale}
                    onClose={() => setScreen(activeTab)}
                    onManual={() => { setEditTx(null); setScreen('addExpense'); }}
                    onDraft={(draft) => { setEditTx(draft); setScreen('addExpense'); }}
                  />
                )}
              </div>
            )}

            {fabOpen && showChrome && (
              <div onClick={() => setFabOpen(false)} style={{
                position: 'absolute', inset: 0, zIndex: 40,
                backdropFilter: 'blur(18px) brightness(0.88)',
                background: 'rgba(255,255,255,0.1)',
              }} />
            )}

            {showChrome && burstItems.map((item, i) => {
              const rad = (item.angle - 90) * Math.PI / 180;
              const dist = 108;
              const tx = Math.cos(rad) * dist;
              const ty = Math.sin(rad) * dist;
              return (
                <div key={item.label} style={{
                  position: 'absolute', bottom: 'calc(44px + env(safe-area-inset-bottom, 0px))', left: '50%', marginLeft: -28,
                  width: 56, height: 56, zIndex: 50,
                  transform: fabOpen ? `translate(${tx}px,${ty}px) scale(1)` : 'translate(0,0) scale(0.4)',
                  opacity: fabOpen ? 1 : 0,
                  transition: `transform 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s, opacity 0.25s ${i * 0.05}s`,
                  pointerEvents: fabOpen ? 'auto' : 'none',
                }}>
                  <button type="button" aria-label={item.label} onClick={item.action} style={{
                    width: 56, height: 56, borderRadius: 28,
                    background: 'rgba(22,22,30,0.88)', border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
                  }}>{item.label}</button>
                </div>
              );
            })}

            {showChrome && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
                minHeight: 86, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: 10,
                paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
                background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(24px)',
                borderTop: '0.5px solid rgba(15,23,42,0.08)',
              }}>
                <NavBtn label={t(locale, 'home')} active={activeTab === 'home' || activeTab === 'notionAccounts'} accent={accent} onClick={() => goTab('home')}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" stroke={activeTab === 'home' || activeTab === 'notionAccounts' ? accent : '#8E8E93'} strokeWidth="1.9" strokeLinejoin="round" fill={activeTab === 'home' || activeTab === 'notionAccounts' ? accent + '18' : 'none'}/></svg>}
                />
                <NavBtn label={t(locale, 'activity')} active={activeTab === 'activity' || activeTab === 'notionExpenses'} accent={accent} onClick={() => goTab('activity')}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h13" stroke={activeTab === 'activity' || activeTab === 'notionExpenses' ? accent : '#8E8E93'} strokeWidth="1.9" strokeLinecap="round"/></svg>}
                />
                <div style={{ width: 58 }} />
                <NavBtn label={t(locale, 'plan')} active={['plan', 'budget', 'goals', 'recurring', 'notionBudgets'].includes(activeTab)} accent={accent} onClick={() => goTab('plan')}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke={['plan', 'budget', 'goals', 'recurring', 'notionBudgets'].includes(activeTab) ? accent : '#8E8E93'} strokeWidth="1.9"/><path d="M8 12h8M8 16h5" stroke={['plan', 'budget', 'goals', 'recurring', 'notionBudgets'].includes(activeTab) ? accent : '#8E8E93'} strokeWidth="1.9" strokeLinecap="round"/></svg>}
                />
                <NavBtn label={t(locale, 'you')} active={['you', 'accounts', 'categories'].includes(activeTab)} accent={accent} onClick={() => goTab('you')}
                  icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke={['you', 'accounts', 'categories'].includes(activeTab) ? accent : '#8E8E93'} strokeWidth="1.9"/><path d="M5 19c1.4-3 4-4.5 7-4.5S17.6 16 19 19" stroke={['you', 'accounts', 'categories'].includes(activeTab) ? accent : '#8E8E93'} strokeWidth="1.9" strokeLinecap="round"/></svg>}
                />
              </div>
            )}

            {showChrome && (
              <button type="button" aria-label={t(locale, 'addTxn')} onClick={() => { setFabOpen((o) => !o); }} style={{
                position: 'absolute', bottom: 'calc(26px + env(safe-area-inset-bottom, 0px))', left: '50%', marginLeft: -29,
                width: 58, height: 58, borderRadius: 29,
                background: fabOpen ? '#1C1C2E' : accent, border: 'none', cursor: 'pointer', zIndex: 51,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: fabOpen ? '0 8px 32px rgba(0,0,0,0.4)' : `0 8px 24px ${accent}60`,
                transform: fabOpen ? 'rotate(45deg) scale(1.06)' : 'rotate(0deg) scale(1)',
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 3v16M3 11h16" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
              </button>
            )}

            {drawerTx && (
              <>
                <div onClick={closeDrawer} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.3)', opacity: drawerVisible ? 1 : 0, transition: 'opacity 0.3s' }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 61,
                  background: '#FFFFFF', borderRadius: '28px 28px 0 0', padding: '0 24px 40px',
                  transform: drawerVisible ? 'translateY(0)' : 'translateY(100%)',
                  transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 18px' }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0E0E0' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 17, background: (drawerCat ? drawerCat.color : '#007AFF') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: drawerCat ? drawerCat.color : '#007AFF' }}>
                        {String(drawerTx.merchant || '?').split(' ').slice(0, 2).map((w) => w[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 19, fontWeight: 800, color: '#1C1C1E', marginBottom: 3 }}>{drawerTx.merchant}</h2>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>{drawerCat ? catLabel(drawerCat, locale) : ''}</p>
                    </div>
                  </div>
                  <div style={{ background: '#F5F5F7', borderRadius: 18, padding: '16px', marginBottom: 12, textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800,
                      color: drawerTx.type === 'income' ? '#16A34A' : drawerTx.type === 'transfer' ? '#64748B' : '#FF3B30',
                    }}>
                      {drawerTx.type === 'income' ? '+' : drawerTx.type === 'transfer' ? '' : '−'}{fmt(drawerTx.amount)}
                    </p>
                  </div>
                  {[[t(locale, 'date'), relDate(drawerTx.date, locale)], [t(locale, 'category'), drawerCat ? catLabel(drawerCat, locale) : ''], [t(locale, 'method'), drawerTx.method || '—'], [t(locale, 'account'), acctLabel((store.accounts || []).find((a) => a.id === drawerTx.accountId), locale)]].map(([l, v], i, arr) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #F0F0F3' : 'none' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>{l}</span>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button
                      type="button"
                      aria-label={t(locale, 'edit')}
                      onClick={() => { setEditTx(drawerTx); closeDrawer(); setScreen('addExpense'); }}
                      style={{ flex: 1, padding: '14px', border: 'none', borderRadius: 14, background: '#E8F1FF', color: '#007AFF', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                    >{t(locale, 'edit')}</button>
                    <button
                      type="button"
                      aria-label={t(locale, 'delete')}
                      onClick={() => setConfirmDelete(true)}
                      style={{ flex: 1, padding: '14px', border: 'none', borderRadius: 14, background: '#FFF0F0', color: '#FF3B30', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
                    >{t(locale, 'delete')}</button>
                  </div>
                </div>
              </>
            )}

            {confirmDelete && drawerTx && (
              <ConfirmSheet
                title={t(locale, 'confirmDelete')}
                sub={t(locale, 'confirmDeleteSub')}
                confirmLabel={t(locale, 'delete')}
                cancelLabel={t(locale, 'cancel')}
                onCancel={() => setConfirmDelete(false)}
                onConfirm={() => deleteTxn(drawerTx.id)}
              />
            )}
          </div>
        </IOSDevice>

        {tweaksOpen && (
          <div style={{ position: 'absolute', bottom: 20, right: -220, width: 200, background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Tweaks</p>
            <button type="button" onClick={() => goTab('home')} style={{ width: '100%', padding: '8px', border: 'none', background: '#F5F5F7', borderRadius: 10, marginBottom: 6 }}>Home</button>
            <button type="button" onClick={() => { setScreen('onboarding'); setOnboardStep(0); }} style={{ width: '100%', padding: '8px', border: 'none', background: '#F5F5F7', borderRadius: 10 }}>Onboarding</button>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ZenithApp />);
