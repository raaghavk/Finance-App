// NotionExpenses.jsx — read-only Notion Expenses list + this-month INR report

function SourceSwitch({ locale, active, onLocal, onNotion }) {
  const localLabel = t(locale, 'localLedger');
  const notionLabel = t(locale, 'notionSource');
  const pill = (id, label, onClick, selected) => (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        flex: 1, minHeight: 44, padding: '10px 12px', border: 'none', borderRadius: 12, cursor: 'pointer',
        background: selected ? (typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF') : 'transparent',
        color: selected ? (typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E') : (typeof ZENITH !== 'undefined' ? ZENITH.muted : '#6E6E73'),
        fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800,
        boxShadow: selected ? '0 1px 4px rgba(90,50,20,0.08)' : 'none',
      }}
    >{label}</button>
  );
  return (
    <div style={{
      display: 'flex',
      background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#E8E8ED',
      borderRadius: 14, padding: 4, marginBottom: 14,
    }} role="tablist" aria-label={t(locale, 'notionSource')}>
      {pill('local', localLabel, onLocal, active === 'local')}
      {pill('notion', notionLabel, onNotion, active === 'notion')}
    </div>
  );
}

function BreakdownBlock({ title, rows, colors }) {
  if (!rows || rows.length === 0) return null;
  const max = Math.max.apply(null, rows.map((r) => r.total)) || 1;
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#8E8E93';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  return (
    <div style={{ background: card, borderRadius: 20, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 12px rgba(90,50,20,0.05)' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>{title}</p>
      {rows.map((row) => {
        const color = (colors && colors[row.key]) || (typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF');
        const unpriced = row.count > 0 && row.total === 0;
        return (
          <div key={row.key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: ink }}>{row.key}</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color: ink }}>{fmtInr(unpriced ? null : row.total)}</span>
            </div>
            <div style={{ height: 6, background: typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F2F2F7', borderRadius: 3 }}>
              <div style={{ height: '100%', width: `${Math.min(row.total / max, 1) * 100}%`, background: color, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotionStatusBanner({ snap, locale, onRetry }) {
  if (!snap) return null;
  const isMock = snap.source === 'mock' || snap.source === 'error';
  const bg = snap.source === 'error' ? '#FDECEC' : isMock ? '#F8EAD3' : '#E7F3EA';
  const color = snap.source === 'error' ? '#B42318' : isMock ? (typeof ZENITH !== 'undefined' ? ZENITH.warn : '#B45309') : (typeof ZENITH !== 'undefined' ? ZENITH.live : '#15803D');
  const title = snap.source === 'notion'
    ? t(locale, 'notionLive')
    : snap.source === 'error'
      ? t(locale, 'notionError')
      : t(locale, 'notionExample');
  const body = snap.source === 'notion'
    ? t(locale, 'notionReadOnly')
    : (snap.warning || t(locale, 'notionMissing'));
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 800, color, marginBottom: 4 }}>{title}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: typeof ZENITH !== 'undefined' ? ZENITH.ink : '#3C3C43', lineHeight: 1.45 }}>{body}</p>
      {snap.source !== 'notion' && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 10, minHeight: 40, padding: '8px 12px', border: 'none', borderRadius: 10, cursor: 'pointer',
            background: typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF',
            color: typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF',
            fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700,
          }}
        >{t(locale, 'notionRetry')}</button>
      )}
    </div>
  );
}

function NotionExpenseRow({ expense, locale, last }) {
  const color = (CATEGORY_COLORS && CATEGORY_COLORS[expense.category]) || (typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF');
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#8E8E93';
  const payLabel = locale === 'hi' ? 'भुगतान' : 'Pay';
  const acctLabelText = locale === 'hi' ? 'खाता' : 'Account';
  const bits = [
    relDate(expense.date, locale),
    expense.category,
    expense.kind,
    expense.trip,
    expense.payment ? payLabel + ' ' + expense.payment : null,
    acctLabelText + ' ' + (expense.account || '—'),
  ].filter(Boolean);
  const unpriced = expense.amount === null || expense.amount === undefined;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        minHeight: 72,
        borderBottom: last ? 'none' : '1px solid rgba(90,50,20,0.08)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} aria-hidden="true">
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color }}>{(expense.category || '•').slice(0, 2)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.name || '—'}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 2 }}>{bits.join(' · ')}</p>
        {expense.status === 'Needs receipt' && (
          <span style={{
            display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 8,
            background: '#F8EAD3', color: typeof ZENITH !== 'undefined' ? ZENITH.warn : '#A15C12',
            fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
          }}>{expense.status}</span>
        )}
      </div>
      <p style={{
        fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        color: unpriced ? muted : '#B42318',
      }}>{fmtInr(expense.amount)}</p>
    </div>
  );
}

