// Onboarding.jsx — 3-screen Privacy Handshake

function OnboardingScreen({ step, onNext, setUserName, setStartBalance }) {
  const [val, setVal] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [animIn, setAnimIn] = React.useState(true);

  React.useEffect(() => {
    setAnimIn(false);
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, [step]);

  const inputBase = {
    border: 'none', outline: 'none', background: 'transparent',
    fontFamily: 'Manrope, sans-serif', color: '#121212',
  };

  const continueBtn = (label, action, disabled) => (
    <button
      onClick={action}
      style={{
        width: '100%', padding: '18px', marginBottom: 40,
        background: disabled ? '#F0F0F3' : '#007AFF',
        color: disabled ? '#AAAAAA' : '#FFFFFF',
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
      transform: animIn ? 'translateX(0)' : 'translateX(30px)',
      opacity: animIn ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {children}
    </div>
  );

  // ── Screen 0: Name ──
  if (step === 0) return wrap('#FFFFFF', <>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 9C11.2 9 13 7.2 13 5S11.2 1 9 1 5 2.8 5 5s1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v1h16v-1c0-2.7-5.3-4-8-4z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#007AFF', letterSpacing: 1.4, textTransform: 'uppercase' }}>Zenith</span>
      </div>

      <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 38, fontWeight: 800, color: '#121212', lineHeight: 1.15, marginBottom: 8 }}>
        Hi, I'm Zenith.
      </h1>
      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 700, color: '#6E6E73', lineHeight: 1.2, marginBottom: 56 }}>
        What should I call you?
      </h2>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Your name"
          autoFocus
          value={val}
          onChange={e => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => e.key === 'Enter' && val && (setUserName(val), onNext())}
          style={{
            ...inputBase,
            width: '100%',
            fontSize: 28, fontWeight: 700,
            padding: '16px 0',
            borderBottom: `2.5px solid ${focused ? '#007AFF' : '#E5E5EA'}`,
            transition: 'border-color 0.2s',
          }}
        />
        {val && (
          <div style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            width: 30, height: 30, borderRadius: 15, background: '#007AFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }} onClick={() => { setUserName(val); onNext(); }}>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5h12M8 1l5 4-5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
    {continueBtn('Continue →', () => { setUserName(val || 'Friend'); onNext(); }, false)}
  </>);

  // ── Screen 1: Starting Balance ──
  if (step === 1) return wrap('#FFFFFF', <>
    <div style={{ flex: 1 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: '#F0F7FF', borderRadius: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#007AFF' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#007AFF' }}>2 of 3</span>
        </div>
      </div>

      <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#121212', lineHeight: 1.2, marginBottom: 8 }}>
        How much do you have
      </h1>
      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#6E6E73', lineHeight: 1.2, marginBottom: 48 }}>
        right now?
      </h2>

      <div style={{
        background: '#F5F5F7', borderRadius: 24, padding: '32px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', fontWeight: 500, marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase' }}>Current Cash in Hand</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 48, fontWeight: 800, color: '#007AFF' }}>₹</span>
          <input
            type="number"
            placeholder="0"
            value={val}
            onChange={e => setVal(e.target.value)}
            style={{
              ...inputBase,
              fontSize: 64, fontWeight: 800, color: '#121212',
              width: '180px', textAlign: 'center',
            }}
          />
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#AAAAAA', marginTop: 12 }}>
          Budgeting is optional. This is just your starting point.
        </p>
      </div>
    </div>
    {continueBtn('Set My Balance', () => { setStartBalance(parseFloat(val) || 50000); onNext(); }, false)}
  </>);

  // ── Screen 2: Privacy Commitment ──
  if (step === 2) return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0D0D0D',
      display: 'flex', flexDirection: 'column',
      padding: '24px', paddingTop: '80px',
      transform: animIn ? 'translateY(0)' : 'translateY(40px)',
      opacity: animIn ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ flex: 1 }}>
        {/* Lock icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: 'rgba(0,122,255,0.18)',
          border: '1px solid rgba(0,122,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="5" y="14" width="22" height="15" rx="5" fill="#007AFF"/>
            <path d="M9.5 14V10.5C9.5 7.46 12 5 15 5h2c3 0 5.5 2.46 5.5 5.5V14" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="21.5" r="2.5" fill="white"/>
            <rect x="15" y="22" width="2" height="3.5" rx="1" fill="white"/>
          </svg>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: 'rgba(0,122,255,0.15)', borderRadius: 20, marginBottom: 16,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#007AFF' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#007AFF' }}>Privacy First</span>
        </div>

        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 36 }}>
          Your data<br/>stays with<br/>you.
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { title: 'No Cloud Sync', desc: 'Everything lives on your device, not our servers.', icon: '📵' },
            { title: 'Local Encryption', desc: 'Your data is encrypted at rest. Always.', icon: '🔐' },
            { title: 'Zero Data Harvest', desc: 'We don\'t know who you are. That\'s a promise.', icon: '🛡️' },
          ].map(({ title, desc, icon }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>{icon}</div>
              <div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 16, color: '#FFFFFF', marginBottom: 4 }}>{title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        style={{
          width: '100%', padding: '18px', marginBottom: 40,
          background: '#007AFF', color: '#FFFFFF',
          border: 'none', borderRadius: 18,
          fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,122,255,0.45)',
        }}
      >I Understand — Let's Begin</button>
    </div>
  );

  return null;
}

Object.assign(window, { OnboardingScreen });
