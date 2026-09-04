// Notifications.jsx — Alerts, reminders, budget warnings

const NOTIF_DATA = [
  { id: 1,  type: 'warning', title: 'Entertainment near limit', body: 'You\'ve used 77% of your ₹3,000 budget.', time: '2m ago',   read: false, color: '#FF9500' },
  { id: 2,  type: 'bill',    title: 'Electricity due in 2 days', body: '₹2,800 due on May 3. Tap to mark paid.', time: '1h ago',   read: false, color: '#F59E0B' },
  { id: 3,  type: 'insight', title: 'You\'re spending less!', body: '40% lower than March. Keep it up 🎉',      time: '3h ago',   read: false, color: '#34D399' },
  { id: 4,  type: 'goal',    title: 'Goa Trip — 70% saved',   body: '₹31,500 of ₹45,000 reached.',             time: 'Yesterday', read: true,  color: '#007AFF' },
  { id: 5,  type: 'bill',    title: 'Netflix renews May 12',   body: '₹649 will be charged in 10 days.',        time: 'Yesterday', read: true,  color: '#E50914' },
  { id: 6,  type: 'warning', title: 'Groceries on track',      body: '₹5,600 of ₹8,000 — 70% with 10 days left.','time': '2d ago', read: true,  color: '#34D399' },
  { id: 7,  type: 'insight', title: 'Daily average: ₹682',     body: 'Your spend/day is ₹182 below target.',    time: '3d ago',   read: true,  color: '#5856D6' },
];

const NOTIF_ICONS = {
  warning: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L1.5 15.5h15L9 2z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 8v4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="13.5" r="0.75" fill={c}/></svg>,
  bill:    (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="1" width="14" height="16" rx="2.5" stroke={c} strokeWidth="1.6"/><path d="M5 6h8M5 9h8M5 12h5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  insight: (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.6"/><path d="M9 8v5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="5.5" r="0.8" fill={c}/></svg>,
  goal:    (c) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.6"/><circle cx="9" cy="9" r="3.5" stroke={c} strokeWidth="1.6"/><circle cx="9" cy="9" r="1" fill={c}/></svg>,
};

function NotificationsScreen({ onBack }) {
  const [notifs, setNotifs] = React.useState(NOTIF_DATA);
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setNotifs(prev => prev.filter(n => n.id !== id));
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const [settings, setSettings] = React.useState({ budgetAlerts: true, billReminders: true, insights: true, dailyDigest: false });

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>May 2026</p>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Alerts</h1>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#007AFF', fontWeight: 600, marginTop: 22 }}>
              Mark all read
            </button>
          )}
        </div>
        {unread > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#007AFF', borderRadius: 10, padding: '4px 10px', marginTop: 8 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{unread} new</span>
          </div>
        )}
      </div>

      {/* Notif list */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 17, fontWeight: 700, color: '#3C3C43', marginBottom: 6 }}>All caught up</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8E8E93' }}>No new alerts</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifs.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)} style={{
                background: '#FFFFFF', borderRadius: 20, padding: '16px 16px',
                display: 'flex', gap: 12, alignItems: 'flex-start',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                opacity: n.read ? 0.72 : 1,
                transition: 'opacity 0.2s',
                position: 'relative', cursor: 'pointer',
              }}>
                {!n.read && <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4, background: '#007AFF' }} />}
                <div style={{ width: 40, height: 40, borderRadius: 13, background: n.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(NOTIF_ICONS[n.type] || NOTIF_ICONS.insight)(n.color)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 4 }}>{n.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', lineHeight: 1.4, marginBottom: 6 }}>{n.body}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#C7C7CC', fontWeight: 500 }}>{n.time}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="#C7C7CC" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>Alert Settings</p>
        <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {[
            ['budgetAlerts',   'Budget warnings',    'Alert when 80%+ of budget used'],
            ['billReminders',  'Bill reminders',     'Notify 2 days before due date'],
            ['insights',       'Spending insights',  'Weekly spending comparisons'],
            ['dailyDigest',    'Daily digest',       'Summary every evening at 9 PM'],
          ].map(([key, label, sub], i, arr) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600, color: '#1C1C1E', marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8E8E93' }}>{sub}</p>
              </div>
              <div onClick={() => setSettings(s => ({...s, [key]: !s[key]}))} style={{
                width: 44, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
                background: settings[key] ? '#34C759' : '#E5E5EA',
                position: 'relative', transition: 'background 0.25s',
              }}>
                <div style={{ position: 'absolute', top: 3, left: settings[key] ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { NotificationsScreen });
