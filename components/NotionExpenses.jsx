// NotionExpenses.jsx — read-only Notion Expenses list + this-month INR report

function SourceSwitch({ locale, active, onLocal, onNotion }) {
  const localLabel = locale === 'hi' ? t(locale, 'localLedger') : t(locale, 'localLedger');
  const notionLabel = t(locale, 'notionSource');
  const pill = (id, label, onClick, selected) => (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        flex: 1, padding: '8px 10px', border: 'none', borderRadius: 10, cursor: 'pointer',
        background: selected ? '#FFFFFF' : 'transparent',
        color: selected ? '#1C1C1E' : '#6E6E73',
        fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800,
        boxShadow: selected ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
      }}
    >{label}</button>
  );
  return (
    <div style={{ display: 'flex', background: '#E8E8ED', borderRadius: 12, padding: 3, marginBottom: 14 }} role="tablist" aria-label={t(locale, 'notionSource')}>
      {pill('local', localLabel, onLocal, active === 'local')}
      {pill('notion', notionLabel, onNotion, active === 'notion')}
    </div>
  );
}

function BreakdownBlock({ title, rows, colors }) {
  if (!rows || rows.length === 0) return null;
  const max = Math.max.apply(null, rows.map((r) => r.total)) || 1;
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '14px 16px', marginBottom: 12 }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#8E8E93', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>{title}</p>
      {rows.map((row) => {
        const color = (colors && colors[row.key]) || '#007AFF';
        return (
          <div key={row.key} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{row.key}</span>
              <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color: '#1C1C1E' }}>{fmtInr(row.total)}</span>
            </div>
            <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${Math.min(row.total / max, 1) * 100}%`, background: color, borderRadius: 2 }} />
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
  const bg = snap.source === 'error' ? '#FFF0F0' : isMock ? '#FFF8E8' : '#ECFDF3';
  const color = snap.source === 'error' ? '#FF3B30' : isMock ? '#B45309' : '#15803D';
  const title = snap.source === 'notion'
    ? t(locale, 'notionLive')
    : snap.source === 'error'
      ? t(locale, 'notionError')
      : t(locale, 'notionExample');
  const body = snap.source === 'notion'
    ? t(locale, 'notionReadOnly')
    : (snap.warning || t(locale, 'notionMissing'));
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '12px 14px', marginBottom: 14 }}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color, marginBottom: 4 }}>{title}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#3C3C43', lineHeight: 1.4 }}>{body}</p>
      {snap.source !== 'notion' && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 8, padding: '6px 10px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: '#FFFFFF', color: '#007AFF', fontFamily: 'Manrope, sans-serif', fontSize: 12, fontWeight: 700,
          }}
        >{t(locale, 'notionRetry')}</button>
      )}
    </div>
  );
}

function NotionExpenseRow({ expense, locale, last }) {
  const color = (CATEGORY_COLORS && CATEGORY_COLORS[expense.category]) || '#007AFF';
  const bits = [
    relDate(expense.date, locale),
    expense.category,
    expense.kind,
    expense.trip,
  ].filter(Boolean);
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid #F2F2F7',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} aria-hidden="true">
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 800, color }}>{(expense.category || '•').slice(0, 2)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: '#1C1C1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expense.name || '—'}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{bits.join(' · ')}</p>
      </div>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#FF3B30' }}>{fmtInr(expense.amount)}</p>
    </div>
  );
}

function NotionExpensesScreen({ store, onNavigate }) {
  const locale = (store && store.user && store.user.locale) || 'en';
  const [snap, setSnap] = React.useState(typeof getCachedNotionExpenses === 'function' ? getCachedNotionExpenses() : null);
  const [loading, setLoading] = React.useState(!snap);

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

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 110 }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5, marginBottom: 12 }}>{t(locale, 'notionExpenses')}</h1>
        <SourceSwitch
          locale={locale}
          active="notion"
          onLocal={() => onNavigate && onNavigate('activity')}
          onNotion={() => {}}
        />
        <NotionStatusBanner snap={snap} locale={locale} onRetry={() => refresh(true)} />

        <div style={{
          background: 'linear-gradient(145deg, #007AFF 0%, #0056CC 100%)',
          borderRadius: 24, padding: '22px 20px', marginBottom: 14,
          boxShadow: '0 10px 28px rgba(0,122,255,0.28)',
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.78)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'notionThisMonth')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1 }}>
            {loading && !report ? '…' : fmtInr(report ? report.total : 0)}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            {report ? (report.monthKey + ' · ' + report.count + (locale === 'hi' ? ' खर्च' : ' expenses')) : ''}
          </p>
        </div>

        {report && (
          <>
            <BreakdownBlock title={t(locale, 'notionByCategory')} rows={report.byCategory} colors={CATEGORY_COLORS} />
            <BreakdownBlock title={t(locale, 'notionByKind')} rows={report.byKind} colors={KIND_COLORS} />
            <BreakdownBlock title={t(locale, 'notionByTrip')} rows={report.byTrip} colors={{ 'Vietnam Sep 2026': '#22C55E', 'Varanasi Sep 2026': '#F97316', 'Other trip': '#6B7280' }} />
          </>
        )}

        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#121212', margin: '8px 0 10px' }}>{t(locale, 'recent')}</h3>
        {loading && !snap ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>…</p>
        ) : recent.length === 0 ? (
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '28px 16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#1C1C1E' }}>{t(locale, 'notionEmpty')}</p>
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden' }}>
            {recent.map((e, i) => (
              <NotionExpenseRow key={e.id || i} expense={e} locale={locale} last={i === recent.length - 1} />
            ))}
          </div>
        )}
        {monthRows.length > 0 && monthRows.length !== recent.length && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93', marginTop: 10 }}>
            {locale === 'hi' ? 'इस महीने की सूची ऊपर के कुल में है।' : 'This-month totals include every dated row in the current calendar month.'}
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
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t(locale, 'notionExpenses')}
      onClick={() => onOpen && onOpen()}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen && onOpen(); }}
      style={{
        margin: '0 20px 20px',
        background: '#F5F5F7',
        borderRadius: 20,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 14, background: '#E8F1FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }} aria-hidden="true">
        <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#007AFF' }}>N</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#1C1C1E' }}>{t(locale, 'notionExpenses')}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#6E6E73', marginTop: 2 }}>
          {t(locale, 'notionThisMonth')} · {report ? fmtInr(report.total) : '…'}
          {example ? ' · ' + t(locale, 'notionExample') : ''}
        </p>
      </div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#C7C7CC' }} aria-hidden="true">›</span>
    </div>
  );
}

Object.assign(window, { NotionExpensesScreen, NotionHomeCard, SourceSwitch });
