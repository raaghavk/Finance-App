// NotionMoney.jsx — Accounts balances + Budgets left-this-month (Notion read-only)

function notionInk() { return typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E'; }
function notionMuted() { return typeof ZENITH !== 'undefined' ? ZENITH.muted : '#8E8E93'; }
function notionCard() { return typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF'; }
function notionPage() { return typeof ZENITH !== 'undefined' ? ZENITH.page : '#F2F5FA'; }
function notionAccent() { return typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB'; }

function accountTint(name) {
  return (typeof ACCOUNT_COLORS !== 'undefined' && ACCOUNT_COLORS[name]) || notionAccent();
}

function isSpendOnlyWallet(row) {
  if (!row) return false;
  if (row.spendOnly) return true;
  return typeof isSpendOnlyAccount === 'function' && isSpendOnlyAccount(row.name);
}

function accountInitials(name) {
  if (name === 'IDFC (UPI/debit)') return 'ID';
  if (name === 'Kamlesh UPI') return 'KU';
  return String(name || '?').slice(0, 2);
}

function formatWalletBalance(row) {
  if (!row) return '₹—';
  if (isSpendOnlyWallet(row)) return fmtInr(row.spent);
  if (row.balance === null || row.balance === undefined) return '₹—';
  return fmtInr(row.balance);
}

function walletBalanceHint(row, locale) {
  if (isSpendOnlyWallet(row)) return t(locale, 'notionSpendOnly');
  if (row.openingMissing) return t(locale, 'notionOpeningMissing');
  return t(locale, 'notionBalance');
}

function NotionMoneyBanner({ snap, locale, onRetry }) {
  if (typeof NotionStatusBanner === 'function') {
    return <NotionStatusBanner snap={snap} locale={locale} onRetry={onRetry} />;
  }
  return null;
}

function AccountCard({ row, locale, compact, onOpen }) {
  const color = accountTint(row.name);
  const spendOnly = isSpendOnlyWallet(row);
  const ink = notionInk();
  const muted = notionMuted();
  const amountColor = spendOnly ? ink : (row.balance < 0 ? '#B42318' : ink);
  return (
    <div
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={onOpen ? (e) => { if (e.key === 'Enter') onOpen(); } : undefined}
      style={{
        minWidth: compact ? 188 : undefined,
        width: compact ? 188 : '100%',
        background: notionCard(),
        borderRadius: 22,
        padding: compact ? '16px 16px 14px' : '18px 18px 16px',
        boxShadow: '0 2px 14px rgba(15,23,42,0.06)',
        cursor: onOpen ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }} aria-hidden="true">
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 800, color }}>{accountInitials(row.name)}</span>
        </div>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: ink, lineHeight: 1.2 }}>{row.name || '—'}</p>
      </div>
      <p style={{
        fontFamily: 'Manrope, sans-serif', fontSize: compact ? 22 : 28, fontWeight: 800,
        color: amountColor,
        letterSpacing: -0.6, lineHeight: 1.1,
      }}>{formatWalletBalance(row)}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 4 }}>{walletBalanceHint(row, locale)}</p>
      {!compact && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 8, lineHeight: 1.4 }}>
          {spendOnly
            ? t(locale, 'notionSpendOnlyHint')
            : (t(locale, 'notionOpening') + ' ' + (row.openingMissing ? '₹—' : fmtInr(row.openingBalance)) + ' · ' + t(locale, 'notionSpentTagged') + ' ' + fmtInr(row.spent))}
        </p>
      )}
    </div>
  );
}

function BudgetProgressRow({ row, locale }) {
  const color = (typeof CATEGORY_COLORS !== 'undefined' && CATEGORY_COLORS[row.category]) || notionAccent();
  const ink = notionInk();
  const muted = notionMuted();
  const pct = row.pct == null ? 0 : Math.min(Math.max(row.pct, 0), 1);
  const barColor = row.over ? '#B42318' : (row.pct != null && row.pct >= 0.9 ? (typeof ZENITH !== 'undefined' ? ZENITH.warn : '#D97706') : color);
  const leftLabel = row.capMissing
    ? t(locale, 'notionCapMissing')
    : row.over
      ? t(locale, 'notionOverBy', { n: fmtInr(Math.abs(row.left)) })
      : t(locale, 'notionLeftMonth');
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{row.name || row.category || '—'}</p>
        <p style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
          color: row.over ? '#B42318' : ink, whiteSpace: 'nowrap',
        }}>{row.capMissing ? fmtInr(row.spent) : fmtInr(row.left)}</p>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginBottom: 8 }}>{leftLabel}</p>
      <div style={{ height: 7, background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#E8EEF7', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${row.capMissing ? 0 : pct * 100}%`, background: barColor, borderRadius: 4 }} />
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 6 }}>
        {fmtInr(row.spent)}{row.capMissing ? '' : ' / ' + fmtInr(row.monthlyCap)}
      </p>
    </div>
  );
}

function NotionAccountsStrip({ locale, onOpen }) {
  const [snap, setSnap] = React.useState(typeof getCachedNotionAccounts === 'function' ? getCachedNotionAccounts() : null);
  React.useEffect(() => {
    if (typeof loadNotionAccounts === 'function') loadNotionAccounts(false).then(setSnap);
  }, []);
  const rows = (snap && snap.balances) || [];
  if (!snap) {
    return (
      <div style={{ padding: '0 24px 18px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: notionMuted() }}>…</p>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ padding: '0 24px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: notionInk() }}>{t(locale, 'notionAccounts')}</h3>
        <button type="button" onClick={() => onOpen && onOpen()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: notionAccent(), fontWeight: 600 }}>
          {t(locale, 'seeAll')}
        </button>
      </div>
      <div style={{ overflowX: 'auto', paddingLeft: 20, paddingRight: 20, display: 'flex', gap: 12 }}>
        {rows.map((row) => (
          <AccountCard key={row.id || row.name} row={row} locale={locale} compact onOpen={() => onOpen && onOpen()} />
        ))}
      </div>
    </div>
  );
}

