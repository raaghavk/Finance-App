// Onboarding.jsx — language, name, opening cash, privacy (honest defaults)

function OnboardingScreen({ step, onNext, onSetLocale, onSetName, onSetCash, locale }) {
  const [val, setVal] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [animIn, setAnimIn] = React.useState(true);
  const L = locale || 'en';

  React.useEffect(() => {
    setVal('');
    setAnimIn(false);
    const tmr = setTimeout(() => setAnimIn(true), 40);
    return () => clearTimeout(tmr);
  }, [step]);

  const inputBase = {
    border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'Manrope, sans-serif', color: '#121212',
  };

  const continueBtn = (label, action, disabled, extra) => (
    <button
      type="button"
      aria-label={label}
      disabled={!!disabled}
      onClick={() => { if (!disabled) action(); }}
      style={{
        width: '100%', padding: '18px', marginBottom: extra ? 12 : 40,
        background: disabled ? '#F0F0F3' : '#007AFF',
        color: disabled ? '#8E8E93' : '#FFFFFF',
        border: 'none', borderRadius: 18,
        fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.25s',
        boxShadow: disabled ? 'none' : '0 8px 24px rgba(0,122,255,0.35)',
      }}
    >{label}</button>
  );

  const wrap = (bg, children) => (
    <div style={{
      position: 'absolute', inset: 0,
      background: bg,
      display: 'flex', flexDirection: 'column',
      padding: '24px',
      paddingTop: '80px',
      transform: animIn ? 'translateX(0)' : 'translateX(24px)',
      opacity: animIn ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {children}
    </div>
  );

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 9C11.2 9 13 7.2 13 5S11.2 1 9 1 5 2.8 5 5s1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v1h16v-1c0-2.7-5.3-4-8-4z" fill="white"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#007AFF', letterSpacing: 1.4, textTransform: 'uppercase' }}>Zenith</span>
    </div>
  );

  // ── Step 0: Language ──
  if (step === 0) return wrap('#FFFFFF', <>
    <div style={{ flex: 1 }}>
      {brand}
      <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#121212', lineHeight: 1.2, marginBottom: 8 }}>
        {t(L, 'langTitle')}
      </h1>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#6E6E73', marginBottom: 36, lineHeight: 1.45 }}>
        {t(L, 'langSub')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { id: 'en', title: 'English', sub: 'Continue in English' },
          { id: 'hi', title: 'हिंदी', sub: 'हिंदी में जारी रखें' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-label={opt.title}
            onClick={() => { onSetLocale(opt.id); onNext(); }}
            style={{
              textAlign: 'left', padding: '18px 20px', borderRadius: 18,
              border: L === opt.id ? '2px solid #007AFF' : '1.5px solid #E5E5EA',
              background: L === opt.id ? '#F0F7FF' : '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: '#121212' }}>{opt.title}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', marginTop: 4 }}>{opt.sub}</p>
          </button>
        ))}
      </div>
    </div>
  </>);

  // ── Step 1: Name ──
  if (step === 1) {
    const nameOk = val.trim().length > 0;
    return wrap('#FFFFFF', <>
      <div style={{ flex: 1 }}>
        {brand}
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#121212', lineHeight: 1.15, marginBottom: 8 }}>
          {t(L, 'hi')}
        </h1>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 26, fontWeight: 700, color: '#6E6E73', lineHeight: 1.2, marginBottom: 48 }}>
          {t(L, 'callYou')}
        </h2>
        <input
          type="text"
          placeholder={t(L, 'yourName')}
          autoFocus
          aria-label={t(L, 'yourName')}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && nameOk) {
              onSetName(val.trim());
              onNext();
            }
          }}
          style={{
            ...inputBase,
            width: '100%',
            fontSize: 28, fontWeight: 700,
            padding: '16px 0',
            borderBottom: `2.5px solid ${focused ? '#007AFF' : '#E5E5EA'}`,
          }}
        />
      </div>
      {continueBtn(t(L, 'continue') + ' →', () => { onSetName(val.trim()); onNext(); }, !nameOk)}
    </>);
  }

  // ── Step 2: Opening cash (skip = ₹0) ──
  if (step === 2) {
    return wrap('#FFFFFF', <>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: '#F0F7FF', borderRadius: 20, marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#007AFF' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#007AFF' }}>3 / 4</span>
        </div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#121212', lineHeight: 1.2, marginBottom: 6 }}>
          {t(L, 'cashTitle')}
        </h1>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#6E6E73', lineHeight: 1.2, marginBottom: 36 }}>
          {t(L, 'cashNow')}
        </h2>
        <div style={{ background: '#F5F5F7', borderRadius: 24, padding: '28px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', fontWeight: 600, marginBottom: 12, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {L === 'hi' ? 'शुरुआती नकदी' : 'Opening cash'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#007AFF' }}>₹</span>
            <input
              type="number"
              placeholder="0"
              aria-label={L === 'hi' ? 'शुरुआती नकदी' : 'Opening cash'}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              style={{
                ...inputBase,
                fontSize: 52, fontWeight: 800, color: '#121212',
                width: '180px', textAlign: 'center',
              }}
            />
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginTop: 14, lineHeight: 1.45 }}>
            {t(L, 'cashHint')}
          </p>
        </div>
      </div>
      {continueBtn(t(L, 'setBalance'), () => {
        const n = parseFloat(val);
        onSetCash(Number.isFinite(n) && n >= 0 ? n : 0);
        onNext();
      }, false, true)}
      <button
        type="button"
        aria-label={t(L, 'skipCash')}
        onClick={() => { onSetCash(0); onNext(); }}
        style={{
          width: '100%', padding: '14px', marginBottom: 36,
          background: 'transparent', color: '#007AFF',
          border: 'none', borderRadius: 14,
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700,
          cursor: 'pointer',
        }}
      >{t(L, 'skipCash')}</button>
    </>);
  }

  // ── Step 3: Privacy (always dark — no fade from white) ──
  if (step === 3) return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0D0D0D',
      display: 'flex', flexDirection: 'column',
      padding: '24px', paddingTop: '80px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: 'rgba(0,122,255,0.18)',
          border: '1px solid rgba(0,122,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="5" y="14" width="22" height="15" rx="5" fill="#007AFF"/>
            <path d="M9.5 14V10.5C9.5 7.46 12 5 15 5h2c3 0 5.5 2.46 5.5 5.5V14" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="21.5" r="2.5" fill="white"/>
          </svg>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: 'rgba(0,122,255,0.15)', borderRadius: 20, marginBottom: 16,
        }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#7EB6FF' }}>4 / 4</span>
        </div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.12, marginBottom: 28 }}>
          {t(L, 'privacyTitle')}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { title: t(L, 'noCloud'), desc: t(L, 'noCloudDesc') },
            { title: t(L, 'encrypt'), desc: t(L, 'encryptDesc') },
            { title: t(L, 'noHarvest'), desc: t(L, 'noHarvestDesc') },
          ].map(({ title, desc }) => (
            <div key={title}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#FFFFFF', marginBottom: 4 }}>{title}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label={t(L, 'begin')}
        onClick={onNext}
        style={{
          width: '100%', padding: '18px', marginBottom: 40,
          background: '#007AFF', color: '#FFFFFF',
          border: 'none', borderRadius: 18,
          fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,122,255,0.45)',
        }}
      >{t(L, 'begin')}</button>
    </div>
  );

  return null;
}

Object.assign(window, { OnboardingScreen });
