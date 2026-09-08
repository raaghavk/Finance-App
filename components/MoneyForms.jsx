// MoneyForms.jsx — add / edit accounts and categories (local store only)

const ZENITH_CAT_COLORS = ['#2563EB', '#34D399', '#F97316', '#8B5CF6', '#EC4899', '#0EA5E9', '#F59E0B', '#EF4444'];
const ZENITH_CAT_EMOJI = ['🛒', '☕', '🚗', '🏠', '💊', '🎬', '📱', '🏦', '✦', '📦'];

function MoneySheet({ title, onClose, children, footer }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div
        role="dialog"
        aria-label={title}
        style={{
          width: '100%', background: '#FFFFFF', borderRadius: '24px 24px 0 0',
          padding: '16px 20px calc(18px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '88%', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{
            width: 36, height: 36, border: 'none', borderRadius: 12, background: '#F2F5FA', cursor: 'pointer', fontSize: 18,
          }}>×</button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

function AccountForm({ locale, account, canDelete, onSave, onCancel, onDelete }) {
  const [name, setName] = React.useState(account && account.name ? account.name : '');
  const [opening, setOpening] = React.useState(account && account.opening != null ? String(account.opening) : '');
  const [cap, setCap] = React.useState(account && account._cap != null && account._cap > 0 ? String(account._cap) : '');
  const ok = name.trim().length > 0;

  return (
    <MoneySheet title={account && account.id ? t(locale, 'editAccount') : t(locale, 'addAccount')} onClose={onCancel} footer={(
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {canDelete ? (
          <button type="button" onClick={onDelete} style={{
            padding: '14px 16px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer',
          }}>{t(locale, 'delete')}</button>
        ) : null}
        <button type="button" disabled={!ok} onClick={() => onSave({
          name: name.trim(),
          opening: parseFloat(opening) || 0,
          cap: parseFloat(cap) || 0,
        })} style={{
          flex: 1, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
          background: ok ? '#2563EB' : '#E5E5EA', color: '#fff',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}>{t(locale, 'saveChanges')}</button>
      </div>
    )}>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 6 }}>{t(locale, 'accountName')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="HDFC, Paytm, Wallet…" style={moneyInputStyle()} />
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: '14px 0 6px' }}>{t(locale, 'openingBalance')}</label>
      <input inputMode="decimal" value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="0" style={moneyInputStyle()} />
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: '14px 0 6px' }}>{t(locale, 'monthlyCap')}</label>
      <input inputMode="decimal" value={cap} onChange={(e) => setCap(e.target.value)} placeholder="e.g. 20000 for Bank" style={moneyInputStyle()} />
    </MoneySheet>
  );
}

function CategoryForm({ locale, category, canDelete, onSave, onCancel, onDelete }) {
  const [name, setName] = React.useState(category && category.name ? category.name : '');
  const [emoji, setEmoji] = React.useState(category && category.emoji ? category.emoji : '✦');
  const [color, setColor] = React.useState(category && category.color ? category.color : '#2563EB');
  const ok = name.trim().length > 0;

  return (
    <MoneySheet title={category && category.id ? t(locale, 'editCategory') : t(locale, 'addCategory')} onClose={onCancel} footer={(
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {canDelete ? (
          <button type="button" onClick={onDelete} style={{
            padding: '14px 16px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer',
          }}>{t(locale, 'delete')}</button>
        ) : null}
        <button type="button" disabled={!ok} onClick={() => onSave({ name: name.trim(), emoji, color, type: (category && category.type) || 'expense' })} style={{
          flex: 1, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
          background: ok ? '#2563EB' : '#E5E5EA', color: '#fff',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}>{t(locale, 'saveChanges')}</button>
      </div>
    )}>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 6 }}>{t(locale, 'categoryName')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="School fees, Pets…" style={moneyInputStyle()} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: '14px 0 8px' }}>Icon</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ZENITH_CAT_EMOJI.map((em) => (
          <button key={em} type="button" onClick={() => setEmoji(em)} style={{
            width: 44, height: 44, borderRadius: 12, border: emoji === em ? '2px solid #2563EB' : 'none',
            background: '#F2F5FA', fontSize: 20, cursor: 'pointer',
          }}>{em}</button>
        ))}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: '14px 0 8px' }}>Color</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ZENITH_CAT_COLORS.map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={c} style={{
            width: 32, height: 32, borderRadius: 16, border: color === c ? '3px solid #0F172A' : '3px solid transparent',
            background: c, cursor: 'pointer',
          }} />
        ))}
      </div>
    </MoneySheet>
  );
}

function moneyInputStyle() {
  return {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid #E2E8F0', fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A',
  };
}

Object.assign(window, { AccountForm, CategoryForm, ZENITH_CAT_COLORS, ZENITH_CAT_EMOJI });
