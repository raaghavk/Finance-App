// AddExpense.jsx — Expense / Income / Transfer. Scrollable form so chips never overlap the keypad.

function AddExpenseScreen({ store, onClose, onSave, initial, onQuickAddAccount, onQuickAddCategory }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const cats = (store && store.categories) || DEFAULT_CATEGORIES;
  const accounts = (store && store.accounts) || DEFAULT_ACCOUNTS;

  const [type, setType] = React.useState(initial && initial.type ? initial.type : 'expense');
  const [amount, setAmount] = React.useState(initial && initial.amount ? String(initial.amount) : '0');
  const [note, setNote] = React.useState(initial && (initial.note || initial.merchant) ? (initial.note || initial.merchant) : '');
  const [selectedCat, setSelectedCat] = React.useState(initial && initial.categoryId ? initial.categoryId : null);
  const [accountId, setAccountId] = React.useState(initial && initial.accountId ? initial.accountId : (accounts[0] && accounts[0].id) || 'cash');
  const [date, setDate] = React.useState(initial && initial.date ? initial.date : todayISO());
  const [saved, setSaved] = React.useState(false);
  const [receiptPhoto, setReceiptPhoto] = React.useState(initial && initial.receiptPhoto ? initial.receiptPhoto : '');
  const [quick, setQuick] = React.useState(null);
  const photoRef = React.useRef(null);

  const visibleCats = cats.filter((c) => {
    if (type === 'income') return c.type === 'income' || c.id === 'other' || c.id === 'cashback' || c.id === 'salary';
    if (type === 'transfer') return c.id === 'transfer' || c.id === 'other';
    return c.type === 'expense' || c.id === 'other';
  });
  const showSubs = type === 'expense' && (!store || store.showSubcategories !== false);
  const parentChips = visibleCats.filter((c) => (type === 'expense' ? !c.parentId : true));
  const selected = findCat({ categories: cats }, selectedCat);
  const selectedParentId = selected && selected.parentId ? selected.parentId : selectedCat;
  const childChips = showSubs ? visibleCats.filter((c) => c.parentId && c.parentId === selectedParentId) : [];

  React.useEffect(() => {
    if (type === 'transfer') setSelectedCat('transfer');
  }, [type]);

  const handleNum = (n) => {
    setAmount((prev) => {
      if (prev === '0' && n !== '.') return String(n);
      if (n === '.' && prev.includes('.')) return prev;
      if (prev.replace('.', '').length >= 7) return prev;
      return prev + n;
    });
  };

  const handleBack = () => {
    setAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1) || '0'));
  };

  const amt = parseFloat(amount) || 0;
  const canSave = amt > 0 && date && accountId && (type === 'transfer' || !!selectedCat);
  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSave = () => {
    if (!canSave || saved) return;
    setSaved(true);
    const cat = findCat({ categories: cats }, selectedCat);
    const merchant = note.trim() || (cat ? catLabel(cat, locale) : t(locale, 'addTxn'));
    const method = typeof methodForAccount === 'function' ? methodForAccount(selectedAccount) : 'UPI';
    onSave && onSave({
      id: initial && initial.id ? initial.id : newTxnId(),
      type,
      amount: amt,
      note: note.trim(),
      merchant,
      categoryId: selectedCat || 'other',
      accountId,
      method,
      date,
      receiptPhoto: receiptPhoto || undefined,
    });
  };

  const cat = findCat({ categories: cats }, selectedCat);
  const numpad = [[1, 2, 3], [4, 5, 6], [7, 8, 9], ['.', 0, '⌫']];
  const title = initial ? t(locale, 'edit') : t(locale, 'addTxn');
  const chip = (active, color) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
    flexShrink: 0, minHeight: 40,
    background: active ? (color || '#2563EB') : '#F2F5FA',
    color: active ? '#fff' : '#0F172A',
    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600,
  });

  return (
    <div style={{
      position: 'absolute', inset: 0, background: typeof ZENITH !== 'undefined' ? ZENITH.page : '#FFFFFF',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{
        paddingTop: 'var(--zenith-pad-top)', paddingLeft: 16, paddingRight: 16, paddingBottom: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button type="button" aria-label={t(locale, 'close')} onClick={onClose} style={{
          background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F5F5F7', border: 'none', borderRadius: 14,
          width: 44, height: 44, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="#121212" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>{title}</h2>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, flexShrink: 0 }}>
        {[['expense', t(locale, 'expense')], ['income', t(locale, 'income')], ['transfer', t(locale, 'transferType')]].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={type === id}
            onClick={() => setType(id)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: type === id ? (typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB') : (typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F5F5F7'),
              color: type === id ? '#fff' : '#1C1C1E',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 8px' }}>
        <div style={{ background: typeof ZENITH !== 'undefined' ? ZENITH.card : '#F5F5F7', borderRadius: 22, padding: '16px 16px 12px', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', textAlign: 'center' }}>
          {cat && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, marginBottom: 8,
              background: cat.color + '18',
            }}>
              <span aria-hidden="true">{cat.emoji}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: cat.color }}>{catLabel(cat, locale)}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 700, color: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB' }}>₹</span>
            <span style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: amount.length > 5 ? 36 : 48,
              fontWeight: 800, color: '#121212', letterSpacing: -2,
            }}>{amt === 0 ? '0' : amount}</span>
          </div>
          <input
            type="text"
            placeholder={t(locale, 'note')}
            aria-label={t(locale, 'note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#6E6E73',
              textAlign: 'center', width: '100%', marginTop: 6,
            }}
          />
          {receiptPhoto ? (
            <img src={receiptPhoto} alt="Attached receipt" style={{ marginTop: 10, width: 72, height: 72, objectFit: 'cover', borderRadius: 12 }} />
          ) : null}
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', margin: '14px 0 8px' }}>{t(locale, 'category')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {parentChips.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={selectedParentId === c.id}
              aria-label={catLabel(c, locale)}
              onClick={() => setSelectedCat(c.id)}
              style={chip(selectedParentId === c.id, c.color)}
            >
              <span aria-hidden="true">{c.emoji}</span>
              <span style={{ whiteSpace: 'nowrap' }}>{catLabel(c, locale)}</span>
            </button>
          ))}
          <button type="button" onClick={() => setQuick('category')} style={chip(false)}>
            + {t(locale, 'newCategory')}
          </button>
        </div>
        {childChips.length > 0 && (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', margin: '12px 0 8px' }}>{t(locale, 'subcategory')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {childChips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selectedCat === c.id}
                  aria-label={catLabel(c, locale)}
                  onClick={() => setSelectedCat(c.id)}
                  style={chip(selectedCat === c.id, c.color)}
                >
                  <span aria-hidden="true">{c.emoji}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{catLabel(c, locale)}</span>
                </button>
              ))}
              <button type="button" onClick={() => setQuick('subcategory')} style={chip(false)}>
                + {t(locale, 'newCategory')}
              </button>
            </div>
          </>
        )}

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', margin: '14px 0 8px' }}>{t(locale, 'account')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={accountId === a.id}
              onClick={() => setAccountId(a.id)}
              style={chip(accountId === a.id, typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB')}
            >{acctLabel(a, locale)}</button>
          ))}
          <button type="button" onClick={() => setQuick('account')} style={chip(false)}>
            + {t(locale, 'newAccount')}
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', marginTop: 14 }}>
          {t(locale, 'date')}
          <input
            type="date"
            aria-label={t(locale, 'date')}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '8px 10px',
              fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1C1C1E',
            }}
          />
        </label>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          capture="environment"
          aria-label={t(locale, 'attachPhoto')}
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            try {
              const dataUrl = typeof compressImageFile === 'function' ? await compressImageFile(file) : URL.createObjectURL(file);
              setReceiptPhoto(dataUrl);
            } catch (err) {
              setReceiptPhoto('');
            }
          }}
        />
        <button
          type="button"
          onClick={() => photoRef.current && photoRef.current.click()}
          style={{
            width: '100%', marginTop: 10, minHeight: 44, border: 'none', borderRadius: 12, cursor: 'pointer',
            background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F5F5F7',
            color: typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E',
            fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
          }}
        >{t(locale, 'attachPhoto')}</button>
      </div>

      <div style={{ flexShrink: 0, padding: '4px 16px 0' }}>
        {numpad.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
            {row.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === '⌫' ? t(locale, 'backspace') : String(key)}
                onClick={() => (key === '⌫' ? handleBack() : handleNum(key))}
                style={{
                  height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: key === '⌫' ? '#F0F0F3' : '#F5F5F7',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: key === '⌫' ? 16 : 20,
                  fontWeight: 700, color: '#121212',
                }}
              >{key}</button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ flexShrink: 0, padding: '6px 16px calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        {!selectedCat && type !== 'transfer' && amt > 0 && (
          <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#FF3B30', marginBottom: 8 }}>{t(locale, 'pickCategory')}</p>
        )}
        <button
          type="button"
          aria-label={t(locale, 'addAmount', { n: fmt(amt) })}
          disabled={!canSave}
          onClick={handleSave}
          style={{
            width: '100%', padding: '14px', borderRadius: 16, border: 'none',
            cursor: canSave ? 'pointer' : 'default',
            background: saved ? '#34D399' : (canSave ? (typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB') : '#E5E5EA'),
            color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800,
            boxShadow: canSave ? '0 8px 24px rgba(37,99,235,0.32)' : 'none',
          }}
        >
          {saved ? t(locale, 'save') : t(locale, 'addAmount', { n: fmt(amt) })}
        </button>
      </div>

      {quick === 'account' && typeof AccountForm === 'function' && (
        <AccountForm
          locale={locale}
          account={null}
          canDelete={false}
          onCancel={() => setQuick(null)}
          onSave={(draft) => {
            const created = onQuickAddAccount && onQuickAddAccount(draft);
            if (created && created.id) setAccountId(created.id);
            setQuick(null);
          }}
        />
      )}
      {(quick === 'category' || quick === 'subcategory') && typeof CategoryForm === 'function' && (
        <CategoryForm
          locale={locale}
          category={quick === 'subcategory' && selectedParentId ? { parentId: selectedParentId } : null}
          parents={parentChips.filter((c) => c.type === 'expense')}
          canDelete={false}
          onCancel={() => setQuick(null)}
          onSave={(draft) => {
            const created = onQuickAddCategory && onQuickAddCategory(draft);
            if (created && created.id) setSelectedCat(created.id);
            setQuick(null);
          }}
        />
      )}
    </div>
  );
}

Object.assign(window, { AddExpenseScreen });
