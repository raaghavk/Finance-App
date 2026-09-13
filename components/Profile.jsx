// Profile.jsx — You tab: obvious Edit, then dedicated account / category managers

function ProfileScreen({ store, onSetLocale, onReset, onNavigate, onExport, onSaveAccount, onDeleteAccount, onSetTheme, onSetLock, onExportJson, onImportJson, onUnlockPro, cloud, onCloudSignIn, onCloudSignUp, onCloudSignOut }) {
  const locale = store.user.locale || 'en';
  const [editing, setEditing] = React.useState(false);
  const [sheet, setSheet] = React.useState(null);
  const standalone = typeof window !== 'undefined' && (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || window.navigator.standalone === true
  );
  const daysTracking = (() => {
    if (!store.startedAt) return 1;
    const a = new Date(store.startedAt + 'T12:00:00');
    const b = new Date();
    return Math.max(1, Math.ceil((b - a) / 86400000));
  })();
  const totalTransactions = (store.transactions || []).length;
  const budget = totalBudgetLimit(store);
  const spent = monthExpenseTotal(store);
  const saved = Math.max(budget - spent, 0);
  const page = typeof ZENITH !== 'undefined' ? ZENITH.page : '#F5F5F7';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB';
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#0F172A';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#64748B';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  const cream = typeof ZENITH !== 'undefined' ? ZENITH.cream : '#E8EEF7';
  const hairline = typeof ZENITH !== 'undefined' ? ZENITH.hairline : 'rgba(15,23,42,0.08)';
  const cats = store.categories || [];
  const parents = typeof parentCategories === 'function'
    ? parentCategories(cats, 'expense')
    : cats.filter((c) => c.type === 'expense' && !c.parentId);

  const Row = ({ label, sub, last, danger, children, onClick, showChevron }) => (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
      style={{
        padding: '14px 20px',
        borderBottom: last ? 'none' : '1px solid ' + hairline,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 56,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: danger ? '#FF3B30' : ink }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {children}
        {showChevron && typeof ZenithChevron === 'function' ? <ZenithChevron /> : null}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'relative', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader
          title={t(locale, 'you')}
          rightLabel={editing ? t(locale, 'done') : t(locale, 'edit')}
          rightAria={editing ? t(locale, 'done') : t(locale, 'edit')}
          onRight={() => setEditing((v) => !v)}
        />
      ) : (
        <div style={{ paddingTop: 'var(--zenith-pad-top)', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" aria-label={t(locale, 'edit')} onClick={() => setEditing((v) => !v)} style={{
            border: 'none', background: 'none', color: accent, fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800,
          }}>{editing ? t(locale, 'done') : t(locale, 'edit')}</button>
        </div>
      )}

      <div style={{ padding: '4px 24px 24px', textAlign: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 28, margin: '0 auto 14px',
          background: 'linear-gradient(145deg, #2563EB, #1D4ED8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 34, fontWeight: 800, color: '#FFFFFF' }}>
            {(store.user.name || 'Z')[0].toUpperCase()}
          </span>
        </div>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: ink, marginBottom: 4 }}>
          {store.user.name}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted }}>
          {store.startedAt ? new Date(store.startedAt + 'T12:00:00').toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {[
            { label: locale === 'hi' ? 'दिन' : 'Days', value: daysTracking },
            { label: locale === 'hi' ? 'लेन-देन' : 'Txns', value: totalTransactions },
            { label: locale === 'hi' ? 'बचा' : 'Left', value: fmtCompact(saved) },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: card, borderRadius: 18, padding: '14px 8px' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: accent }}>{s.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{
        margin: '0 20px 16px', padding: '12px 14px', borderRadius: 14, background: cream,
        fontFamily: 'Inter, sans-serif', fontSize: 13, color: accent, lineHeight: 1.4,
      }}>{t(locale, 'customizeHint')}</p>

      {!standalone && (
        <p style={{
          margin: '0 20px 16px', padding: '12px 14px', borderRadius: 14, background: cream,
          fontFamily: 'Inter, sans-serif', fontSize: 13, color: accent, lineHeight: 1.4,
        }}>{t(locale, 'installHome')}</p>
      )}

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {t(locale, 'travel')}
      </p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row
          label={t(locale, 'travel')}
          sub={zenithIsPro && zenithIsPro(store) ? t(locale, 'paid') : t(locale, 'headingSomewhere')}
          last
          onClick={() => onNavigate && onNavigate('travel')}
          showChevron
        />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{t(locale, 'language')}</p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row label={t(locale, 'language')} last>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['en', 'English'], ['hi', 'हिंदी']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={locale === id}
                onClick={() => onSetLocale && onSetLocale(id)}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: locale === id ? accent : cream,
                  color: locale === id ? '#fff' : ink,
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                }}
              >{label}</button>
            ))}
          </div>
        </Row>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'पैसा' : 'Money'}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, padding: '0 24px', marginBottom: 8, lineHeight: 1.4 }}>{t(locale, 'moneyHint')}</p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row label={locale === 'hi' ? 'मुद्रा' : 'Currency'} sub="INR" />
        {(typeof zenithNotionEnabled === 'function' && zenithNotionEnabled()) ? (
          <>
            <Row
              label={t(locale, 'notionExpenses')}
              sub={locale === 'hi' ? 'Notion से पढ़ें · INR' : 'Read-only from Notion · INR'}
              onClick={() => onNavigate && onNavigate('notionExpenses')}
              showChevron
            />
            <Row
              label={t(locale, 'notionAccounts')}
              sub={locale === 'hi' ? 'शुरुआती शेष ± खर्च' : 'Opening ± tagged spend'}
              onClick={() => onNavigate && onNavigate('notionAccounts')}
              showChevron
            />
            <Row
              label={t(locale, 'notionBudgets')}
              sub={locale === 'hi' ? 'इस महीने बचा' : 'Left this month by category'}
              onClick={() => onNavigate && onNavigate('notionBudgets')}
              showChevron
            />
          </>
        ) : (
          (typeof localAccountBalances === 'function' ? localAccountBalances(store) : []).map((row) => {
            const cap = typeof accountBudgetLimit === 'function' ? accountBudgetLimit(store, row.id) : 0;
            return (
              <Row
                key={row.id}
                label={acctLabel(row, locale) || row.name}
                sub={fmt(row.balance) + (cap > 0 ? ' · ' + t(locale, 'monthlyCap') + ' ' + fmt(cap) : '')}
                onClick={() => setSheet({ kind: 'account', item: row })}
                showChevron={!editing}
              >
                {editing ? (
                  <span aria-hidden="true">{typeof ZenithPencil === 'function' ? <ZenithPencil /> : '✎'}</span>
                ) : null}
              </Row>
            );
          })
        )}
        <Row
          label={t(locale, 'manageAccounts')}
          sub={t(locale, 'addAccount') + ' · ' + t(locale, 'edit')}
          onClick={() => onNavigate && onNavigate('accounts')}
          showChevron
        />
        <Row label={t(locale, 'budgets')} sub={budget > 0 ? fmt(budget) : t(locale, 'noBudgetYet')} onClick={() => onNavigate && onNavigate('budget')} showChevron />
        <Row
          label={t(locale, 'netWorth')}
          sub={typeof netWorthSnapshot === 'function' ? fmt(netWorthSnapshot(store).net) : t(locale, 'walletsInNet')}
          last
          onClick={() => onNavigate && onNavigate('networth')}
          showChevron
        />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{t(locale, 'categories')}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, padding: '0 24px', marginBottom: 8, lineHeight: 1.4 }}>{t(locale, 'categoryHint')}</p>
      <div style={{ background: card, marginBottom: 20 }}>
        {parents.slice(0, 4).map((c) => {
          const kids = typeof childCategories === 'function' ? childCategories(cats, c.id) : [];
          const preview = typeof categoryPreview === 'function' ? categoryPreview(cats, c.id, locale) : kids.map((k) => k.name).join(', ');
          return (
            <Row
              key={c.id}
              label={catLabel(c, locale) + (kids.length ? '(' + kids.length + ')' : '')}
              sub={preview || c.emoji}
              onClick={() => onNavigate && onNavigate('categories')}
              showChevron
            />
          );
        })}
        <Row
          label={t(locale, 'manageCategories')}
          sub={t(locale, 'addCategory') + ' · ' + t(locale, 'subcategory')}
          last
          onClick={() => onNavigate && onNavigate('categories')}
          showChevron
        />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {t(locale, 'appearance')}
      </p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row label={t(locale, 'darkMode')} last>
          <button
            type="button"
            aria-pressed={(store.settings && store.settings.theme) === 'dark'}
            onClick={() => onSetTheme && onSetTheme((store.settings && store.settings.theme) === 'dark' ? 'light' : 'dark')}
            style={{
              width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
              background: (store.settings && store.settings.theme) === 'dark' ? accent : '#E5E5EA', position: 'relative',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: (store.settings && store.settings.theme) === 'dark' ? 21 : 3,
              width: 20, height: 20, borderRadius: 10, background: '#fff', display: 'block',
            }} />
          </button>
        </Row>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {t(locale, 'security')}
      </p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row
          label={t(locale, 'appLock')}
          sub={(store.settings && store.settings.lock && store.settings.lock.enabled) ? t(locale, 'turnOffLock') : t(locale, 'pinDigits')}
          last
          onClick={() => setSheet({ kind: 'lock' })}
          showChevron
        />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {t(locale, 'zenithPro')}
      </p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row
          label={t(locale, 'zenithPro')}
          sub={zenithIsPro && zenithIsPro(store) ? t(locale, 'paid') : t(locale, 'proPrice')}
          last
          onClick={() => onUnlockPro && onUnlockPro()}
          showChevron
        />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {t(locale, 'cloudAccount')}
      </p>
      <CloudBackupCard
        locale={locale}
        cloud={cloud}
        onSignIn={onCloudSignIn}
        onSignUp={onCloudSignUp}
        onSignOut={onCloudSignOut}
      />

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: muted, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'गोपनीयता' : 'Privacy'}
      </p>
      <div style={{ background: card, marginBottom: 20 }}>
        <Row
          label={locale === 'hi' ? 'CSV निकालें' : 'Export CSV'}
          sub={locale === 'hi' ? 'इस डिवाइस पर डाउनलोड' : 'Download on this device'}
          onClick={onExport}
          showChevron
        />
        <Row
          label={t(locale, 'backupJson')}
          sub={t(locale, 'exportJson')}
          onClick={onExportJson}
          showChevron
        />
        <Row
          label={t(locale, 'importJson')}
          sub={locale === 'hi' ? 'बैकअप फ़ाइल से रीस्टोर' : 'Restore from a backup file'}
          onClick={onImportJson}
          showChevron
        />
        <Row
          label={t(locale, 'sendFeedback')}
          sub={locale === 'hi' ? 'ईमेल से बताएँ क्या टूटा' : 'Email what broke or what to add'}
          onClick={() => { window.location.href = 'support.html'; }}
          showChevron
        />
        <Row
          label={t(locale, 'privacyPolicy')}
          sub={locale === 'hi' ? 'पहले इस फ़ोन पर · वैकल्पिक क्लाउड' : 'Local first · optional cloud account'}
          onClick={() => { window.location.href = 'privacy.html'; }}
          showChevron
        />
        <Row
          label={locale === 'hi' ? 'सारा डेटा मिटाएँ' : 'Clear all data'}
          danger
          sub={locale === 'hi' ? 'ऑनबोर्डिंग फिर से शुरू होगी' : 'Starts onboarding again'}
          last
          onClick={onReset}
        />
      </div>

      <div style={{ textAlign: 'center', padding: '8px 24px 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, lineHeight: 1.45 }}>{t(locale, 'localOnly')}</p>
      </div>

      {sheet && sheet.kind === 'account' && typeof AccountForm === 'function' && (
        <AccountForm
          locale={locale}
          account={sheet.item ? { ...sheet.item, _cap: typeof accountBudgetLimit === 'function' ? accountBudgetLimit(store, sheet.item.id) : 0 } : null}
          canDelete={!!(sheet.item && (store.accounts || []).length > 1 && editing)}
          onCancel={() => setSheet(null)}
          onDelete={() => { onDeleteAccount && onDeleteAccount(sheet.item.id); setSheet(null); }}
          onSave={(draft) => { onSaveAccount && onSaveAccount(sheet.item && sheet.item.id, draft); setSheet(null); }}
        />
      )}
      {sheet && sheet.kind === 'lock' && (
        <LockSetupSheet
          locale={locale}
          lock={store.settings && store.settings.lock}
          onCancel={() => setSheet(null)}
          onSave={(lock) => { onSetLock && onSetLock(lock); setSheet(null); }}
        />
      )}
    </div>
  );
}

