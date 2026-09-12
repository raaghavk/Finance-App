// SavingsGoals.jsx — persisted savings goals on zenith_v1_store

function GoalForm({ locale, goal, onSave, onCancel, onDelete }) {
  const [name, setName] = React.useState(goal && goal.name ? goal.name : '');
  const [target, setTarget] = React.useState(goal && goal.target ? String(goal.target) : '');
  const [emoji, setEmoji] = React.useState(goal && goal.emoji ? goal.emoji : (GOAL_EMOJI ? GOAL_EMOJI[0] : '🏆'));
  const [due, setDue] = React.useState(goal && goal.due ? goal.due : '');
  const colors = GOAL_COLORS || ['#2563EB'];
  const [color, setColor] = React.useState(goal && goal.color ? goal.color : colors[0]);
  const ok = name.trim().length > 0 && (parseFloat(target) || 0) > 0;
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const accent = ZENITH.accent;

  return (
    <MoneySheet title={goal && goal.id ? t(locale, 'edit') : t(locale, 'addGoal')} onClose={onCancel} footer={(
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {goal && goal.id && onDelete ? (
          <button type="button" onClick={onDelete} style={{
            padding: '14px 16px', border: 'none', borderRadius: 14, background: '#FEE2E2', color: '#B91C1C',
            fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer',
          }}>{t(locale, 'delete')}</button>
        ) : null}
        <button type="button" disabled={!ok} onClick={() => onSave({
          name: name.trim(), target: parseFloat(target) || 0, emoji, color, due,
        })} style={{
          flex: 1, padding: '14px', border: 'none', borderRadius: 14, cursor: ok ? 'pointer' : 'default',
          background: ok ? accent : '#E5E5EA', color: '#fff',
          fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 800,
        }}>{t(locale, 'saveChanges')}</button>
      </div>
    )}>
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, marginBottom: 6 }}>{t(locale, 'goalName')}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" style={moneyInputStyle()} />
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'goalTarget')}</label>
      <input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100000" style={moneyInputStyle()} />
      <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13, color: muted, margin: '14px 0 6px' }}>{t(locale, 'dueDate')}</label>
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={moneyInputStyle()} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        {(GOAL_EMOJI || ['🏆']).map((em) => (
          <button key={em} type="button" onClick={() => setEmoji(em)} style={{
            width: 40, height: 40, borderRadius: 12, border: emoji === em ? '2px solid ' + accent : '1px solid ' + ZENITH.cream,
            background: ZENITH.card, cursor: 'pointer', fontSize: 18,
          }}>{em}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {colors.map((c) => (
          <button key={c} type="button" aria-label={c} onClick={() => setColor(c)} style={{
            width: 28, height: 28, borderRadius: 14, border: color === c ? '2px solid ' + ink : '2px solid transparent',
            background: c, cursor: 'pointer',
          }} />
        ))}
      </div>
    </MoneySheet>
  );
}

function SavingsGoalsScreen({ store, onSaveGoal, onDeleteGoal, onContribute, onBack }) {
  const locale = store.user.locale || 'en';
  const goals = store.goals || [];
  const [selected, setSelected] = React.useState(null);
  const [addAmount, setAddAmount] = React.useState('');
  const [sheet, setSheet] = React.useState(null);
  const totalSaved = goals.reduce((s, g) => s + (Number(g.saved) || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (Number(g.target) || 0), 0);
  const ink = ZENITH.ink;
  const muted = ZENITH.muted;
  const page = ZENITH.page;
  const card = ZENITH.card;
  const accent = ZENITH.accent;

  const addSavings = (id) => {
    const val = parseFloat(addAmount);
    if (isNaN(val) || val <= 0) return;
    onContribute && onContribute(id, val);
    setAddAmount('');
    setSelected(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: page, paddingBottom: 'var(--zenith-pad-bottom)' }}>
      {typeof ZenithScreenHeader === 'function' ? (
        <ZenithScreenHeader title={t(locale, 'goals')} leftLabel="‹" onLeft={onBack} rightLabel={t(locale, 'newGoal')} onRight={() => setSheet({})} />
      ) : (
        <div style={{ paddingTop: 'var(--zenith-pad-top)', padding: '12px 20px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: ink }}>{t(locale, 'goals')}</h1>
        </div>
      )}

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{
          background: zenithHeroGradient(), borderRadius: 22, padding: '20px 22px',
          boxShadow: zenithHeroShadow(), position: 'relative', overflow: 'hidden',
        }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{t(locale, 'savedTotal')}</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 36, fontWeight: 800, color: '#FFFFFF', letterSpacing: -1, marginBottom: 16 }}>{fmt(totalSaved)}</p>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 3, overflow: 'hidden', marginBottom: 10, display: 'flex' }}>
            {goals.map((g) => (
              <div key={g.id} style={{ height: '100%', width: totalTarget > 0 ? ((g.saved / totalTarget) * 100) + '%' : 0, background: g.color }} />
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            {totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) + '% · ' + fmt(totalTarget) : t(locale, 'newGoal')}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: muted, padding: '8px 4px' }}>
            {locale === 'hi' ? 'पहला बचत लक्ष्य जोड़ें।' : 'Add a savings target to track progress.'}
          </p>
        )}
        {goals.map((goal) => {
          const pct = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
          const remaining = Math.max(goal.target - goal.saved, 0);
          const isSelected = selected === goal.id;
          return (
            <div key={goal.id} style={{
              background: card, borderRadius: 22, overflow: 'hidden', boxShadow: zenithSoftShadow(),
              border: isSelected ? '1.5px solid ' + goal.color : '1.5px solid transparent',
            }}>
              <div onClick={() => setSelected(isSelected ? null : goal.id)} style={{ padding: '18px 18px 14px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: goal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{goal.emoji}</div>
                    <div>
                      <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 700, color: ink, marginBottom: 3 }}>{goal.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: pct >= 1 ? ZENITH.live : muted, fontWeight: 600 }}>
                        {pct >= 1 ? t(locale, 'onTrack') : t(locale, 'needsBoost')}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 18, fontWeight: 800, color: ink }}>{Math.round(pct * 100)}%</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: muted }}>{goal.due ? relDate(goal.due, locale) : ''}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: goal.color }}>{fmt(goal.saved)}</p>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 800, color: ink }}>{fmt(remaining)}</p>
                </div>
                <div style={{ height: 5, background: ZENITH.cream, borderRadius: 3 }}>
                  <div style={{ height: '100%', width: (pct * 100) + '%', background: goal.color, borderRadius: 3 }} />
                </div>
              </div>
              {isSelected && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid ' + ZENITH.cream }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: muted, fontWeight: 600, marginBottom: 10, paddingTop: 14 }}>{t(locale, 'contribute')}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1000, 5000, 10000].map((amt) => (
                      <button key={amt} type="button" onClick={() => setAddAmount(String(amt))} style={{
                        flex: 1, padding: '10px 0', border: '1.5px solid ' + (addAmount === String(amt) ? goal.color : ZENITH.cream),
                        borderRadius: 12, background: addAmount === String(amt) ? goal.color + '12' : 'transparent',
                        cursor: 'pointer', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700,
                        color: addAmount === String(amt) ? goal.color : ink,
                      }}>{fmtCompact(amt)}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input type="number" placeholder="0" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} style={{
                      flex: 1, padding: '12px 14px', border: '1.5px solid ' + ZENITH.cream, borderRadius: 12,
                      fontFamily: 'Inter, sans-serif', fontSize: 14, color: ink, background: page, outline: 'none',
                    }} />
                    <button type="button" onClick={() => addSavings(goal.id)} style={{
                      padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: goal.color, color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
                    }}>{t(locale, 'addTxn')}</button>
                  </div>
                  <button type="button" onClick={() => setSheet(goal)} style={{
                    marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: accent,
                  }}>{t(locale, 'edit')}</button>
                </div>
              )}
            </div>
          );
        })}
        <button type="button" onClick={() => setSheet({})} style={{
          width: '100%', padding: '18px', border: '1.5px dashed ' + muted, borderRadius: 22,
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: muted, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600,
        }}>+ {t(locale, 'newGoal')}</button>
      </div>

      {sheet && typeof GoalForm === 'function' && (
        <GoalForm
          locale={locale}
          goal={sheet.id ? sheet : null}
          onCancel={() => setSheet(null)}
          onDelete={sheet.id ? () => { onDeleteGoal && onDeleteGoal(sheet.id); setSheet(null); } : undefined}
          onSave={(draft) => { onSaveGoal && onSaveGoal(sheet.id || null, draft); setSheet(null); }}
        />
      )}
    </div>
  );
}

Object.assign(window, { SavingsGoalsScreen, GoalForm });
