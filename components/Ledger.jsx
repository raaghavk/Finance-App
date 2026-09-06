// Ledger.jsx — Accounts, merchants, and custom category manager

function ScreenHeader({ locale, title, onBack, actionLabel, onAction }) {
  return (
    <div style={{ padding: '70px 20px 12px' }}>
      <button type="button" aria-label={t(locale, 'close')} onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}>
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true"><path d="M7 1L1 7l6 6" stroke="#007AFF" strokeWidth="1.8" strokeLinecap="round"/></svg>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#007AFF', fontWeight: 500 }}>{locale === 'hi' ? 'वापस' : 'Back'}</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.4 }}>{title}</h1>
        {onAction && (
          <button type="button" onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: '#007AFF' }}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

function textInput(value, onChange, placeholder, extra) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 12, padding: '12px 14px',
        fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', outline: 'none',
        ...(extra || {}),
      }}
    />
  );
}

function AccountsScreen({ store, onBack, onSaveAccount, onDeleteAccount }) {
  const locale = store.user.locale || 'en';
  const [editing, setEditing] = React.useState(null);
  const [name, setName] = React.useState('');
  const [kind, setKind] = React.useState('bank');
  const [last4, setLast4] = React.useState('');
  const [opening, setOpening] = React.useState('');
  const [upiId, setUpiId] = React.useState('');

  const openNew = () => {
    setEditing({ id: '' });
    setName('');
    setKind('bank');
    setLast4('');
    setOpening('');
    setUpiId('');
  };

  const openEdit = (a) => {
    setEditing(a);
    setName(a.name || '');
    setKind(a.type || 'bank');
    setLast4(a.last4 || '');
    setOpening(String(a.opening != null ? a.opening : ''));
    setUpiId(a.upiId || '');
  };

  const save = () => {
    if (!name.trim()) return;
    const row = {
      id: editing && editing.id ? editing.id : newAccountId(),
      name: name.trim(),
      nameHi: (editing && editing.nameHi) || name.trim(),
      type: kind,
      last4: last4.replace(/\D/g, '').slice(-4),
      opening: parseFloat(opening) || 0,
      upiId: upiId.trim(),
      custom: !(editing && ['cash', 'bank', 'card'].includes(editing.id)),
    };
    onSaveAccount && onSaveAccount(row);
    setEditing(null);
  };

  const worth = netWorth(store);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingBottom: 110 }}>
      <ScreenHeader locale={locale} title={t(locale, 'accounts')} onBack={onBack} actionLabel={'+ ' + t(locale, 'addAccount')} onAction={openNew} />
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: '#1C1C1E', borderRadius: 22, padding: '18px 20px', marginBottom: 14 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{t(locale, 'netWorth')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 800, color: '#fff', marginTop: 4 }}>{fmt(worth)}</p>
        </div>
        {(store.accounts || []).map((a) => {
          const bal = accountBalance(store, a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => openEdit(a)}
              style={{
                width: '100%', textAlign: 'left', background: '#fff', border: 'none', borderRadius: 18,
                padding: '16px', marginBottom: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1C1C1E' }}>{acctLabel(a, locale)}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', marginTop: 3 }}>
                  {railForAccount(a)}
                  {a.last4 ? ' · ····' + a.last4 : ''}
                  {a.upiId ? ' · ' + a.upiId : ''}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: a.type === 'card' ? '#FF3B30' : '#16A34A' }}>{fmt(bal)}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{a.type === 'card' ? t(locale, 'cardOutstanding') : t(locale, 'available')}</p>
              </div>
            </button>
          );
        })}
      </div>

      {editing && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: 'absolute', inset: 0, zIndex: 8, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 9, background: '#fff', borderRadius: 22, padding: '20px 18px 16px' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, marginBottom: 14 }}>{editing.id ? t(locale, 'editAccount') : t(locale, 'addAccount')}</p>
            <Field label={t(locale, 'account')}>{textInput(name, setName, locale === 'hi' ? 'HDFC, नकद…' : 'HDFC, Wallet…')}</Field>
            <Field label={t(locale, 'accountType')}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['cash', t(locale, 'cashType')], ['bank', t(locale, 'bankType')], ['card', t(locale, 'cardType')]].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setKind(id)} style={{
                    flex: 1, padding: '10px', border: 'none', borderRadius: 12, cursor: 'pointer',
                    background: kind === id ? '#007AFF' : '#F5F5F7', color: kind === id ? '#fff' : '#1C1C1E',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                  }}>{label}</button>
                ))}
              </div>
            </Field>
            <Field label={t(locale, 'openingBalance')}>{textInput(opening, setOpening, '0')}</Field>
            {kind !== 'cash' && <Field label={t(locale, 'last4')}>{textInput(last4, setLast4, '1234')}</Field>}
            {kind === 'bank' && <Field label={t(locale, 'upiId')}>{textInput(upiId, setUpiId, 'you@oksbi')}</Field>}
            <div style={{ display: 'flex', gap: 10 }}>
              {editing.custom && editing.id && (
                <button type="button" onClick={() => { onDeleteAccount && onDeleteAccount(editing.id); setEditing(null); }} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#FFF0F0', color: '#FF3B30', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'delete')}</button>
              )}
              <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#F2F2F7', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'cancel')}</button>
              <button type="button" onClick={save} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#007AFF', color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'save')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MerchantsScreen({ store, onBack, onSaveMerchant, onDeleteMerchant, onSelectTx }) {
  const locale = store.user.locale || 'en';
  const [editing, setEditing] = React.useState(null);
  const [name, setName] = React.useState('');
  const [upi, setUpi] = React.useState('');
  const [catId, setCatId] = React.useState('');
  const [acctId, setAcctId] = React.useState('');
  const [openId, setOpenId] = React.useState(null);

  const merchants = [...(store.merchants || [])].sort((a, b) => merchantSpend(store, b.id) - merchantSpend(store, a.id));

  const openNew = () => {
    setEditing({ id: '' });
    setName('');
    setUpi('');
    setCatId('');
    setAcctId((store.accounts[0] && store.accounts[0].id) || '');
  };

  const openEdit = (m) => {
    setEditing(m);
    setName(m.name || '');
    setUpi(m.upiVpa || '');
    setCatId(m.defaultCategoryId || '');
    setAcctId(m.lastAccountId || '');
  };

  const save = () => {
    if (!name.trim()) return;
    onSaveMerchant && onSaveMerchant({
      id: editing && editing.id ? editing.id : newMerchantId(),
      name: name.trim(),
      upiVpa: upi.trim(),
      defaultCategoryId: catId,
      lastAccountId: acctId,
    });
    setEditing(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingBottom: 110 }}>
      <ScreenHeader locale={locale} title={t(locale, 'merchants')} onBack={onBack} actionLabel={'+ ' + t(locale, 'addMerchant')} onAction={openNew} />
      <div style={{ padding: '0 20px' }}>
        {merchants.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93', padding: '20px 8px' }}>{t(locale, 'noMerchants')}</p>
        ) : merchants.map((m) => {
          const spent = merchantSpend(store, m.id);
          const acct = findAccount(store, m.lastAccountId);
          const cat = findCat(store, m.defaultCategoryId);
          const txs = (store.transactions || []).filter((tx) => tx.merchantId === m.id || String(tx.merchant || '').toLowerCase() === m.name.toLowerCase());
          const open = openId === m.id;
          return (
            <div key={m.id} style={{ background: '#fff', borderRadius: 18, marginBottom: 10, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : m.id)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
              >
                <div>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800 }}>{m.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', marginTop: 3 }}>
                    {m.upiVpa || '—'} · {acct ? acctLabel(acct, locale) : t(locale, 'yourAccount')}
                    {cat ? ' · ' + catLabel(cat, locale) : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#FF3B30' }}>{fmt(spent)}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93' }}>{t(locale, 'spentWith')}</p>
                </div>
              </button>
              {open && (
                <div style={{ padding: '0 16px 14px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <button type="button" onClick={() => openEdit(m)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 12, background: '#E8F1FF', color: '#007AFF', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'edit')}</button>
                    <button type="button" onClick={() => onDeleteMerchant && onDeleteMerchant(m.id)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 12, background: '#FFF0F0', color: '#FF3B30', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'delete')}</button>
                  </div>
                  {txs.slice(0, 8).map((tx) => (
                    <div key={tx.id} role="button" tabIndex={0} onClick={() => onSelectTx && onSelectTx(tx)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', cursor: 'pointer' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>{relDate(tx.date, locale)}</span>
                      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800 }}>{fmt(tx.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <>
          <div onClick={() => setEditing(null)} style={{ position: 'absolute', inset: 0, zIndex: 8, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 9, background: '#fff', borderRadius: 22, padding: '20px 18px 16px' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, marginBottom: 14 }}>{editing.id ? t(locale, 'editMerchant') : t(locale, 'addMerchant')}</p>
            <Field label={t(locale, 'merchant')}>{textInput(name, setName, t(locale, 'merchantPh'))}</Field>
            <Field label={t(locale, 'merchantUpi')}>{textInput(upi, setUpi, t(locale, 'merchantUpiPh'))}</Field>
            <Field label={t(locale, 'category')}>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {(store.categories || []).filter((c) => c.type === 'expense').map((c) => (
                  <button key={c.id} type="button" onClick={() => setCatId(c.id)} style={{
                    flexShrink: 0, padding: '8px 10px', border: 'none', borderRadius: 12, cursor: 'pointer',
                    background: catId === c.id ? c.color : '#F5F5F7', color: catId === c.id ? '#fff' : '#1C1C1E',
                    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                  }}>{c.emoji} {catLabel(c, locale)}</button>
                ))}
              </div>
            </Field>
            <Field label={t(locale, 'defaultAccount')}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(store.accounts || []).map((a) => (
                  <button key={a.id} type="button" onClick={() => setAcctId(a.id)} style={{
                    flex: 1, padding: '10px 6px', border: 'none', borderRadius: 12, cursor: 'pointer',
                    background: acctId === a.id ? '#E8F1FF' : '#F5F5F7', color: acctId === a.id ? '#007AFF' : '#3C3C43',
                    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
                  }}>{acctLabel(a, locale)}</button>
                ))}
              </div>
            </Field>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#F2F2F7', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'cancel')}</button>
              <button type="button" onClick={save} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#007AFF', color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'save')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CategoriesManageScreen({ store, onBack, onSaveCategory, onDeleteCategory }) {
  const locale = store.user.locale || 'en';
  const [sheet, setSheet] = React.useState(false);
  const [name, setName] = React.useState('');
  const [emoji, setEmoji] = React.useState('✦');
  const [color, setColor] = React.useState('#007AFF');
  const [kind, setKind] = React.useState('expense');

  const save = () => {
    if (!name.trim()) return;
    onSaveCategory && onSaveCategory({
      id: newCatId(),
      name: name.trim(),
      nameHi: name.trim(),
      emoji,
      color,
      type: kind,
      group: 'life',
      custom: true,
    });
    setSheet(false);
    setName('');
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingBottom: 110 }}>
      <ScreenHeader locale={locale} title={t(locale, 'categories')} onBack={onBack} actionLabel={t(locale, 'addCustom')} onAction={() => setSheet(true)} />
      <div style={{ padding: '0 20px' }}>
        {(store.categories || []).map((c) => (
          <div key={c.id} style={{
            background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800 }}>{catLabel(c, locale)}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{c.custom ? t(locale, 'customCategory') : c.type}</p>
            </div>
            {c.custom && (
              <button type="button" onClick={() => onDeleteCategory && onDeleteCategory(c.id)} style={{ border: 'none', background: '#FFF0F0', color: '#FF3B30', borderRadius: 10, padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'delete')}</button>
            )}
          </div>
        ))}
      </div>
      {sheet && (
        <>
          <div onClick={() => setSheet(false)} style={{ position: 'absolute', inset: 0, zIndex: 8, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 9, background: '#fff', borderRadius: 22, padding: '20px 18px 16px' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, marginBottom: 12 }}>{t(locale, 'newCategory')}</p>
            {textInput(name, setName, t(locale, 'catName'), { marginBottom: 12 })}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[['expense', t(locale, 'expense')], ['income', t(locale, 'income')]].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setKind(id)} style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 12, cursor: 'pointer',
                  background: kind === id ? '#007AFF' : '#F5F5F7', color: kind === id ? '#fff' : '#1C1C1E',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
                }}>{label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10 }}>
              {CAT_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setEmoji(e)} style={{
                  width: 36, height: 36, borderRadius: 10, border: emoji === e ? '2px solid #007AFF' : '1px solid #E5E5EA',
                  background: '#F5F5F7', cursor: 'pointer', fontSize: 18,
                }}>{e}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {CAT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{
                  width: 26, height: 26, borderRadius: 13, border: color === c ? '2px solid #1C1C1E' : 'none',
                  background: c, cursor: 'pointer',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setSheet(false)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#F2F2F7', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'cancel')}</button>
              <button type="button" onClick={save} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#007AFF', color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'save')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { AccountsScreen, MerchantsScreen, CategoriesManageScreen });
