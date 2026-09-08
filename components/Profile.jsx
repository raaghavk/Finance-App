// Profile.jsx — You tab: obvious Edit, then dedicated account / category managers

function ProfileScreen({ store, onSetLocale, onReset, onNavigate, onExport, onSaveAccount, onDeleteAccount }) {
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
        borderBottom: last ? 'none' : '1px solid #F2F2F7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 56,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: danger ? '#FF3B30' : '#1C1C1E' }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>}
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
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 800, color: '#121212', marginBottom: 4 }}>
          {store.user.name}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73' }}>
          {store.startedAt ? new Date(store.startedAt + 'T12:00:00').toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          {[
            { label: locale === 'hi' ? 'दिन' : 'Days', value: daysTracking },
            { label: locale === 'hi' ? 'लेन-देन' : 'Txns', value: totalTransactions },
            { label: locale === 'hi' ? 'बचा' : 'Left', value: fmtCompact(saved) },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '14px 8px' }}>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 20, fontWeight: 800, color: accent }}>{s.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{
        margin: '0 20px 16px', padding: '12px 14px', borderRadius: 14, background: '#E8EEF7',
        fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1D4ED8', lineHeight: 1.4,
      }}>{t(locale, 'customizeHint')}</p>

      {!standalone && (
        <p style={{
          margin: '0 20px 16px', padding: '12px 14px', borderRadius: 14, background: '#E8EEF7',
          fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1D4ED8', lineHeight: 1.4,
        }}>{t(locale, 'installHome')}</p>
      )}

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{t(locale, 'language')}</p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
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
                  background: locale === id ? accent : '#F0F0F3',
                  color: locale === id ? '#fff' : '#3C3C43',
                  fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700,
                }}
              >{label}</button>
            ))}
          </div>
        </Row>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'पैसा' : 'Money'}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', padding: '0 24px', marginBottom: 8, lineHeight: 1.4 }}>{t(locale, 'moneyHint')}</p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
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
        <Row label={t(locale, 'budgets')} sub={budget > 0 ? fmt(budget) : t(locale, 'noBudgetYet')} onClick={() => onNavigate && onNavigate('budget')} last showChevron />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>{t(locale, 'categories')}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', padding: '0 24px', marginBottom: 8, lineHeight: 1.4 }}>{t(locale, 'categoryHint')}</p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
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

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'बाद में' : 'Later'}
      </p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        <Row label={locale === 'hi' ? 'ट्रैवल' : 'Travel'} sub={t(locale, 'travelLater')} last />
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>
        {locale === 'hi' ? 'गोपनीयता' : 'Privacy'}
      </p>
      <div style={{ background: '#FFFFFF', marginBottom: 20 }}>
        <Row
          label={locale === 'hi' ? 'CSV निकालें' : 'Export CSV'}
          sub={locale === 'hi' ? 'इस डिवाइस पर डाउनलोड' : 'Download on this device'}
          onClick={onExport}
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
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', lineHeight: 1.45 }}>{t(locale, 'localOnly')}</p>
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
    </div>
  );
}

Object.assign(window, { ProfileScreen });
