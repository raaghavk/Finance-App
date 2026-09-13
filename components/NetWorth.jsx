// NetWorth.jsx — wallets plus optional assets / liabilities from the live store

function NetWorthScreen({ store, onBack, onSaveHolding, onDeleteHolding }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const snap = typeof netWorthSnapshot === 'function' ? netWorthSnapshot(store) : { assets: [], liabilities: [], assetTotal: 0, liabTotal: 0, net: 0 };
  const [kind, setKind] = React.useState('asset');
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [editing, setEditing] = React.useState(null);
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const cream = ZENITH.cream;
  const accent = ZENITH.accent;
  const live = ZENITH.live || '#16A34A';
  const health = snap.assetTotal > 0 ? Math.min(100, Math.max(0, Math.round((snap.net / snap.assetTotal) * 100))) : 0;

  const commit = () => {
    const n = parseFloat(amount);
    if (!name.trim() || !Number.isFinite(n) || n < 0) return;
    if (editing) onSaveHolding && onSaveHolding(editing.id, { name: name.trim(), amount: n, kind: editing.kind, icon: editing.icon, color: editing.color });
    else onSaveHolding && onSaveHolding(null, { name: name.trim(), amount: n, kind: kind, icon: kind === 'liability' ? '💳' : '🏦' });
    setName('');
    setAmount('');
    setEditing(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader title={t(locale, 'netWorth')} leftLabel="‹" onLeft={onBack} />
      ) : (
        <div style={{ paddingTop: 'var(--zenith-pad-top)', padding: '12px 24px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: ink }}>{t(locale, 'netWorth')}</h1>
        </div>
      )}

      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ background: zenithHeroGradient(), borderRadius: 24, padding: '22px', boxShadow: zenithHeroShadow() }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'netWorth')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1 }}>{fmt(snap.net)}</p>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10 }}>
        {[
          { label: t(locale, 'assets'), value: fmt(snap.assetTotal), color: live },
          { label: t(locale, 'liabilities'), value: fmt(snap.liabTotal), color: '#EF4444' },
          { label: t(locale, 'healthScore'), value: health + '%', color: accent },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: card, borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: zenithSoftShadow() }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>{t(locale, 'walletsInNet')}</p>
        <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
          {(snap.wallets || []).map((a, i, arr) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid ' + cream : 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{a.icon}</div>
              <p style={{ flex: 1, fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{acctLabel(a, locale) || a.name}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink }}>{fmt(a.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {['asset', 'liability'].map((type) => {
        const rows = (store.holdings || []).filter((h) => h.kind === type);
        return (
          <div key={type} style={{ padding: '0 20px', marginBottom: 14 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
              {type === 'asset' ? t(locale, 'extraHoldings') : t(locale, 'liabilities')}
            </p>
            <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
              {rows.length === 0 ? (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, padding: '14px 18px' }}>{t(locale, 'noTxns')}</p>
              ) : rows.map((h, i, arr) => (
                <button key={h.id} type="button" onClick={() => { setEditing(h); setKind(h.kind); setName(h.name); setAmount(String(h.amount)); }} style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '14px 18px', border: 'none',
                  borderBottom: i < arr.length - 1 ? '1px solid ' + cream : 'none', background: card, cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: (h.color || accent) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{h.icon}</div>
                  <p style={{ flex: 1, fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{h.name}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: type === 'liability' ? '#EF4444' : ink }}>
                    {type === 'liability' ? '−' : ''}{fmt(h.amount)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ background: card, borderRadius: 22, padding: '16px', boxShadow: zenithSoftShadow() }}>
          <div style={{ display: 'flex', background: cream, borderRadius: 12, padding: 3, marginBottom: 12 }}>
            {['asset', 'liability'].map((k) => (
              <button key={k} type="button" onClick={() => { setKind(k); setEditing(null); }} style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 10, cursor: 'pointer',
                background: kind === k ? card : 'transparent',
                fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: ink,
              }}>{k === 'asset' ? t(locale, 'addAsset') : t(locale, 'addLiability')}</button>
            ))}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(locale, 'holdingName')} style={typeof moneyInputStyle === 'function' ? moneyInputStyle() : { width: '100%', border: 'none', background: cream, borderRadius: 12, padding: '12px', marginBottom: 8, fontFamily: 'Inter, sans-serif' }} />
          <div style={{ height: 8 }} />
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" style={typeof moneyInputStyle === 'function' ? moneyInputStyle() : { width: '100%', border: 'none', background: cream, borderRadius: 12, padding: '12px', fontFamily: 'Manrope, sans-serif', fontWeight: 800 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {editing && (
              <button type="button" onClick={() => { onDeleteHolding && onDeleteHolding(editing.id); setEditing(null); setName(''); setAmount(''); }} style={{
                padding: '12px 14px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
                fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer',
              }}>{t(locale, 'delete')}</button>
            )}
            <button type="button" onClick={commit} style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: accent, color: '#fff',
              fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer',
            }}>{t(locale, 'save')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NetWorthScreen });
