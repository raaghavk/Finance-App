// MoneyForms.jsx — add / edit accounts and categories (local store only)

const ZENITH_CAT_COLORS = ['#2563EB', '#34D399', '#F97316', '#8B5CF6', '#EC4899', '#0EA5E9', '#F59E0B', '#EF4444'];
const ZENITH_CAT_EMOJI = ['🛒', '☕', '🚗', '🏠', '💊', '🎬', '📱', '🏦', '✦', '📦', '🍽️', '🛺', '💼', '✨', '🍱', '🪔', '🎓', '🐶', '🏖️', '💍', '🍼', '🎸', '✈️', '🧾'];

function ZenithScreenHeader({ title, leftLabel, onLeft, rightLabel, onRight, rightAria }) {
  const page = typeof ZENITH !== 'undefined' ? ZENITH.page : '#F2F5FA';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB';
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#0F172A';
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 8,
      paddingTop: 'var(--zenith-pad-top)',
      paddingLeft: 8, paddingRight: 8, paddingBottom: 10,
      background: page,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      minHeight: 44,
    }}>
      {onLeft ? (
        <button type="button" onClick={onLeft} style={headerBtnStyle(accent)}>
          {leftLabel || '‹'}
        </button>
      ) : <div style={{ minWidth: 72 }} />}
      <h1 style={{
        fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 800, color: ink,
        textAlign: 'center', flex: 1, letterSpacing: -0.2,
      }}>{title}</h1>
      {onRight ? (
        <button type="button" aria-label={rightAria || rightLabel} onClick={onRight} style={headerBtnStyle(accent, true)}>
          {rightLabel}
        </button>
      ) : <div style={{ minWidth: 72 }} />}
    </div>
  );
}

function headerBtnStyle(accent, emphasize) {
  return {
    minWidth: 72, minHeight: 44, padding: '8px 10px', border: 'none', background: 'none',
    color: accent, fontFamily: 'Manrope, sans-serif', fontSize: emphasize ? 17 : 16,
    fontWeight: 800, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  };
}

function ZenithChevron() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path d="M2 2l6 6-6 6" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ZenithPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12.5l1.2-4.2L11 2.5a1.4 1.4 0 012 2L7.2 12.3 3 13.5 2 12.5z" stroke="#94A3B8" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

function MoneySheet({ title, onClose, children, footer }) {
  const node = (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div
        role="dialog"
        aria-label={title}
        style={{
          width: '100%', background: typeof ZENITH !== 'undefined' ? ZENITH.card : '#FFFFFF', borderRadius: '24px 24px 0 0',
          padding: '16px 20px calc(18px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '88%', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{
            width: 36, height: 36, border: 'none', borderRadius: 12, background: '#F2F5FA', cursor: 'pointer', fontSize: 18,
          }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>{children}</div>
        <div style={{ flexShrink: 0 }}>{footer}</div>
      </div>
    </div>
  );
  if (typeof ReactDOM !== 'undefined' && ReactDOM.createPortal && typeof document !== 'undefined') {
    const host = document.getElementById('root') || document.body;
    return ReactDOM.createPortal(node, host);
  }
  return node;
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

function EmojiPicker({ locale, value, onChange, suggestions }) {
  const [typed, setTyped] = React.useState(value || '');
  React.useEffect(() => { setTyped(value || ''); }, [value]);
  const muted = typeof ZENITH !== 'undefined' ? ZENITH.muted : '#64748B';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB';
  const cream = typeof ZENITH !== 'undefined' ? ZENITH.cream : '#F2F5FA';
  const ink = typeof ZENITH !== 'undefined' ? ZENITH.ink : '#0F172A';
  const list = suggestions || ZENITH_CAT_EMOJI;
  const apply = (raw) => {
    const next = typeof firstEmoji === 'function' ? firstEmoji(raw) : String(raw || '').trim();
    const emoji = next || '✦';
    setTyped(emoji);
    onChange && onChange(emoji);
  };
  return (
    <div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 8px' }}>{t(locale, 'pickAnyEmoji')}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div aria-hidden="true" style={{
          width: 56, height: 56, borderRadius: 16, background: cream, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{value || '✦'}</div>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t(locale, 'pickAnyEmoji')}
          placeholder="🍱 🪔 🐶…"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            const g = typeof firstEmoji === 'function' ? firstEmoji(e.target.value) : e.target.value;
            if (g) onChange && onChange(g);
          }}
          onBlur={() => apply(typed)}
          style={{ ...moneyInputStyle(), flex: 1, fontSize: 22, textAlign: 'center' }}
        />
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, lineHeight: 1.4, marginBottom: 10 }}>{t(locale, 'pickEmojiHint')}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {list.map((em) => (
          <button key={em} type="button" onClick={() => apply(em)} style={{
            width: 44, height: 44, borderRadius: 12, border: value === em ? '2px solid ' + accent : 'none',
            background: cream, fontSize: 20, cursor: 'pointer', color: ink,
          }}>{em}</button>
        ))}
      </div>
    </div>
  );
}

function CategoryForm({ locale, category, canDelete, onSave, onCancel, onDelete, parents }) {
  const [name, setName] = React.useState(category && category.name ? category.name : '');
  const [emoji, setEmoji] = React.useState(category && category.emoji ? category.emoji : '✦');
  const [color, setColor] = React.useState(category && category.color ? category.color : '#2563EB');
  const [parentId, setParentId] = React.useState(category && category.parentId ? category.parentId : '');
  const ok = name.trim().length > 0;
  const parentList = (parents || []).filter((p) => !category || p.id !== category.id);

  return (
    <MoneySheet title={category && category.id ? t(locale, 'editCategory') : (parentId ? t(locale, 'addSubcategory') : t(locale, 'addCategory'))} onClose={onCancel} footer={(
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {canDelete ? (
          <button type="button" onClick={onDelete} style={{
            padding: '14px 16px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer',
          }}>{t(locale, 'delete')}</button>
        ) : null}
        <button type="button" disabled={!ok} onClick={() => onSave({
          name: name.trim(),
          emoji: (typeof firstEmoji === 'function' ? firstEmoji(emoji) : emoji) || '✦',
          color,
          type: (category && category.type) || 'expense',
          parentId: parentId || null,
        })} style={{
          flex: 1, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
          background: ok ? '#2563EB' : '#E5E5EA', color: '#fff',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}>{t(locale, 'saveChanges')}</button>
      </div>
    )}>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginBottom: 6 }}>{t(locale, 'categoryName')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="School fees, Pets…" style={moneyInputStyle()} />
      {parentList.length > 0 && (
        <>
          <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', margin: '14px 0 6px' }}>{t(locale, 'parentCategory')}</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={{ ...moneyInputStyle(), fontWeight: 600 }}>
            <option value="">{locale === 'hi' ? 'कोई नहीं (मूल)' : 'None (top-level)'}</option>
            {parentList.map((p) => (
              <option key={p.id} value={p.id}>{catLabel(p, locale)}</option>
            ))}
          </select>
        </>
      )}
      <EmojiPicker locale={locale} value={emoji} onChange={setEmoji} suggestions={ZENITH_CAT_EMOJI} />
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

Object.assign(window, {
  AccountForm, CategoryForm, EmojiPicker, ZENITH_CAT_COLORS, ZENITH_CAT_EMOJI,
  ZenithScreenHeader, ZenithChevron, ZenithPencil, moneyInputStyle,
});
