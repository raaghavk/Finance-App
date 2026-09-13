// SplitExpense.jsx — live people / IOU ledger (who owes whom)

function PeopleScreen({ store, onBack, onSavePerson, onDeletePerson, onAddIou, onSettlePerson, onSplitEqual }) {
  const locale = (store.user && store.user.locale) || 'en';
  const snap = typeof peopleSnapshot === 'function' ? peopleSnapshot(store) : { rows: [], owedToYou: 0, youOwe: 0, net: 0 };
  const [sheet, setSheet] = React.useState(null);
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const cream = ZENITH.cream;
  const accent = ZENITH.accent;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader title={t(locale, 'people')} leftLabel="‹" onLeft={onBack} rightLabel={t(locale, 'addPerson')} onRight={() => setSheet({ kind: 'person' })} />
      ) : null}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ background: zenithHeroGradient(), borderRadius: 24, padding: '22px 20px', boxShadow: zenithHeroShadow(), marginBottom: 16 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>{t(locale, 'theyOweYou')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff' }}>{fmt(snap.owedToYou)}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 10 }}>{t(locale, 'youOweThem')} {fmt(snap.youOwe)}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={() => setSheet({ kind: 'split' })} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 14, cursor: 'pointer',
            background: accent, color: '#fff', fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 14,
          }}>{t(locale, 'equalSplit')}</button>
          <button type="button" onClick={() => setSheet({ kind: 'person' })} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 14, cursor: 'pointer',
            background: cream, color: ink, fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 14,
          }}>{t(locale, 'addPerson')}</button>
        </div>
        {snap.rows.length === 0 ? (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted, lineHeight: 1.5 }}>{t(locale, 'noPeopleYet')}</p>
        ) : (
          <div style={{ background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow() }}>
            {snap.rows.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSheet({ kind: 'detail', person: p })}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '14px 16px',
                  border: 'none', background: card, cursor: 'pointer', textAlign: 'left',
                  borderBottom: i < snap.rows.length - 1 ? '1px solid ' + cream : 'none',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 14, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: '#fff' }}>{String(p.name || '?')[0].toUpperCase()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{p.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted }}>
                    {p.balance === 0 ? t(locale, 'settledOk') : (p.balance > 0 ? t(locale, 'theyOweYou') : t(locale, 'youOweThem'))}
                  </p>
                </div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: p.balance > 0 ? '#059669' : p.balance < 0 ? '#EF4444' : muted }}>
                  {p.balance === 0 ? '—' : fmt(Math.abs(p.balance))}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      {sheet && sheet.kind === 'person' && (
        <PersonForm locale={locale} person={sheet.person} onCancel={() => setSheet(null)} onSave={(draft) => { onSavePerson && onSavePerson(sheet.person && sheet.person.id, draft); setSheet(null); }} />
      )}
      {sheet && sheet.kind === 'split' && (
        <SplitEqualForm locale={locale} people={store.people || []} onCancel={() => setSheet(null)} onSave={(payload) => { onSplitEqual && onSplitEqual(payload); setSheet(null); }} />
      )}
      {sheet && sheet.kind === 'detail' && (
        <PersonDetailSheet
          locale={locale}
          store={store}
          person={sheet.person}
          onCancel={() => setSheet(null)}
          onEdit={() => setSheet({ kind: 'person', person: sheet.person })}
          onDelete={() => { onDeletePerson && onDeletePerson(sheet.person.id); setSheet(null); }}
          onAddIou={(draft) => { onAddIou && onAddIou(sheet.person.id, draft); }}
          onSettle={() => { onSettlePerson && onSettlePerson(sheet.person.id); }}
        />
      )}
    </div>
  );
}

function PersonForm({ locale, person, onSave, onCancel }) {
  const [name, setName] = React.useState(person && person.name ? person.name : '');
  const ok = name.trim().length > 0;
  return (
    <MoneySheet title={person && person.id ? t(locale, 'edit') : t(locale, 'addPerson')} onClose={onCancel} footer={(
      <button type="button" disabled={!ok} onClick={() => onSave({ name: name.trim() })} style={{
        width: '100%', marginTop: 16, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
        background: ok ? ZENITH.accent : ZENITH.cream, color: ok ? '#fff' : ZENITH.muted,
        fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
      }}>{t(locale, 'save')}</button>
    )}>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.muted, marginBottom: 6 }}>{t(locale, 'personName')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Arjun, Priya…" style={moneyInputStyle()} />
    </MoneySheet>
  );
}

