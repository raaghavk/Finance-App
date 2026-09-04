// AddExpense.jsx — Expense / Income / Transfer with account, date, method

function AddExpenseScreen({ store, onClose, onSave, initial }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const cats = (store && store.categories) || DEFAULT_CATEGORIES;
  const accounts = (store && store.accounts) || DEFAULT_ACCOUNTS;

  const [type, setType] = React.useState(initial && initial.type ? initial.type : 'expense');
  const [amount, setAmount] = React.useState(initial && initial.amount ? String(initial.amount) : '0');
  const [note, setNote] = React.useState(initial && (initial.note || initial.merchant) ? (initial.note || initial.merchant) : '');
  const [selectedCat, setSelectedCat] = React.useState(initial && initial.categoryId ? initial.categoryId : null);
  const [accountId, setAccountId] = React.useState(initial && initial.accountId ? initial.accountId : 'cash');
  const [method, setMethod] = React.useState(initial && initial.method ? initial.method : 'UPI');
  const [date, setDate] = React.useState(initial && initial.date ? initial.date : todayISO());
  const [saved, setSaved] = React.useState(false);

  const visibleCats = cats.filter((c) => {
    if (type === 'income') return c.type === 'income' || c.id === 'other' || c.id === 'cashback' || c.id === 'salary';
    if (type === 'transfer') return c.id === 'transfer' || c.id === 'other';
    return c.type === 'expense' || c.id === 'other';
  });

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

  const handleSave = () => {
    if (!canSave || saved) return;
    setSaved(true);
    const cat = findCat({ categories: cats }, selectedCat);
    const merchant = note.trim() || (cat ? catLabel(cat, locale) : t(locale, 'addTxn'));
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
    });
  };

  const cat = findCat({ categories: cats }, selectedCat);
  const numpad = [[1, 2, 3], [4, 5, 6], [7, 8, 9], ['.', 0, '⌫']];
  const title = initial ? t(locale, 'edit') : t(locale, 'addTxn');

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 72, paddingLeft: 24, paddingRight: 24, paddingBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" aria-label={t(locale, 'close')} onClick={onClose} style={{
          background: '#F5F5F7', border: 'none', borderRadius: 14,
          width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="#121212" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212' }}>{title}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 20px 10px', display: 'flex', gap: 8 }}>
        {[['expense', t(locale, 'expense')], ['income', t(locale, 'income')], ['transfer', t(locale, 'transferType')]].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={type === id}
            onClick={() => setType(id)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: type === id ? '#007AFF' : '#F5F5F7',
              color: type === id ? '#fff' : '#1C1C1E',
              fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ padding: '8px 24px 4px', textAlign: 'center' }}>
        <div style={{ background: '#F5F5F7', borderRadius: 22, padding: '18px 16px' }}>
          {cat && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20, marginBottom: 10,
              background: cat.color + '18',
            }}>
              <span aria-hidden="true">{cat.emoji}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: cat.color }}>{catLabel(cat, locale)}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 32, fontWeight: 700, color: '#007AFF' }}>₹</span>
            <span style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: amount.length > 5 ? 40 : 56,
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
              textAlign: 'center', width: '100%', marginTop: 8,
            }}
          />
        </div>
      </div>

      <div style={{ padding: '6px 16px', overflowX: 'auto', display: 'flex', gap: 8 }}>
        {visibleCats.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={selectedCat === c.id}
            aria-label={catLabel(c, locale)}
            onClick={() => setSelectedCat(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              flexShrink: 0,
              background: selectedCat === c.id ? c.color : '#F5F5F7',
            }}
          >
            <span aria-hidden="true">{c.emoji}</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: selectedCat === c.id ? '#fff' : '#121212', whiteSpace: 'nowrap' }}>{catLabel(c, locale)}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '4px 20px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={accountId === a.id}
              onClick={() => setAccountId(a.id)}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: accountId === a.id ? '#E8F1FF' : '#F5F5F7',
                color: accountId === a.id ? '#007AFF' : '#3C3C43',
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
              }}
            >{acctLabel(a, locale)}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['UPI', 'Card', 'Cash'].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={method === m}
              onClick={() => setMethod(m)}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: method === m ? '#E8F1FF' : '#F5F5F7',
                color: method === m ? '#007AFF' : '#3C3C43',
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
              }}
            >{m}</button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>
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
      </div>

      <div style={{ flex: 1, padding: '4px 20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {numpad.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            {row.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === '⌫' ? t(locale, 'backspace') : String(key)}
                onClick={() => (key === '⌫' ? handleBack() : handleNum(key))}
                style={{
                  height: 52, borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: key === '⌫' ? '#F0F0F3' : '#F5F5F7',
                  fontFamily: 'Manrope, sans-serif',
                  fontSize: key === '⌫' ? 18 : 22,
                  fontWeight: 700, color: '#121212',
                }}
              >{key}</button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 20px 28px' }}>
        {!selectedCat && type !== 'transfer' && amt > 0 && (
          <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#FF3B30', marginBottom: 8 }}>{t(locale, 'pickCategory')}</p>
        )}
        <button
          type="button"
          aria-label={t(locale, 'addAmount', { n: fmt(amt) })}
          disabled={!canSave}
          onClick={handleSave}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
            cursor: canSave ? 'pointer' : 'default',
            background: saved ? '#34D399' : (canSave ? '#007AFF' : '#E5E5EA'),
            color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800,
            boxShadow: canSave ? '0 8px 24px rgba(0,122,255,0.35)' : 'none',
          }}
        >
          {saved ? t(locale, 'save') : t(locale, 'addAmount', { n: fmt(amt) })}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { AddExpenseScreen });
