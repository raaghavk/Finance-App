// LockScreen.jsx — PIN / WebAuthn gate for standalone PWA

function LockScreen({ store, onUnlock }) {
  const locale = (store.user && store.user.locale) || 'en';
  const [pin, setPin] = React.useState('');
  const [err, setErr] = React.useState('');
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const accent = ZENITH.accent;
  const canWeb = !!(store.settings && store.settings.lock && store.settings.lock.webauthn && typeof navigator !== 'undefined' && navigator.credentials && navigator.credentials.get);

  const tryUnlock = (value) => {
    if (typeof checkPin === 'function' && checkPin(store, value)) {
      setErr('');
      onUnlock && onUnlock();
      return true;
    }
    setErr(t(locale, 'pinMismatch'));
    return false;
  };

  const onDigit = (d) => {
    const next = (pin + d).slice(0, 8);
    setPin(next);
    if (next.length >= 4) tryUnlock(next);
  };

  React.useEffect(() => {
    if (!canWeb) return;
    let cancelled = false;
    (async () => {
      try {
        const cred = await navigator.credentials.get({ publicKey: {
          challenge: new Uint8Array(32),
          timeout: 30000,
          userVerification: 'required',
          rpId: typeof location !== 'undefined' ? location.hostname : undefined,
        } });
        if (!cancelled && cred) onUnlock && onUnlock();
      } catch (e) { /* user cancelled — PIN remains */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      height: '100%', background: page, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 28px',
      paddingTop: 'var(--zenith-pad-top)',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22, marginBottom: 18,
        background: zenithHeroGradient(), display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>Z</span>
      </div>
      <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: ink, marginBottom: 6 }}>{t(locale, 'unlock')}</h1>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 22 }}>{t(locale, 'enterPin')}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {Array.from({ length: Math.max(4, pin.length) }).slice(0, 8).map((_, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: 6,
            background: i < pin.length ? accent : ZENITH.cream,
          }} />
        ))}
      </div>
      {err ? <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#EF4444', marginBottom: 10 }}>{err}</p> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10 }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d) => (
          <button
            key={d || 'sp'}
            type="button"
            disabled={!d}
            onClick={() => {
              if (d === '⌫') { setPin((p) => p.slice(0, -1)); setErr(''); }
              else if (d) onDigit(d);
            }}
            style={{
              width: 72, height: 52, borderRadius: 16, border: 'none', cursor: d ? 'pointer' : 'default',
              background: d ? ZENITH.card : 'transparent', color: ink,
              fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800,
              boxShadow: d ? zenithSoftShadow() : 'none',
            }}
          >{d}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LockScreen });
