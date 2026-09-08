// VoiceScan.jsx — Sarvam Saaras voice + Cloud Vision receipt (local photo if OCR off)

function CaptureChrome({ title, onClose, children }) {
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const page = typeof ZENITH !== 'undefined' ? ZENITH.page : '#FFFFFF';
  return (
    <div style={{ position: 'absolute', inset: 0, background: page, display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: 72, paddingLeft: 20, paddingRight: 20, paddingBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" aria-label="Close" onClick={onClose} style={{
          background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F5F5F7',
          border: 'none', borderRadius: 12, width: 44, height: 44, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke={ink} strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: ink }}>{title}</h2>
        <div style={{ width: 44 }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 28px', display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

function DraftPreview({ result, locale, onUse, extra }) {
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#6E6E73';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  if (!result && !extra) return null;
  return (
    <div style={{ background: card, borderRadius: 20, padding: '16px 18px', marginTop: 16, boxShadow: '0 2px 12px rgba(90,50,20,0.06)' }}>
      {result && result.transcript ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted, lineHeight: 1.45, marginBottom: 10 }}>{result.transcript}</p>
      ) : null}
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: ink, letterSpacing: -0.8 }}>
        {result && result.amount != null ? (typeof fmtInr === 'function' ? fmtInr(result.amount) : '₹' + result.amount) : '₹—'}
      </p>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: ink, marginTop: 4 }}>{(result && result.merchant) || '—'}</p>
      {extra}
      {onUse && (
        <button
          type="button"
          onClick={onUse}
          style={{
            marginTop: 14, width: '100%', minHeight: 48, border: 'none', borderRadius: 14, cursor: 'pointer',
            background: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#C45C26', color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
          }}
        >{t(locale, 'addFromVoice')}</button>
      )}
    </div>
  );
}

function VoiceEntryScreen({ onClose, onManual, onDraft, locale }) {
  const loc = locale || 'en';
  const [status, setStatus] = React.useState(null);
  const [phase, setPhase] = React.useState('idle');
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState(null);
  const recRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const timerRef = React.useRef(null);
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#6E6E73';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#C45C26';

  React.useEffect(() => {
    if (typeof loadCaptureStatus === 'function') loadCaptureStatus().then(setStatus);
    else setStatus({ sarvam: false });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recRef.current && recRef.current.state === 'recording') recRef.current.stop();
    };
  }, []);

  const configured = !!(status && status.sarvam);

  const stopRec = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (recRef.current && recRef.current.state === 'recording') recRef.current.stop();
  };

  const startRec = async () => {
    setError('');
    setResult(null);
    if (!configured) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Microphone is not available in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setPhase('sending');
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
          const dataUrl = await blobToDataUrl(blob);
          const json = await transcribeVoice(dataUrl, rec.mimeType || 'audio/webm');
          setResult(json);
          setPhase('done');
        } catch (err) {
          setError((err && err.message) || 'Could not transcribe');
          setPhase('idle');
        }
      };
      recRef.current = rec;
      rec.start();
      setPhase('recording');
      timerRef.current = setTimeout(stopRec, 25000);
    } catch (err) {
      setError((err && err.message) || 'Microphone permission denied');
      setPhase('idle');
    }
  };

  const useDraft = () => {
    onDraft && onDraft({
      amount: result && result.amount != null ? result.amount : undefined,
      note: (result && result.merchant) || '',
      merchant: (result && result.merchant) || '',
    });
  };

  return (
    <CaptureChrome title={t(loc, 'voiceTitle')} onClose={onClose}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: ink, marginBottom: 8 }}>{t(loc, 'voiceTitle')}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: muted, lineHeight: 1.5, marginBottom: 18 }}>{t(loc, 'voiceHint')}</p>
      {!configured && status && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: typeof ZENITH !== 'undefined' ? ZENITH.warn : '#A15C12', lineHeight: 1.45, marginBottom: 16 }}>{t(loc, 'voiceNeedKey')}</p>
      )}
      {error ? <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#B42318', marginBottom: 12 }}>{error}</p> : null}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <button
          type="button"
          disabled={!configured || phase === 'sending'}
          aria-label={phase === 'recording' ? t(loc, 'voiceStop') : t(loc, 'voiceHold')}
          onClick={() => (phase === 'recording' ? stopRec() : startRec())}
          style={{
            width: 88, height: 88, borderRadius: 44, border: 'none',
            cursor: configured ? 'pointer' : 'not-allowed',
            background: !configured ? '#D9C8B6' : (phase === 'recording' ? '#B42318' : accent),
            color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800,
            boxShadow: configured ? '0 10px 24px rgba(196,92,38,0.3)' : 'none',
          }}
        >{phase === 'recording' ? t(loc, 'voiceStop') : (phase === 'sending' ? '…' : 'mic')}</button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginTop: 12 }}>
          {phase === 'recording' ? t(loc, 'voiceListening') : phase === 'sending' ? t(loc, 'voiceSending') : t(loc, 'voiceHold')}
        </p>
      </div>
      <DraftPreview locale={loc} result={result} onUse={result ? useDraft : null} />
      <button
        type="button"
        aria-label={t(loc, 'firstExpense')}
        onClick={onManual}
        style={{
          marginTop: 'auto', minHeight: 48, padding: '14px 22px', border: 'none', borderRadius: 16, cursor: 'pointer',
          background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F5F5F7',
          color: ink, fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}
      >{locale === 'hi' ? 'मैन्युअल जोड़ें' : 'Add manually'}</button>
    </CaptureChrome>
  );
}