function SplitEqualForm({ locale, people, onSave, onCancel }) {
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const [picked, setPicked] = React.useState(() => {
    const start = {};
    (people || []).forEach((p) => { start[p.id] = true; });
    return start;
  });
  const ids = (people || []).filter((p) => picked[p.id]).map((p) => p.id);
  const total = parseFloat(String(amount).replace(/,/g, '')) || 0;
  const parts = typeof equalSplitShares === 'function'
    ? equalSplitShares(total, ids.length + 1)
    : [];
  const share = parts.length ? parts[0] : (ids.length + 1 > 0 && total > 0 ? Math.round((total / (ids.length + 1)) * 100) / 100 : 0);
  const ok = total > 0 && ids.length > 0;
  return (
    <MoneySheet title={t(locale, 'equalSplit')} onClose={onCancel} footer={(
      <button type="button" disabled={!ok} onClick={() => onSave({ amount: total, note: note.trim(), personIds: ids })} style={{
        width: '100%', marginTop: 16, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
        background: ok ? ZENITH.accent : ZENITH.cream, color: ok ? '#fff' : ZENITH.muted,
        fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
      }}>{ok ? (t(locale, 'youPaid') + ' · ' + fmt(share) + (locale === 'hi' ? ' प्रति' : ' each')) : t(locale, 'equalSplit')}</button>
    )}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.muted, marginBottom: 12 }}>{t(locale, 'youPaid')}</p>
      <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2400" style={moneyInputStyle()} />
      {ok ? <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.accent, marginTop: 8 }}>{fmt(share)} {locale === 'hi' ? 'प्रति व्यक्ति (आप सहित)' : 'each including you'}</p> : null}
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.muted, margin: '14px 0 6px' }}>{t(locale, 'note')}</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dinner, cab, Airbnb…" style={moneyInputStyle()} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: ZENITH.muted, letterSpacing: 0.6, textTransform: 'uppercase', margin: '16px 0 8px' }}>{t(locale, 'people')}</p>
      {(people || []).length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: ZENITH.muted }}>{t(locale, 'noPeopleYet')}</p>
      ) : (people || []).map((p) => (
        <button key={p.id} type="button" onClick={() => setPicked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))} style={{
          display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
        }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: ZENITH.ink }}>{p.name}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: picked[p.id] ? ZENITH.accent : ZENITH.muted, fontWeight: 700 }}>{picked[p.id] ? '✓' : '+'}</span>
        </button>
      ))}
    </MoneySheet>
  );
}

function PersonDetailSheet({ locale, store, person, onCancel, onEdit, onDelete, onAddIou, onSettle }) {
  const [mode, setMode] = React.useState(null);
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');
  const open = ((store && store.ious) || []).filter((row) => row.personId === person.id).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const ok = (parseFloat(amount) || 0) > 0;
  return (
    <MoneySheet title={person.name} onClose={onCancel} footer={(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {mode ? (
          <>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" style={moneyInputStyle()} />
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t(locale, 'note')} style={moneyInputStyle()} />
            <button type="button" disabled={!ok} onClick={() => {
              onAddIou({ amount: (mode === 'owe' ? -1 : 1) * (parseFloat(amount) || 0), note: note.trim(), date: todayISO() });
              setMode(null); setAmount(''); setNote('');
            }} style={{
              padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
              background: ok ? ZENITH.accent : ZENITH.cream, color: ok ? '#fff' : ZENITH.muted,
              fontFamily: 'Manrope, sans-serif', fontWeight: 800,
            }}>{t(locale, 'save')}</button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setMode('they')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: ZENITH.cream, fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer' }}>{t(locale, 'theyOwe')}</button>
            <button type="button" onClick={() => setMode('owe')} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: ZENITH.cream, fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer' }}>{t(locale, 'iOwe')}</button>
          </div>
        )}
        <button type="button" onClick={onSettle} style={{ padding: '12px', border: 'none', borderRadius: 14, background: '#D1FAE5', color: '#047857', fontFamily: 'Manrope, sans-serif', fontWeight: 800, cursor: 'pointer' }}>{t(locale, 'settleUp')}</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onEdit} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: ZENITH.cream, fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'edit')}</button>
          <button type="button" onClick={onDelete} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer' }}>{t(locale, 'delete')}</button>
        </div>
      </div>
    )}>
      {open.length === 0 ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: ZENITH.muted }}>{t(locale, 'noPeopleYet')}</p>
      ) : open.map((row) => (
        <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + ZENITH.cream, opacity: row.settled ? 0.5 : 1 }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: ZENITH.ink }}>{row.note || (row.amount > 0 ? t(locale, 'theyOweYou') : t(locale, 'youOweThem'))}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: ZENITH.muted }}>{row.date}{row.settled ? ' · ' + t(locale, 'settledOk') : ''}</p>
          </div>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: row.amount > 0 ? '#059669' : '#EF4444' }}>{fmt(Math.abs(row.amount))}</p>
        </div>
      ))}
    </MoneySheet>
  );
}

Object.assign(window, { PeopleScreen, SplitExpenseScreen: PeopleScreen });
