// VoiceScan.jsx — Storyboarded voice / scan (does not invent transactions)

function ComingSoonSheet({ title, hint, onClose, onManual }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 72, padding: '72px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" aria-label="Close" onClick={onClose} style={{ background: '#F5F5F7', border: 'none', borderRadius: 12, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="#1C1C1E" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>{title}</h2>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 20, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#1C1C1E' }}>{title}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#6E6E73', lineHeight: 1.5 }}>{hint}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93', lineHeight: 1.5 }}>
          Voice and scan do not add a transaction until they can read a real receipt or utterance.
        </p>
        <button
          type="button"
          aria-label="Add manually"
          onClick={onManual}
          style={{
            marginTop: 8, padding: '14px 22px', border: 'none', borderRadius: 16, cursor: 'pointer',
            background: '#007AFF', color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
          }}
        >Add manually</button>
      </div>
    </div>
  );
}

function VoiceEntryScreen({ onClose, onManual }) {
  return (
    <ComingSoonSheet
      title="Voice"
      hint={'Try saying “Aaj lunch pe 150” or “spent 200 on chai” — coming next.'}
      onClose={onClose}
      onManual={onManual}
    />
  );
}

function CameraScanScreen({ onClose, onManual }) {
  return (
    <ComingSoonSheet
      title="Scan"
      hint="Receipt scan is not live in v1. Log the amount by hand for now."
      onClose={onClose}
      onManual={onManual}
    />
  );
}

Object.assign(window, { VoiceEntryScreen, CameraScanScreen });