function NotionBudgetsPreview({ locale, onOpen }) {
  const [snap, setSnap] = React.useState(typeof getCachedNotionBudgets === 'function' ? getCachedNotionBudgets() : null);
  React.useEffect(() => {
    if (typeof loadNotionBudgets === 'function') loadNotionBudgets(false).then(setSnap);
  }, []);
  const rows = ((snap && snap.progress) || []).slice(0, 4);
  const ink = notionInk();
  const muted = notionMuted();
  const card = notionCard();
  return (
    <div style={{ padding: '0 20px', marginBottom: 24 }}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t(locale, 'notionLeftMonth')}
        onClick={() => onOpen && onOpen()}
        onKeyDown={(e) => { if (e.key === 'Enter') onOpen && onOpen(); }}
        style={{
          background: card, borderRadius: 24, padding: '16px 18px 8px',
          boxShadow: '0 2px 14px rgba(15,23,42,0.06)', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{t(locale, 'notionLeftMonth')}</p>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: notionAccent(), fontWeight: 600 }}>{t(locale, 'seeAll')}</span>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginBottom: 4 }}>
          {t(locale, 'notionBudgets')} · {(snap && snap.monthKey) || ''}
          {(!snap || snap.source !== 'notion') ? ' · ' + t(locale, 'notionExample') : ''}
        </p>
        {rows.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, padding: '12px 0' }}>{t(locale, 'notionBudgetsEmpty')}</p>
        ) : rows.map((row) => (
          <BudgetProgressRow key={row.id || row.category} row={row} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function NotionAccountsScreen({ store, onNavigate }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const [snap, setSnap] = React.useState(typeof getCachedNotionAccounts === 'function' ? getCachedNotionAccounts() : null);
  const [loading, setLoading] = React.useState(!snap);
  const refresh = React.useCallback((force) => {
    setLoading(true);
    loadNotionAccounts(force).then((data) => {
      setSnap(data);
      setLoading(false);
    });
  }, []);
  React.useEffect(() => { refresh(false); }, [refresh]);
  const rows = (snap && snap.balances) || [];
  const ink = notionInk();
  const muted = notionMuted();

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: notionPage(), paddingTop: 'var(--zenith-pad-top)', paddingBottom: 'var(--zenith-pad-bottom)' }}>
      <div style={{ padding: '0 20px 24px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 6 }}>{t(locale, 'notionAccounts')}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 14, lineHeight: 1.45 }}>{t(locale, 'notionAccountsHint')}</p>
        <NotionMoneyBanner snap={snap} locale={locale} onRetry={() => refresh(true)} />
        {loading && !snap ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted }}>…</p>
        ) : rows.length === 0 ? (
          <div style={{ background: notionCard(), borderRadius: 18, padding: '28px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink }}>{t(locale, 'notionAccountsEmpty')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((row) => (
              <AccountCard key={row.id || row.name} row={row} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotionBudgetsScreen({ store, onNavigate }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const [snap, setSnap] = React.useState(typeof getCachedNotionBudgets === 'function' ? getCachedNotionBudgets() : null);
  const [loading, setLoading] = React.useState(!snap);
  const refresh = React.useCallback((force) => {
    setLoading(true);
    loadNotionBudgets(force).then((data) => {
      setSnap(data);
      setLoading(false);
    });
  }, []);
  React.useEffect(() => { refresh(false); }, [refresh]);
  const rows = (snap && snap.progress) || [];
  const ink = notionInk();
  const muted = notionMuted();
  const leftTotal = rows.reduce(function (sum, row) {
    if (row.capMissing || typeof row.left !== 'number') return sum;
    return sum + Math.max(row.left, 0);
  }, 0);

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: notionPage(), paddingTop: 'var(--zenith-pad-top)', paddingBottom: 'var(--zenith-pad-bottom)' }}>
      <div style={{ padding: '0 20px 24px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 6 }}>{t(locale, 'notionBudgets')}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 14, lineHeight: 1.45 }}>{t(locale, 'notionBudgetsHint')}</p>
        <NotionMoneyBanner snap={snap} locale={locale} onRetry={() => refresh(true)} />

        <div style={{
          background: 'linear-gradient(145deg, #2563EB 0%, #1D4ED8 100%)',
          borderRadius: 26, padding: '24px 22px', marginBottom: 14,
          boxShadow: '0 12px 28px rgba(29,78,216,0.28)',
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'notionLeftMonth')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1.2, lineHeight: 1.05 }}>
            {loading && !snap ? '…' : fmtInr(leftTotal)}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.86)', marginTop: 8 }}>
            {(snap && snap.monthKey) || ''} · {t(locale, 'notionAcrossCaps')}
          </p>
        </div>

        {loading && !snap ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted }}>…</p>
        ) : rows.length === 0 ? (
          <div style={{ background: notionCard(), borderRadius: 18, padding: '28px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink }}>{t(locale, 'notionBudgetsEmpty')}</p>
          </div>
        ) : (
          <div style={{ background: notionCard(), borderRadius: 22, padding: '4px 18px 8px', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
            {rows.map((row, i) => (
              <div key={row.id || row.category} style={{ borderBottom: i === rows.length - 1 ? 'none' : undefined }}>
                <BudgetProgressRow row={row} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  NotionAccountsScreen,
  NotionBudgetsScreen,
  NotionAccountsStrip,
  NotionBudgetsPreview,
  AccountCard,
  BudgetProgressRow,
});