function CloudBackupCard({ locale, cloud, onSignIn, onSignUp, onSignOut }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#0F172A';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#64748B';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  const cream = typeof ZENITH !== 'undefined' ? ZENITH.cream : '#E8EEF7';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB';
  const enabled = cloud && cloud.enabled;
  const user = cloud && cloud.user;
  const statusLine = !enabled ? t(locale, 'cloudOff')
    : user ? (cloud.status === 'syncing' ? t(locale, 'cloudSyncing') : cloud.status === 'error' ? t(locale, 'cloudError') : t(locale, 'cloudSynced'))
    : t(locale, 'cloudSignedOut');

  const submit = async (mode) => {
    if (!email.trim() || String(password).length < 6) {
      setMsg(t(locale, 'cloudNeedEmail'));
      return;
    }
    const fn = mode === 'up' ? onSignUp : onSignIn;
    if (!fn) {
      setMsg(t(locale, 'cloudOff'));
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const result = await fn(email.trim(), password);
      if (result && result.error) setMsg(result.error.message || t(locale, 'cloudError'));
      else if (result && result.needsConfirm) setMsg(t(locale, 'cloudConfirmEmail'));
    } catch (err) {
      setMsg(t(locale, 'cloudError'));
    }
    setBusy(false);
  };

  return (
    <div style={{ background: card, marginBottom: 20, padding: '16px 20px 18px' }}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{t(locale, 'cloudAccount')}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginTop: 4, lineHeight: 1.45 }}>{statusLine}</p>
      {user ? (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: ink, margin: '12px 0' }}>{user.email || user.id}</p>
          <button type="button" disabled={busy} onClick={() => onSignOut && onSignOut()} style={{
            width: '100%', padding: '12px', border: 'none', borderRadius: 14, cursor: 'pointer',
            background: cream, color: ink, fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800,
          }}>{t(locale, 'signOut')}</button>
        </>
      ) : (
        <>
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '12px 0 6px' }}>{t(locale, 'cloudEmail')}</label>
          <input type="email" autoComplete="email" aria-invalid={msg ? 'true' : 'false'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={typeof moneyInputStyle === 'function' ? moneyInputStyle() : { width: '100%', padding: 12, borderRadius: 12, border: 'none', background: cream }} />
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '12px 0 6px' }}>{t(locale, 'cloudPassword')}</label>
          <input type="password" autoComplete="current-password" aria-invalid={msg ? 'true' : 'false'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" style={typeof moneyInputStyle === 'function' ? moneyInputStyle() : { width: '100%', padding: 12, borderRadius: 12, border: 'none', background: cream }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, margin: '8px 0 12px', lineHeight: 1.4 }}>{t(locale, 'cloudPasswordHint')}</p>
          {msg ? <p role="alert" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#B91C1C', marginBottom: 10 }}>{msg}</p> : null}
          {busy ? <p role="status" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: accent, marginBottom: 10 }}>{t(locale, 'cloudSyncing')}</p> : null}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" disabled={busy || !enabled} onClick={() => submit('in')} style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: 14, cursor: enabled ? 'pointer' : 'default',
              background: enabled ? accent : cream, color: enabled ? '#fff' : muted,
              fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800,
            }}>{busy ? t(locale, 'cloudSyncing') : t(locale, 'cloudSignIn')}</button>
            <button type="button" disabled={busy || !enabled} onClick={() => submit('up')} style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: 14, cursor: enabled ? 'pointer' : 'default',
              background: cream, color: enabled ? accent : muted,
              fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800,
            }}>{t(locale, 'cloudSignUp')}</button>
          </div>
        </>
      )}
    </div>
  );
}

