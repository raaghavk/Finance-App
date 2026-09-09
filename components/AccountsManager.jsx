// AccountsManager.jsx — add / edit / delete / reorder local accounts

function AccountsManagerScreen({ store, onBack, onSaveAccount, onDeleteAccount, onReorder }) {
  const locale = (store.user && store.user.locale) || 'en';
  const [editing, setEditing] = React.useState(true);
  const [sheet, setSheet] = React.useState(null);
  const page = typeof ZENITH !== 'undefined' ? ZENITH.page : '#F2F5FA';
  const accounts = store.accounts || [];
  const bals = typeof localAccountBalances === 'function' ? localAccountBalances(store) : accounts.map((a) => ({ ...a, balance: a.opening || 0 }));

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      <ZenithScreenHeader
        title={t(locale, 'accountsTitle')}
        leftLabel={'‹ ' + t(locale, 'you')}
        onLeft={onBack}
        rightLabel={editing ? t(locale, 'done') : t(locale, 'edit')}
        rightAria={editing ? t(locale, 'done') : t(locale, 'edit')}
        onRight={() => setEditing((v) => !v)}
      />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', padding: '4px 20px 12px', lineHeight: 1.4 }}>
        {t(locale, 'accountsManageHint')}
      </p>
      <div style={{ background: '#FFFFFF' }}>
        {bals.map((row, i) => {
          const cap = typeof accountBudgetLimit === 'function' ? accountBudgetLimit(store, row.id) : 0;
          return (
            <div key={row.id} style={{
              padding: '12px 16px', borderBottom: '1px solid #F2F2F7',
              display: 'flex', alignItems: 'center', gap: 10, minHeight: 64,
            }}>
              {editing && (
                <button
                  type="button"
                  aria-label={t(locale, 'delete') + ' ' + (acctLabel(row, locale) || row.name)}
                  disabled={accounts.length <= 1}
                  onClick={() => { if (accounts.length > 1) onDeleteAccount && onDeleteAccount(row.id); }}
                  style={{
                    width: 28, height: 28, borderRadius: 14, border: 'none', flexShrink: 0, cursor: accounts.length > 1 ? 'pointer' : 'default',
                    background: accounts.length > 1 ? '#FF3B30' : '#E5E5EA', color: '#fff', fontSize: 18, lineHeight: '28px',
                  }}
                >−</button>
              )}
              <button
                type="button"
                onClick={() => setSheet(row)}
                style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{acctLabel(row, locale) || row.name}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginTop: 3 }}>
                  {fmt(row.balance)}{cap > 0 ? ' · ' + t(locale, 'monthlyCap') + ' ' + fmt(cap) : ''}
                </p>
              </button>
              {editing && (
                <>
                  <button type="button" aria-label={t(locale, 'editAccount')} onClick={() => setSheet(row)} style={iconBtn()}>
                    <ZenithPencil />
                  </button>
                  <button type="button" aria-label={t(locale, 'moveUp')} disabled={i === 0} onClick={() => onReorder && onReorder(i, i - 1)} style={iconBtn()}>↑</button>
                  <button type="button" aria-label={t(locale, 'moveDown')} disabled={i === bals.length - 1} onClick={() => onReorder && onReorder(i, i + 1)} style={iconBtn()}>↓</button>
                </>
              )}
              {!editing && <ZenithChevron />}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setSheet('new')}
          style={{
            width: '100%', padding: '16px 20px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#2563EB',
          }}
        >+ {t(locale, 'addAccount')}</button>
      </div>

      {sheet && typeof AccountForm === 'function' && (
        <AccountForm
          locale={locale}
          account={sheet === 'new' ? null : { ...sheet, _cap: typeof accountBudgetLimit === 'function' ? accountBudgetLimit(store, sheet.id) : 0 }}
          canDelete={sheet !== 'new' && accounts.length > 1}
          onCancel={() => setSheet(null)}
          onDelete={() => { onDeleteAccount && onDeleteAccount(sheet.id); setSheet(null); }}
          onSave={(draft) => { onSaveAccount && onSaveAccount(sheet === 'new' ? null : sheet.id, draft); setSheet(null); }}
        />
      )}
    </div>
  );
}

function iconBtn() {
  return {
    width: 36, height: 36, border: 'none', borderRadius: 10, background: '#F2F5FA', cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#334155', flexShrink: 0,
  };
}

Object.assign(window, { AccountsManagerScreen });