function CameraScanScreen({ onClose, onManual, onDraft, locale }) {
  const loc = locale || 'en';
  const fileRef = React.useRef(null);
  const [status, setStatus] = React.useState(null);
  const [phase, setPhase] = React.useState('idle');
  const [error, setError] = React.useState('');
  const [photo, setPhoto] = React.useState('');
  const [result, setResult] = React.useState(null);
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#6E6E73';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#C45C26';

  React.useEffect(() => {
    if (typeof loadCaptureStatus === 'function') loadCaptureStatus().then(setStatus);
    else setStatus({ vision: false });
  }, []);

  const visionOn = !!(status && status.vision);

  const onFile = async (file) => {
    if (!file) return;
    setError('');
    setResult(null);
    setPhase('compress');
    try {
      const dataUrl = typeof compressImageFile === 'function' ? await compressImageFile(file) : await blobToDataUrl(file);
      setPhoto(dataUrl);
      if (visionOn) {
        setPhase('ocr');
        try {
          const json = await ocrReceipt(dataUrl);
          setResult(json);
        } catch (err) {
          setError((err && err.message) || 'OCR failed');
        }
      }
      setPhase('done');
    } catch (err) {
      setError((err && err.message) || 'Could not read photo');
      setPhase('idle');
    }
  };

  const useDraft = () => {
    onDraft && onDraft({
      amount: result && result.amount != null ? result.amount : undefined,
      note: (result && result.merchant) || '',
      merchant: (result && result.merchant) || '',
      receiptPhoto: photo,
    });
  };

  return (
    <CaptureChrome title={t(loc, 'scanTitle')} onClose={onClose}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: ink, marginBottom: 8 }}>{t(loc, 'scanTitle')}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: muted, lineHeight: 1.5, marginBottom: 12 }}>{t(loc, 'scanHint')}</p>
      {!visionOn && status && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: typeof ZENITH !== 'undefined' ? ZENITH.warn : '#A15C12', lineHeight: 1.45, marginBottom: 12 }}>{t(loc, 'scanNoOcr')}</p>
      )}
      {error ? <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#B42318', marginBottom: 12 }}>{error}</p> : null}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label={t(loc, 'attachPhoto')}
        style={{ display: 'none' }}
        onChange={(e) => onFile(e.target.files && e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => fileRef.current && fileRef.current.click()}
        style={{
          minHeight: 52, border: 'none', borderRadius: 16, cursor: 'pointer',
          background: accent, color: '#fff',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}
      >{t(loc, 'attachPhoto')}</button>
      {phase === 'ocr' || phase === 'compress' ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginTop: 12 }}>{phase === 'compress' ? 'Compressing…' : 'Reading receipt…'}</p>
      ) : null}
      {photo ? (
        <img src={photo} alt="Receipt preview" style={{ marginTop: 16, width: '100%', borderRadius: 16, maxHeight: 220, objectFit: 'cover' }} />
      ) : null}
      <DraftPreview
        locale={loc}
        result={result || (photo ? { amount: null, merchant: '', transcript: '' } : null)}
        onUse={photo ? useDraft : null}
        extra={!visionOn && photo ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 8 }}>{t(loc, 'scanNoOcr')}</p>
        ) : null}
      />
      <button
        type="button"
        onClick={onManual}
        style={{
          marginTop: 'auto', minHeight: 48, padding: '14px 22px', border: 'none', borderRadius: 16, cursor: 'pointer',
          background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F5F5F7',
          color: ink, fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}
      >{locale === 'hi' ? 'मैन्युअल जोड़ें' : 'Add manually'}</button>
    </CaptureChrome>
  );
}

Object.assign(window, { VoiceEntryScreen, CameraScanScreen });