function LockSetupSheet({ locale, lock, onSave, onCancel }) {
  const [pin, setPin] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [err, setErr] = React.useState('');
  const enabled = lock && lock.enabled;
  return (
    <MoneySheet title={t(locale, 'appLock')} onClose={onCancel} footer={(
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexDirection: 'column' }}>
        {err ? <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#EF4444' }}>{err}</p> : null}
        {enabled ? (
          <button type="button" onClick={() => onSave({ enabled: false, pinHash: '', webauthn: false })} style={{
            padding: '14px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
            fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer',
          }}>{t(locale, 'turnOffLock')}</button>
        ) : (
          <button type="button" onClick={() => {
            if (!pinLooksValid(pin) || pin !== confirm) { setErr(t(locale, 'pinMismatch')); return; }
            onSave({ enabled: true, pinHash: hashPin(pin), webauthn: !!(typeof PublicKeyCredential !== 'undefined') });
          }} style={{
            padding: '14px', border: 'none', borderRadius: 14, background: '#2563EB', color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer',
          }}>{t(locale, 'turnOnLock')}</button>
        )}
      </div>
    )}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 1.4 }}>{t(locale, 'lockHint')}</p>
      {!enabled && (
        <>
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 6 }}>{t(locale, 'setPin')}</label>
          <input inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="••••" style={moneyInputStyle()} />
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: '14px 0 6px' }}>{t(locale, 'confirmPin')}</label>
          <input inputMode="numeric" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="••••" style={moneyInputStyle()} />
        </>
      )}
    </MoneySheet>
  );
}

Object.assign(window, { ProfileScreen, LockSetupSheet, CloudBackupCard });
