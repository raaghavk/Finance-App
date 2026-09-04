// VoiceScan.jsx — Voice entry mockup + Camera scan mockup

// ── Voice Entry ──────────────────────────────────────────────
function VoiceEntryScreen({ onClose, onSave }) {
  const [phase, setPhase] = React.useState('idle'); // idle | listening | processing | confirm
  const [transcript, setTranscript] = React.useState('');
  const [parsed, setParsed] = React.useState(null);
  const timerRef = React.useRef(null);

  const SAMPLES = [
    { text: 'Spent 340 on coffee at Blue Tokai', amount: 340, merchant: 'Blue Tokai', category: 'Food & Drink' },
    { text: 'Paid 1200 for groceries at DMart', amount: 1200, merchant: 'DMart', category: 'Groceries' },
    { text: 'Uber ride 180 rupees', amount: 180, merchant: 'Uber', category: 'Transport' },
    { text: 'Netflix subscription 649', amount: 649, merchant: 'Netflix', category: 'Entertainment' },
  ];

  const startListening = () => {
    setPhase('listening');
    setTranscript('');
    setParsed(null);
    // Simulate transcription after 2.5s
    timerRef.current = setTimeout(() => {
      const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
      setPhase('processing');
      setTranscript(sample.text);
      setTimeout(() => { setParsed(sample); setPhase('confirm'); }, 1000);
    }, 2500);
  };

  const reset = () => { clearTimeout(timerRef.current); setPhase('idle'); setTranscript(''); setParsed(null); };

  const CAT_COLORS = { 'Food & Drink': '#FF6B6B', Groceries: '#34D399', Transport: '#60A5FA', Entertainment: '#A78BFA' };

  // Waveform bars
  const WaveBar = ({ delay, active }) => {
    const [h, setH] = React.useState(8);
    React.useEffect(() => {
      if (!active) { setH(8); return; }
      const interval = setInterval(() => setH(Math.random() * 40 + 8), 120);
      return () => clearInterval(interval);
    }, [active]);
    return <div style={{ width: 4, borderRadius: 2, background: active ? '#007AFF' : '#E0E0E0', height: h, transition: 'height 0.1s ease', alignSelf: 'center' }} />;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 72, padding: '72px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ background: '#F5F5F7', border: 'none', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>Voice Entry</h2>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 32 }}>

        {/* Status text */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1C1C1E', marginBottom: 8 }}>
            {phase === 'idle' && 'Tap to speak'}
            {phase === 'listening' && 'Listening…'}
            {phase === 'processing' && 'Processing…'}
            {phase === 'confirm' && 'Got it!'}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93', lineHeight: 1.5 }}>
            {phase === 'idle' && 'Say something like "spent 200 on lunch"'}
            {phase === 'listening' && 'Speak clearly into your microphone'}
            {phase === 'processing' && 'Extracting expense details…'}
            {phase === 'confirm' && 'Review and confirm below'}
          </p>
        </div>

        {/* Waveform / mic button */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Pulse rings */}
          {phase === 'listening' && [1,2,3].map(i => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              border: `2px solid rgba(0,122,255,${0.15/i})`,
              width: 80 + i * 40, height: 80 + i * 40,
              animation: `pulse${i} ${0.8 + i * 0.3}s ease-out infinite`,
            }} />
          ))}
          <style>{`
            @keyframes pulse1{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.3);opacity:0}}
            @keyframes pulse2{0%{transform:scale(1);opacity:0.4}100%{transform:scale(1.4);opacity:0}}
            @keyframes pulse3{0%{transform:scale(1);opacity:0.3}100%{transform:scale(1.5);opacity:0}}
          `}</style>
          <button
            onClick={phase === 'idle' ? startListening : phase === 'listening' ? () => { clearTimeout(timerRef.current); setPhase('processing'); setTimeout(() => { const s = SAMPLES[0]; setTranscript(s.text); setParsed(s); setPhase('confirm'); }, 800); } : undefined}
            style={{
              width: 88, height: 88, borderRadius: 44, border: 'none', cursor: phase === 'confirm' ? 'default' : 'pointer',
              background: phase === 'listening' ? '#FF3B30' : phase === 'processing' ? '#F2F2F7' : '#007AFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: phase === 'listening' ? '0 8px 32px rgba(255,59,48,0.4)' : phase === 'idle' ? '0 8px 32px rgba(0,122,255,0.4)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              position: 'relative', zIndex: 2,
            }}
          >
            {phase === 'processing' ? (
              <div style={{ width: 24, height: 24, borderRadius: 12, border: '3px solid #007AFF', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            ) : phase === 'confirm' ? (
              <svg width="32" height="24" viewBox="0 0 32 24" fill="none"><path d="M2 12l10 10L30 2" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                <rect x="8" y="1" width="12" height="20" rx="6" stroke="white" strokeWidth="2.2"/>
                <path d="M3 17C3 23.07 8.37 28 14 28s11-4.93 11-11" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="14" y1="28" x2="14" y2="31" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        {/* Waveform visualizer */}
        {(phase === 'listening' || phase === 'processing') && (
          <div style={{ display: 'flex', gap: 6, height: 56, alignItems: 'center' }}>
            {Array.from({ length: 24 }).map((_, i) => <WaveBar key={i} delay={i * 50} active={phase === 'listening'} />)}
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div style={{ background: '#F5F5F7', borderRadius: 18, padding: '16px 20px', width: '100%' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Heard</p>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 600, color: '#1C1C1E', fontStyle: 'italic' }}>"{transcript}"</p>
          </div>
        )}

        {/* Parsed result */}
        {phase === 'confirm' && parsed && (
          <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1.5px solid #F0F0F3', padding: '18px 20px', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#8E8E93', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Extracted</p>
            {[
              ['Amount',   `₹${parsed.amount}`],
              ['Merchant', parsed.merchant],
              ['Category', parsed.category],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>{l}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {l === 'Category' && <div style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[v] || '#8E8E93' }} />}
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>{v}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{ padding: '0 24px 48px', display: 'flex', gap: 12 }}>
        {phase === 'confirm' ? (
          <>
            <button onClick={reset} style={{ flex: 1, padding: '16px', border: '1.5px solid #E5E5EA', borderRadius: 16, background: '#FFFFFF', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E' }}>Retake</button>
            <button onClick={() => { onSave && onSave(parsed); }} style={{ flex: 2, padding: '16px', border: 'none', borderRadius: 16, background: '#007AFF', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFFFFF', boxShadow: '0 6px 20px rgba(0,122,255,0.35)' }}>Save Expense</button>
          </>
        ) : (
          <button onClick={onClose} style={{ flex: 1, padding: '16px', border: '1.5px solid #E5E5EA', borderRadius: 16, background: '#FFFFFF', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#8E8E93' }}>Cancel</button>
        )}
      </div>
    </div>
  );
}

// ── Camera / Receipt Scanner ──────────────────────────────────
function CameraScanScreen({ onClose, onSave }) {
  const [phase, setPhase] = React.useState('scan'); // scan | scanning | result
  const [progress, setProgress] = React.useState(0);
  const scanLinePos = React.useRef(0);
  const [scanY, setScanY] = React.useState(0);

  React.useEffect(() => {
    if (phase !== 'scanning') return;
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      setScanY((p / 100) * 280);
      if (p >= 100) { clearInterval(interval); setTimeout(() => setPhase('result'), 400); }
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  const PARSED_RECEIPT = {
    merchant: 'Blue Tokai Coffee', date: 'May 2, 2026', items: [
      { name: 'Cold Brew', qty: 1, price: 280 },
      { name: 'Croissant', qty: 1, price: 120 },
    ],
    subtotal: 400, tax: 72, total: 472, category: 'Food & Drink', color: '#FF6B6B',
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000000', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 72, padding: '72px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: '8px 16px', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: 'white' }}>
            {phase === 'scan' ? 'Scan Receipt' : phase === 'scanning' ? 'Scanning…' : 'Receipt Scanned'}
          </span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Camera viewfinder */}
      {phase !== 'result' && (
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Fake camera bg */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #1a1a2e, #0d0d0d)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 40px)' }} />
          </div>

          {/* Viewfinder frame */}
          <div style={{ position: 'relative', width: 280, height: 380 }}>
            {/* Corner brackets */}
            {[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx, sy], i) => (
              <div key={i} style={{ position: 'absolute', width: 32, height: 32, top: sy === -1 ? 0 : undefined, bottom: sy === 1 ? 0 : undefined, left: sx === -1 ? 0 : undefined, right: sx === 1 ? 0 : undefined }}>
                <div style={{ position: 'absolute', top: sy === -1 ? 0 : undefined, bottom: sy === 1 ? 0 : undefined, left: sx === -1 ? 0 : undefined, right: sx === 1 ? 0 : undefined, width: 32, height: 3, background: '#007AFF', borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: sy === -1 ? 0 : undefined, bottom: sy === 1 ? 0 : undefined, left: sx === -1 ? 0 : undefined, right: sx === 1 ? 0 : undefined, width: 3, height: 32, background: '#007AFF', borderRadius: 2 }} />
              </div>
            ))}

            {/* Dimmed overlay outside viewfinder */}
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(0,122,255,0.4)', borderRadius: 8 }} />

            {/* Receipt mockup */}
            <div style={{ position: 'absolute', inset: 12, background: '#FEFEFE', borderRadius: 4, display: 'flex', flexDirection: 'column', padding: '16px 14px', overflow: 'hidden' }}>
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 800, color: '#1C1C1E' }}>BLUE TOKAI COFFEE</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: '#8E8E93' }}>May 2, 2026  10:42 AM</p>
              </div>
              {PARSED_RECEIPT.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#1C1C1E' }}>{item.name} x{item.qty}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#1C1C1E' }}>₹{item.price}</p>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #E0E0E0', marginTop: 8, paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: '#8E8E93' }}>Subtotal</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: '#8E8E93' }}>₹{PARSED_RECEIPT.subtotal}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: '#8E8E93' }}>GST 18%</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: '#8E8E93' }}>₹{PARSED_RECEIPT.tax}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 800, color: '#1C1C1E' }}>TOTAL</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 10, fontWeight: 800, color: '#1C1C1E' }}>₹{PARSED_RECEIPT.total}</p>
                </div>
              </div>
            </div>

            {/* Scan line */}
            {phase === 'scanning' && (
              <div style={{ position: 'absolute', left: 2, right: 2, top: scanY, height: 2, background: 'linear-gradient(90deg, transparent, #007AFF, transparent)', boxShadow: '0 0 8px #007AFF', transition: 'top 0.04s linear' }} />
            )}
          </div>

          {/* Progress bar */}
          {phase === 'scanning' && (
            <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#007AFF', borderRadius: 2, transition: 'width 0.04s' }} />
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8 }}>{progress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {phase === 'result' && (
        <div style={{ flex: 1, background: '#F2F2F7', overflowY: 'auto', padding: '80px 20px 20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '20px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FF6B6B18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>☕</div>
              <div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1C1C1E', marginBottom: 2 }}>{PARSED_RECEIPT.merchant}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{PARSED_RECEIPT.date}</p>
              </div>
              <div style={{ marginLeft: 'auto', background: '#EDFDF5', borderRadius: 10, padding: '4px 10px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: '#34D399' }}>✓ Scanned</span>
              </div>
            </div>
            {PARSED_RECEIPT.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F2F2F7' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#1C1C1E' }}>{item.name} ×{item.qty}</span>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600, color: '#1C1C1E' }}>₹{item.price}</span>
              </div>
            ))}
            <div style={{ padding: '12px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>GST 18%</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93' }}>₹{PARSED_RECEIPT.tax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: '#1C1C1E' }}>Total</span>
                <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#007AFF' }}>₹{PARSED_RECEIPT.total}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '15px', border: '1.5px solid #E5E5EA', borderRadius: 16, background: '#FFFFFF', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E' }}>Discard</button>
            <button onClick={() => onSave && onSave({ amount: PARSED_RECEIPT.total, note: PARSED_RECEIPT.merchant, category: PARSED_RECEIPT.category })} style={{ flex: 2, padding: '15px', border: 'none', borderRadius: 16, background: '#007AFF', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#FFFFFF', boxShadow: '0 6px 20px rgba(0,122,255,0.35)' }}>Save ₹{PARSED_RECEIPT.total}</button>
          </div>
        </div>
      )}

      {/* Scan button */}
      {phase === 'scan' && (
        <div style={{ padding: '20px 32px 48px', display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => setPhase('scanning')} style={{
            width: 80, height: 80, borderRadius: 40, background: '#FFFFFF', border: '4px solid rgba(255,255,255,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 30, background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="14" rx="3" stroke="white" strokeWidth="1.8"/>
                <circle cx="12" cy="14" r="4" stroke="white" strokeWidth="1.8"/>
                <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="white" strokeWidth="1.8"/>
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { VoiceEntryScreen, CameraScanScreen });
