// Recurring.jsx — persisted bills that materialize into the ledger

function RecurringForm({ locale, store, rule, onSave, onCancel, onDelete }) {
  const [name, setName] = React.useState(rule && rule.name ? rule.name : '');
  const [amount, setAmount] = React.useState(rule && rule.amount ? String(rule.amount) : '');
  const [categoryId, setCategoryId] = React.useState(rule && rule.categoryId ? rule.categoryId : ((store.categories || []).find((c) => c.type === 'expense' && c.parentId) || {}).id || 'other');
  const [accountId, setAccountId] = React.useState(rule && rule.accountId ? rule.accountId : ((store.accounts || [])[0] || {}).id);
  const [cadence, setCadence] = React.useState(rule && rule.cadence ? rule.cadence : 'monthly');
  const [nextOn, setNextOn] = React.useState(rule && rule.nextOn ? rule.nextOn : todayISO());
  const ok = name.trim().length > 0 && (parseFloat(amount) || 0) > 0;
  const muted = ZENITH.muted;
  const accent = ZENITH.accent;
  const cats = (store.categories || []).filter((c) => c.type === 'expense' && c.parentId);

  return (
    <MoneySheet title={rule && rule.id ? t(locale, 'edit') : t(locale, 'addRecurring')} onClose={onCancel} footer={(
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {rule && rule.id && onDelete ? (
          <button type="button" onClick={onDelete} style={{
            padding: '14px 16px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer',
          }}>{t(locale, 'delete')}</button>
        ) : null}
        <button type="button" disabled={!ok} onClick={() => onSave({
          name: name.trim(), amount: parseFloat(amount) || 0, categoryId, accountId, cadence, nextOn, active: true, type: 'expense',
        })} style={{
          flex: 1, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
          background: ok ? accent : '#E5E5EA', color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}>{t(locale, 'saveChanges')}</button>
      </div>
    )}>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 6 }}>{t(locale, 'recurringName')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix, rent, SIP…" style={moneyInputStyle()} />
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'addAmount', { n: '' }).replace(/\s+$/, '') || 'Amount'}</label>
      <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="649" style={moneyInputStyle()} />
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'category')}</label>
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={moneyInputStyle()}>
        {cats.map((c) => <option key={c.id} value={c.id}>{catLabel(c, locale)}</option>)}
      </select>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'account')}</label>
      <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={moneyInputStyle()}>
        {(store.accounts || []).map((a) => <option key={a.id} value={a.id}>{acctLabel(a, locale)}</option>)}
      </select>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'cadence')}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['weekly', t(locale, 'cadenceWeekly')], ['monthly', t(locale, 'cadenceMonthly')], ['yearly', t(locale, 'cadenceYearly')]].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setCadence(id)} style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 12, cursor: 'pointer',
            background: cadence === id ? accent : ZENITH.cream, color: cadence === id ? '#fff' : ZENITH.ink,
            fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
          }}>{label}</button>
        ))}
      </div>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'nextOn')}</label>
      <input type="date" value={nextOn} onChange={(e) => setNextOn(e.target.value)} style={moneyInputStyle()} />
    </MoneySheet>
  );
}

function RecurringScreen({ store, onSaveRule, onDeleteRule, onToggleRule, onBack }) {
  const locale = store.user.locale || 'en';
  const items = store.recurring || [];
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [sheet, setSheet] = React.useState(null);
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;

  const monthly = items.filter((i) => i.active && i.cadence === 'monthly').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const yearly = items.filter((i) => i.active && i.cadence === 'yearly').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const weekly = items.filter((i) => i.active && i.cadence === 'weekly').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const monthlyEquiv = Math.round(monthly + yearly / 12 + weekly * 4.33);

  const daysUntil = (dateStr) => {
    const today = new Date(todayISO() + 'T12:00:00');
    const d = new Date(dateStr + 'T12:00:00');
    return Math.ceil((d - today) / 86400000);
  };
  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.cadence === activeFilter);
  const urgency = (days) => {
    if (days <= 2) return '#EF4444';
    if (days <= 7) return ZENITH.warn;
    return muted;
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader title={t(locale, 'recurring')} leftLabel="‹" onLeft={onBack} rightLabel={t(locale, 'addRecurring')} onRight={() => setSheet({})} />
      ) : null}

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ background: card, borderRadius: 22, padding: '20px 22px', boxShadow: zenithSoftShadow() }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, borderRight: '1px solid ' + ZENITH.cream, paddingRight: 18 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{t(locale, 'monthlyCost')}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: ink }}>{fmt(monthlyEquiv)}</p>
            </div>
            <div style={{ flex: 1, paddingLeft: 18 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{t(locale, 'activeSubs')}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 800, color: accent }}>{items.filter((i) => i.active).length}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: muted, marginTop: 3 }}>{items.filter((i) => !i.active).length} {t(locale, 'paused')}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 10px', display: 'flex', gap: 8 }}>
        {[['all', t(locale, 'all')], ['monthly', t(locale, 'cadenceMonthly')], ['yearly', t(locale, 'cadenceYearly')]].map(([val, label]) => (
          <button key={val} type="button" onClick={() => setActiveFilter(val)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: activeFilter === val ? accent : card, color: activeFilter === val ? '#FFFFFF' : ink,
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, boxShadow: zenithSoftShadow(),
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {filtered.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted, padding: '12px 4px' }}>
            {locale === 'hi' ? 'किराया, Netflix, SIP जोड़ें — देय होने पर बही में लिख जाएँगे।' : 'Add rent, Netflix, SIPs — they post to the ledger when due.'}
          </p>
        ) : (
          <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
            {filtered.map((item, i) => {
              const days = daysUntil(item.nextOn);
              const cat = findCat(store, item.categoryId);
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                  borderBottom: i < filtered.length - 1 ? '1px solid ' + ZENITH.cream : 'none',
                  opacity: item.active ? 1 : 0.45,
                }}>
                  <button type="button" onClick={() => setSheet(item)} style={{
                    width: 42, height: 42, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: (cat ? cat.color : accent) + '18', fontSize: 18, flexShrink: 0,
                  }}>{cat ? cat.emoji : '🔄'}</button>
                  <div style={{ flex: 1, minWidth: 0 }} onClick={() => setSheet(item)} role="button" tabIndex={0}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink, marginBottom: 3 }}>{item.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: urgency(days), fontWeight: 600 }}>
                      {cat ? catLabel(cat, locale) : ''} · {days <= 0 ? (locale === 'hi' ? 'आज' : 'Today') : days + 'd'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 8 }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink }}>{fmt(item.amount)}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted }}>{item.cadence}</p>
                  </div>
                  <button type="button" aria-label="toggle" onClick={() => onToggleRule && onToggleRule(item.id)} style={{
                    width: 44, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0, border: 'none',
                    background: item.active ? ZENITH.live : ZENITH.cream, position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: item.active ? 21 : 3,
                      width: 20, height: 20, borderRadius: 10, background: '#FFFFFF',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'block',
                    }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sheet && (
        <RecurringForm
          locale={locale}
          store={store}
          rule={sheet.id ? sheet : null}
          onCancel={() => setSheet(null)}
          onDelete={sheet.id ? () => { onDeleteRule && onDeleteRule(sheet.id); setSheet(null); } : undefined}
          onSave={(draft) => { onSaveRule && onSaveRule(sheet.id || null, draft); setSheet(null); }}
        />
      )}
    </div>
  );
}

Object.assign(window, { RecurringScreen, RecurringForm });
