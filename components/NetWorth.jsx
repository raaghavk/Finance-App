// NetWorth.jsx — Assets vs liabilities tracker

function NetWorthScreen({ onBack }) {
  const [assets, setAssets] = React.useState([
    { id: 1, name: 'Savings Account',  type: 'asset',     amount: 187000, color: '#34D399', icon: '🏦' },
    { id: 2, name: 'Fixed Deposit',    type: 'asset',     amount: 250000, color: '#007AFF', icon: '📈' },
    { id: 3, name: 'Mutual Funds',     type: 'asset',     amount: 142000, color: '#5856D6', icon: '💹' },
    { id: 4, name: 'Cash in Hand',     type: 'asset',     amount: 12000,  color: '#60A5FA', icon: '💵' },
    { id: 5, name: 'Gold',             type: 'asset',     amount: 85000,  color: '#F59E0B', icon: '🪙' },
    { id: 6, name: 'Credit Card',      type: 'liability', amount: 18400,  color: '#FF3B30', icon: '💳' },
    { id: 7, name: 'Personal Loan',    type: 'liability', amount: 45000,  color: '#FF6B6B', icon: '📋' },
  ]);

  const totalAssets = assets.filter(a => a.type === 'asset').reduce((s, a) => s + a.amount, 0);
  const totalLiab   = assets.filter(a => a.type === 'liability').reduce((s, a) => s + a.amount, 0);
  const netWorth    = totalAssets - totalLiab;
  const healthScore = Math.min(Math.round((netWorth / totalAssets) * 100), 100);

  const history = [
    { month: 'Nov', nw: 512000 },
    { month: 'Dec', nw: 548000 },
    { month: 'Jan', nw: 561000 },
    { month: 'Feb', nw: 578000 },
    { month: 'Mar', nw: 596000 },
    { month: 'Apr', nw: 612600 },
  ];
  const maxNW = Math.max(...history.map(h => h.nw));
  const minNW = Math.min(...history.map(h => h.nw));

  // SVG line chart
  const chartW = 320, chartH = 80;
  const pts = history.map((h, i) => {
    const x = (i / (history.length - 1)) * chartW;
    const y = chartH - ((h.nw - minNW) / (maxNW - minNW)) * chartH * 0.85 - 4;
    return `${x},${y}`;
  });
  const linePath = 'M ' + pts.join(' L ');
  const areaPath = linePath + ` L ${chartW},${chartH} L 0,${chartH} Z`;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#F2F2F7', paddingTop: 70, paddingBottom: 100 }}>
      <div style={{ padding: '4px 24px 16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8E8E93', marginBottom: 3 }}>April 2026</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 30, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>Net Worth</h1>
      </div>

      {/* Hero card */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{ background: 'linear-gradient(145deg, #1C1C2E, #0D1117)', borderRadius: 24, padding: '22px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(52,211,153,0.06)' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Total Net Worth</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 42, fontWeight: 800, color: '#34D399', letterSpacing: -1, marginBottom: 4 }}>₹{(netWorth/100000).toFixed(2)}L</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>↑ ₹{((netWorth - history[history.length-2].nw) / 1000).toFixed(0)}k vs last month</p>

          {/* Sparkline */}
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#34D399" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#nwGrad)"/>
            <path d={linePath} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {history.map((h, i) => {
              const [x, y] = pts[i].split(',').map(Number);
              return <circle key={i} cx={x} cy={y} r={i === history.length - 1 ? 4 : 2.5} fill="#34D399"/>;
            })}
          </svg>
        </div>
      </div>

      {/* Assets vs Liabilities */}
      <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Assets</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#34D399', letterSpacing: -0.5 }}>₹{(totalAssets/100000).toFixed(2)}L</p>
        </div>
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Liabilities</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#FF3B30', letterSpacing: -0.5 }}>₹{(totalLiab/1000).toFixed(0)}k</p>
        </div>
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 18, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Health</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 22, fontWeight: 800, color: '#007AFF', letterSpacing: -0.5 }}>{healthScore}%</p>
        </div>
      </div>

      {/* Assets list */}
      {['asset','liability'].map(type => (
        <div key={type} style={{ padding: '0 20px', marginBottom: 14 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#8E8E93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, paddingLeft: 4 }}>{type === 'asset' ? 'Assets' : 'Liabilities'}</p>
          <div style={{ background: '#FFFFFF', borderRadius: 22, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {assets.filter(a => a.type === type).map((a, i, arr) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid #F2F2F7' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700, color: '#1C1C1E', marginBottom: 2 }}>{a.name}</p>
                  <div style={{ height: 3, background: '#F2F2F7', borderRadius: 2, marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${(a.amount / (type === 'asset' ? totalAssets : totalLiab)) * 100}%`, background: a.color, borderRadius: 2 }} />
                  </div>
                </div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: 15, fontWeight: 700, color: type === 'liability' ? '#FF3B30' : '#1C1C1E', flexShrink: 0 }}>
                  {type === 'liability' ? '−' : ''}₹{a.amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { NetWorthScreen });
