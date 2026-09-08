// CategoriesManager.jsx — parent + subcategory editor (Money Manager depth, Zenith visuals)

function CategoriesManagerScreen({
  store, onBack, onSaveCategory, onDeleteCategory, onReorder, onToggleSubcategories,
}) {
  const locale = (store.user && store.user.locale) || 'en';
  const [editing, setEditing] = React.useState(true);
  const [openParent, setOpenParent] = React.useState(null);
  const [sheet, setSheet] = React.useState(null);
  const page = typeof ZENITH !== 'undefined' ? ZENITH.page : '#F2F5FA';
  const accent = typeof ZENITH !== 'undefined' ? ZENITH.accent : '#2563EB';
  const cats = store.categories || [];
  const showSubs = store.showSubcategories !== false;
  const parents = (typeof parentCategories === 'function' ? parentCategories(cats, 'expense') : cats.filter((c) => c.type === 'expense' && !c.parentId));
  const focus = openParent ? cats.find((c) => c.id === openParent) : null;
  const rows = focus
    ? (typeof childCategories === 'function' ? childCategories(cats, focus.id) : cats.filter((c) => c.parentId === focus.id))
    : parents;

  const title = focus ? catLabel(focus, locale) : t(locale, 'categories');
  const expenseCount = cats.filter((c) => c.type === 'expense').length;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      <ZenithScreenHeader
        title={title}
        leftLabel={focus ? '‹ ' + t(locale, 'categories') : '‹ ' + t(locale, 'you')}
        onLeft={() => { if (focus) setOpenParent(null); else onBack && onBack(); }}
        rightLabel="+"
        rightAria={focus ? t(locale, 'addSubcategory') : t(locale, 'addCategory')}
        onRight={() => setSheet({ item: focus ? { parentId: focus.id } : null })}
      />

      {!focus && (
        <div style={{
          margin: '0 0 12px', padding: '14px 20px', background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{t(locale, 'subcategory')}</p>
          <button
            type="button"
            role="switch"
            aria-checked={showSubs}
            aria-label={t(locale, 'subcategory')}
            onClick={() => onToggleSubcategories && onToggleSubcategories(!showSubs)}
            style={{
              width: 52, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer',
              background: showSubs ? accent : '#E5E5EA', position: 'relative',
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: showSubs ? 23 : 3,
              width: 26, height: 26, borderRadius: 13, background: '#fff',
              boxShadow: '0 1px 4px rgba(15,23,42,0.2)',
            }} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px 8px' }}>
        <button type="button" aria-label={editing ? t(locale, 'done') : t(locale, 'edit')} onClick={() => setEditing((v) => !v)} style={{
          border: 'none', background: 'none', color: accent, fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, cursor: 'pointer', minHeight: 44, padding: '0 8px',
        }}>{editing ? t(locale, 'done') : t(locale, 'edit')}</button>
      </div>

      <div style={{ background: '#FFFFFF' }}>
        {rows.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748B', padding: '20px' }}>{t(locale, 'noSubcategories')}</p>
        )}
        {rows.map((c, i) => {
          const kids = typeof childCategories === 'function' ? childCategories(cats, c.id) : [];
          const preview = showSubs && !focus && kids.length
            ? (typeof categoryPreview === 'function' ? categoryPreview(cats, c.id, locale) : kids.map((k) => k.name).join(', '))
            : (c.emoji || '');
          const label = catLabel(c, locale) + (!focus && kids.length && showSubs ? '(' + kids.length + ')' : '');
          return (
            <div key={c.id} style={{
              padding: '12px 16px', borderBottom: '1px solid #F2F2F7',
              display: 'flex', alignItems: 'center', gap: 10, minHeight: 64,
            }}>
              {editing && (
                <button
                  type="button"
                  aria-label={t(locale, 'delete') + ' ' + catLabel(c, locale)}
                  disabled={expenseCount <= 1}
                  onClick={() => { if (expenseCount > 1) onDeleteCategory && onDeleteCategory(c.id); }}
                  style={{
                    width: 28, height: 28, borderRadius: 14, border: 'none', flexShrink: 0,
                    background: expenseCount > 1 ? '#FF3B30' : '#E5E5EA', color: '#fff', fontSize: 18, cursor: expenseCount > 1 ? 'pointer' : 'default',
                  }}
                >−</button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!focus && showSubs && kids.length) setOpenParent(c.id);
                  else setSheet({ item: c });
                }}
                style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                  <span aria-hidden="true" style={{ marginRight: 6 }}>{c.emoji}</span>{label}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preview || t(locale, 'noSubcategories')}
                </p>
              </button>
              {editing && (
                <>
                  <button type="button" aria-label={t(locale, 'editCategory')} onClick={() => setSheet({ item: c })} style={catIconBtn()}>
                    <ZenithPencil />
                  </button>
                  <button type="button" aria-label={t(locale, 'moveUp')} disabled={i === 0} onClick={() => onReorder && onReorder(c.id, -1)} style={catIconBtn()}>↑</button>
                  <button type="button" aria-label={t(locale, 'moveDown')} disabled={i === rows.length - 1} onClick={() => onReorder && onReorder(c.id, 1)} style={catIconBtn()}>↓</button>
                </>
              )}
              {!editing && <ZenithChevron />}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setSheet({ item: focus ? { parentId: focus.id } : null })}
          style={{
            width: '100%', padding: '16px 20px', border: 'none', background: '#fff', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800, color: accent,
          }}
        >+ {focus ? t(locale, 'addSubcategory') : t(locale, 'addCategory')}</button>
      </div>

      {sheet && typeof CategoryForm === 'function' && (
        <CategoryForm
          locale={locale}
          category={sheet.item && sheet.item.id ? sheet.item : (sheet.item && sheet.item.parentId ? { parentId: sheet.item.parentId } : null)}
          parents={parents}
          canDelete={!!(sheet.item && sheet.item.id && expenseCount > 1)}
          onCancel={() => setSheet(null)}
          onDelete={() => { onDeleteCategory && onDeleteCategory(sheet.item.id); setSheet(null); }}
          onSave={(draft) => {
            onSaveCategory && onSaveCategory(sheet.item && sheet.item.id ? sheet.item.id : null, draft);
            setSheet(null);
          }}
        />
      )}
    </div>
  );
}

function catIconBtn() {
  return {
    width: 36, height: 36, border: 'none', borderRadius: 10, background: '#F2F5FA', cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: '#334155', flexShrink: 0,
  };
}

Object.assign(window, { CategoriesManagerScreen });