function NotionExpensesScreen({ store, onNavigate }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const [snap, setSnap] = React.useState(typeof getCachedNotionExpenses === 'function' ? getCachedNotionExpenses() : null);
  const [loading, setLoading] = React.useState(!snap);
  const page = typeof ZENITH !== 'undefined' ? ZENITH.page : '#F2F2F7';
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#8E8E93';

  const refresh = React.useCallback((force) => {
    setLoading(true);
    loadNotionExpenses(force).then((data) => {
      setSnap(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => { refresh(false); }, [refresh]);

  const report = snap && snap.report;
  const monthRows = (snap && snap.expenses || [])
    .filter((e) => expenseMonthKey(e.date) === (report && report.monthKey))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const recent = (snap && snap.expenses || []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 40);
  const unpricedNote = report && report.unpricedCount > 0
    ? t(locale, 'notionUnpriced', { n: report.unpricedCount })
    : '';

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingTop: 70, paddingBottom: 110 }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: ink, letterSpacing: -0.5, marginBottom: 12 }}>{t(locale, 'notionExpenses')}</h1>
        <SourceSwitch
          locale={locale}
          active="notion"
          onLocal={() => onNavigate && onNavigate('activity')}
          onNotion={() => {}}
        />
        <NotionStatusBanner snap={snap} locale={locale} onRetry={() => refresh(true)} />

        <div style={{
          background: 'linear-gradient(145deg, #C45C26 0%, #9A3D18 100%)',
          borderRadius: 26, padding: '24px 22px', marginBottom: 14,
          boxShadow: '0 12px 28px rgba(154,61,24,0.28)',
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.82)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'notionThisMonth')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 40, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1.2, lineHeight: 1.05 }}>
            {loading && !report ? '…' : fmtInr(report ? report.total : 0)}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.86)', marginTop: 8 }}>
            {report ? (report.monthKey + ' · ' + report.count + (locale === 'hi' ? ' खर्च' : ' expenses')) : ''}
          </p>
          {unpricedNote ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 1.4 }}>{unpricedNote}</p>
          ) : null}
        </div>

        {report && (
          <>
            <BreakdownBlock title={t(locale, 'notionByCategory')} rows={report.byCategory} colors={CATEGORY_COLORS} />
            <BreakdownBlock title={t(locale, 'notionByKind')} rows={report.byKind} colors={KIND_COLORS} />
            <BreakdownBlock title={t(locale, 'notionByTrip')} rows={report.byTrip} colors={{ 'Vietnam Sep 2026': '#2F6B3A', 'Varanasi Sep 2026': '#C45C26', 'Other trip': '#8B735F' }} />
          </>
        )}

        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: ink, margin: '8px 0 10px' }}>{t(locale, 'recent')}</h3>
        {loading && !snap ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted }}>…</p>
        ) : recent.length === 0 ? (
          <div style={{ background: card, borderRadius: 18, padding: '28px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: ink }}>{t(locale, 'notionEmpty')}</p>
          </div>
        ) : (
          <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: '0 2px 12px rgba(90,50,20,0.05)' }}>
            {recent.map((e, i) => (
              <NotionExpenseRow key={e.id || i} expense={e} locale={locale} last={i === recent.length - 1} />
            ))}
          </div>
        )}
        {monthRows.length > 0 && monthRows.length !== recent.length && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, marginTop: 10 }}>
            {locale === 'hi' ? 'इस महीने की सूची ऊपर के कुल में है।' : 'This-month totals include every dated row in the current calendar month. Null amounts show as ₹— and are left out of sums.'}
          </p>
        )}
      </div>
    </div>
  );
}

function NotionHomeCard({ locale, onOpen }) {
  const [snap, setSnap] = React.useState(typeof getCachedNotionExpenses === 'function' ? getCachedNotionExpenses() : null);
  React.useEffect(() => {
    loadNotionExpenses(false).then(setSnap);
  }, []);
  const report = snap && snap.report;
  const example = !snap || snap.source !== 'notion';
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#1C1C1E';
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#6E6E73';
  const card = typeof ZENITH !== 'undefined' ? ZENITH.card : '#F5F5F7';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#007AFF';
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t(locale, 'notionExpenses')}
      onClick={() => onOpen && onOpen()}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen && onOpen(); }}
      style={{
        margin: '0 20px 20px',
        background: card,
        borderRadius: 22,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        minHeight: 76,
        boxShadow: '0 2px 14px rgba(90,50,20,0.06)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, background: '#F3E0D2',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }} aria-hidden="true">
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: accent }}>₹</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{t(locale, 'notionExpenses')}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginTop: 2 }}>
          {t(locale, 'notionThisMonth')} · {report ? fmtInr(report.total) : '…'}
          {example ? ' · ' + t(locale, 'notionExample') : ''}
        </p>
      </div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: muted }} aria-hidden="true">›</span>
    </div>
  );
}

Object.assign(window, { NotionExpensesScreen, NotionHomeCard, SourceSwitch });
