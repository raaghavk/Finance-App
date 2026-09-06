// AddExpense.jsx — Money Manager add/edit: merchant, UPI, one account, photo, voice

function AddExpenseScreen({ store, onClose, onSave, onAddCategory, initial, startMode }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const cats = (store && store.categories) || DEFAULT_CATEGORIES;
  const accounts = (store && store.accounts) || DEFAULT_ACCOUNTS;
  const merchants = (store && store.merchants) || [];

  const [type, setType] = React.useState(initial && initial.type ? initial.type : 'expense');
  const [amount, setAmount] = React.useState(initial && initial.amount ? String(initial.amount) : '0');
  const [merchant, setMerchant] = React.useState(initial && initial.merchant ? initial.merchant : '');
  const [merchantUpi, setMerchantUpi] = React.useState(initial && initial.merchantUpi ? initial.merchantUpi : '');
  const [merchantId, setMerchantId] = React.useState(initial && initial.merchantId ? initial.merchantId : '');
  const [note, setNote] = React.useState(initial && initial.note ? initial.note : '');
  const [selectedCat, setSelectedCat] = React.useState(initial && initial.categoryId ? initial.categoryId : null);
  const [accountId, setAccountId] = React.useState(initial && initial.accountId ? initial.accountId : (accounts[0] && accounts[0].id) || 'cash');
  const [toAccountId, setToAccountId] = React.useState(initial && initial.toAccountId ? initial.toAccountId : '');
  const [date, setDate] = React.useState(initial && initial.date ? initial.date : todayISO());
  const [receiptThumb, setReceiptThumb] = React.useState(initial && initial.receiptThumb ? initial.receiptThumb : '');
  const [voiceText, setVoiceText] = React.useState(initial && initial.voiceText ? initial.voiceText : '');
  const [padOpen, setPadOpen] = React.useState(!(initial && initial.amount));
  const [saved, setSaved] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [voiceErr, setVoiceErr] = React.useState('');
  const [showMerch, setShowMerch] = React.useState(false);
  const [catSheet, setCatSheet] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatEmoji, setNewCatEmoji] = React.useState('✦');
  const [newCatColor, setNewCatColor] = React.useState('#007AFF');
  const fileRef = React.useRef(null);
  const recRef = React.useRef(null);

  const visibleCats = cats.filter((c) => {
    if (type === 'income') return c.type === 'income' || c.id === 'other' || c.id === 'cashback' || c.id === 'salary';
    if (type === 'transfer') return c.id === 'transfer' || c.id === 'other';
    return c.type === 'expense' || c.id === 'other';
  });

  React.useEffect(() => {
    if (type === 'transfer') setSelectedCat('transfer');
  }, [type]);

  React.useEffect(() => {
    if (startMode === 'photo') {
      setTimeout(() => { if (fileRef.current) fileRef.current.click(); }, 280);
    }
    if (startMode === 'voice') {
      setTimeout(() => startVoice(), 280);
    }
    return () => stopVoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickMerchant = (m) => {
    setMerchant(m.name);
    setMerchantId(m.id);
    setMerchantUpi(m.upiVpa || '');
    if (m.defaultCategoryId && type !== 'transfer') setSelectedCat(m.defaultCategoryId);
    if (m.lastAccountId) setAccountId(m.lastAccountId);
    setShowMerch(false);
  };

  const merchMatches = merchants.filter((m) => {
    if (!merchant.trim()) return true;
    const q = merchant.toLowerCase();
    return m.name.toLowerCase().includes(q) || String(m.upiVpa || '').toLowerCase().includes(q);
  }).slice(0, 6);

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

  const stopVoice = () => {
    setListening(false);
    try { if (recRef.current) recRef.current.stop(); } catch (e) { /* ignore */ }
    recRef.current = null;
  };

  const startVoice = () => {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      setVoiceErr(t(locale, 'voiceNeedMic'));
      return;
    }
    stopVoice();
    setVoiceErr('');
    const rec = new Rec();
    rec.lang = locale === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onerror = () => {
      setListening(false);
      setVoiceErr(t(locale, 'voiceNeedMic'));
    };
    rec.onend = () => setListening(false);
    rec.onresult = (ev) => {
      const said = ev.results && ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : '';
      const parsed = parseVoiceUtterance(said);
      setVoiceText(said);
      if (parsed.amount > 0) setAmount(String(parsed.amount));
      if (parsed.merchant) {
        setMerchant(parsed.merchant);
        const known = findMerchant(store, parsed.merchant);
        if (known) pickMerchant(known);
      }
      const hint = hintCategoryFromText(said + ' ' + parsed.merchant, cats);
      if (hint && type !== 'transfer') setSelectedCat(hint);
      setPadOpen(false);
    };
    recRef.current = rec;
    try { rec.start(); } catch (e) { setVoiceErr(t(locale, 'voiceNeedMic')); }
  };

  const onPickPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    compressImageFile(file, (data) => { if (data) setReceiptThumb(data); });
    e.target.value = '';
  };

  const saveCustomCat = () => {
    const name = newCatName.trim();
    if (!name || !onAddCategory) return;
    const id = newCatId();
    const cat = {
      id,
      name,
      nameHi: name,
      emoji: newCatEmoji,
      color: newCatColor,
      type: type === 'income' ? 'income' : 'expense',
      group: 'life',
      custom: true,
    };
    onAddCategory(cat);
    setSelectedCat(id);
    setCatSheet(false);
    setNewCatName('');
  };

  const amt = parseFloat(amount) || 0;
  const fromAcct = findAccount(store, accountId);
  const canSave = amt > 0 && date && accountId && (type === 'transfer' ? !!toAccountId && toAccountId !== accountId : !!selectedCat);

  const handleSave = () => {
    if (!canSave || saved) return;
    setSaved(true);
    const cat = findCat({ categories: cats }, selectedCat);
    const merchantName = merchant.trim() || (type === 'transfer'
      ? (acctLabel(fromAcct, locale) + ' → ' + acctLabel(findAccount(store, toAccountId), locale))
      : (cat ? catLabel(cat, locale) : t(locale, 'addTxn')));
    onSave && onSave({
      id: initial && initial.id ? initial.id : newTxnId(),
      type,
      amount: amt,
      note: note.trim(),
      merchant: merchantName,
      merchantId,
      merchantUpi: merchantUpi.trim(),
      categoryId: selectedCat || (type === 'transfer' ? 'transfer' : 'other'),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : '',
      method: railForAccount(fromAcct),
      date,
      receiptThumb,
      voiceText,
    });
  };

  const cat = findCat({ categories: cats }, selectedCat);
  const numpad = [[1, 2, 3], [4, 5, 6], [7, 8, 9], ['.', 0, '⌫']];
  const title = initial ? t(locale, 'edit') : t(locale, 'addTxn');

  const chip = (active, onClick, label, key, extra) => (
    <button
      key={key}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        flexShrink: 0, padding: '8px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: active ? '#E8F1FF' : '#F5F5F7',
        color: active ? '#007AFF' : '#3C3C43',
        fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700,
        ...(extra || {}),
      }}
    >{label}</button>
  );

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" aria-label={t(locale, 'voice')} onClick={() => listening ? stopVoice() : startVoice()} style={{
            width: 40, height: 40, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: listening ? '#FF3B30' : '#F5F5F7',
            color: listening ? '#fff' : '#1C1C1E',
            fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 800,
          }}>🎙</button>
        </div>
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

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: padOpen ? 268 : 8 }}>
        <div style={{ padding: '4px 20px 10px' }}>
          <button
            type="button"
            aria-label={t(locale, 'tapAmount')}
            onClick={() => setPadOpen((v) => !v)}
            style={{
              width: '100%', background: '#F5F5F7', borderRadius: 22, padding: '16px 16px 14px',
              border: 'none', cursor: 'pointer', textAlign: 'center',
            }}
          >
            {cat && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20, marginBottom: 8,
                background: cat.color + '18',
              }}>
                <span aria-hidden="true">{cat.emoji}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: cat.color }}>{catLabel(cat, locale)}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 700, color: '#007AFF' }}>₹</span>
              <span style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: amount.length > 5 ? 36 : 48,
                fontWeight: 800, color: '#121212', letterSpacing: -2,
              }}>{amt === 0 ? '0' : amount}</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', marginTop: 4 }}>
              {listening ? t(locale, 'listening') : t(locale, 'tapAmount')}
            </p>
          </button>
          {(voiceText || voiceErr) && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: voiceErr ? '#FF3B30' : '#6E6E73', textAlign: 'center', marginTop: 8 }}>
              {voiceErr || (t(locale, 'voiceGot') + ': “' + voiceText + '”')}
            </p>
          )}
        </div>

        {type !== 'transfer' && (
          <div style={{ padding: '0 20px 10px', position: 'relative' }}>
            <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 6 }}>
              {t(locale, 'merchant')}
            </label>
            <input
              type="text"
              aria-label={t(locale, 'merchant')}
              placeholder={t(locale, 'merchantPh')}
              value={merchant}
              onChange={(e) => { setMerchant(e.target.value); setMerchantId(''); setShowMerch(true); setPadOpen(false); }}
              onFocus={() => { setShowMerch(true); setPadOpen(false); }}
              style={{
                width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 14, padding: '12px 14px',
                fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', outline: 'none',
              }}
            />
            {showMerch && merchMatches.length > 0 && (
              <div style={{
                marginTop: 6, background: '#FFFFFF', borderRadius: 14, border: '1px solid #EFEFF4',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
              }}>
                {merchMatches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => pickMerchant(m)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none',
                      background: '#fff', cursor: 'pointer', borderBottom: '1px solid #F2F2F7',
                    }}
                  >
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700 }}>{m.name}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{m.upiVpa || t(locale, 'createMerchant')}</p>
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              aria-label={t(locale, 'merchantUpi')}
              placeholder={t(locale, 'merchantUpiPh')}
              value={merchantUpi}
              onChange={(e) => setMerchantUpi(e.target.value)}
              onFocus={() => { setShowMerch(false); setPadOpen(false); }}
              style={{
                width: '100%', marginTop: 8, border: '1.5px solid #E5E5EA', borderRadius: 14, padding: '10px 14px',
                fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1C1C1E', outline: 'none',
              }}
            />
          </div>
        )}

        <div style={{ padding: '4px 20px 8px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 8 }}>
            {type === 'transfer' ? t(locale, 'fromAccount') : t(locale, 'paidFrom')}
          </p>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {accounts.map((a) => {
              const bal = accountBalance(store, a.id);
              const active = accountId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setAccountId(a.id)}
                  style={{
                    minWidth: 118, flexShrink: 0, padding: '10px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: active ? '#E8F1FF' : '#F5F5F7', textAlign: 'left',
                  }}
                >
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: active ? '#007AFF' : '#6E6E73' }}>
                    {acctLabel(a, locale)}{a.type === 'bank' ? ' · UPI' : a.type === 'card' ? ' · Card' : ''}
                  </p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: a.type === 'card' ? '#FF3B30' : '#1C1C1E', marginTop: 2 }}>
                    {fmt(bal)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {type === 'transfer' && (
          <div style={{ padding: '4px 20px 8px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', marginBottom: 8 }}>{t(locale, 'toAccount')}</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {accounts.filter((a) => a.id !== accountId).map((a) => chip(
                toAccountId === a.id,
                () => setToAccountId(a.id),
                acctLabel(a, locale),
                a.id
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '4px 16px 8px' }}>
          <div style={{ overflowX: 'auto', display: 'flex', gap: 8 }}>
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
            {type !== 'transfer' && (
              <button
                type="button"
                aria-label={t(locale, 'addCategory')}
                onClick={() => setCatSheet(true)}
                style={{
                  flexShrink: 0, padding: '8px 14px', borderRadius: 20, border: '1.5px dashed #C7C7CC',
                  background: '#fff', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#007AFF',
                }}
              >{t(locale, 'addCustom')}</button>
            )}
          </div>
        </div>

        <div style={{ padding: '4px 20px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          <input
            type="text"
            placeholder={t(locale, 'note')}
            aria-label={t(locale, 'note')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={() => setPadOpen(false)}
            style={{
              border: '1.5px solid #E5E5EA', borderRadius: 12, padding: '10px 12px',
              fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1C1C1E', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" aria-label={t(locale, 'addPhoto')} onChange={onPickPhoto} style={{ display: 'none' }} />
            <button
              type="button"
              onClick={() => fileRef.current && fileRef.current.click()}
              style={{
                flex: 1, padding: '12px', borderRadius: 14, border: '1.5px dashed #C7C7CC',
                background: '#FAFAFA', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#007AFF',
              }}
            >{receiptThumb ? t(locale, 'receipt') : t(locale, 'addPhoto')}</button>
            {receiptThumb && (
              <button type="button" aria-label={t(locale, 'removePhoto')} onClick={() => setReceiptThumb('')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <img src={receiptThumb} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {padOpen && (
        <div style={{ padding: '4px 20px 0', background: '#fff' }}>
          {numpad.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-label={key === '⌫' ? t(locale, 'backspace') : String(key)}
                  onClick={() => (key === '⌫' ? handleBack() : handleNum(key))}
                  style={{
                    height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
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
      )}

      <div style={{ padding: '8px 20px 28px', background: '#fff' }}>
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

      {catSheet && (
        <>
          <div onClick={() => setCatSheet(false)} style={{ position: 'absolute', inset: 0, zIndex: 8, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{
            position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 9,
            background: '#fff', borderRadius: 22, padding: '20px 18px 16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, marginBottom: 12 }}>{t(locale, 'newCategory')}</p>
            <input
              type="text"
              aria-label={t(locale, 'catName')}
              placeholder={t(locale, 'catName')}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{
                width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 12, padding: '12px',
                fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 12, outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10 }}>
              {CAT_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => setNewCatEmoji(e)} style={{
                  width: 36, height: 36, borderRadius: 10, border: newCatEmoji === e ? '2px solid #007AFF' : '1px solid #E5E5EA',
                  background: '#F5F5F7', cursor: 'pointer', fontSize: 18,
                }}>{e}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {CAT_COLORS.map((c) => (
                <button key={c} type="button" aria-label={c} onClick={() => setNewCatColor(c)} style={{
                  width: 26, height: 26, borderRadius: 13, border: newCatColor === c ? '2px solid #1C1C1E' : 'none',
                  background: c, cursor: 'pointer',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setCatSheet(false)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#F2F2F7', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'cancel')}</button>
              <button type="button" onClick={saveCustomCat} disabled={!newCatName.trim()} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: newCatName.trim() ? '#007AFF' : '#E5E5EA', color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'save')}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { AddExpenseScreen });
