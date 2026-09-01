import React from 'react';

export default function TopStatusBar({
  classifiedRoad,
  confidence,
  isOutage,
  simStatus,
  backendConnected
}) {
  const roadStr = (classifiedRoad || 'highway').replace('_', ' ').toUpperCase();
  const confPct = Math.round((confidence || 0.95) * 100);

  const getSimBadgeColor = () => {
    switch (simStatus) {
      case 'RUNNING': return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399', label: 'RUNNING' };
      case 'PAUSED': return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', color: '#fde047', label: 'PAUSED' };
      case 'STOPPED': return { bg: 'rgba(239, 68, 68, 0.25)', border: '#ef4444', color: '#fca5a5', label: 'STOPPED' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', border: '#475569', color: '#94a3b8', label: 'IDLE' };
    }
  };

  const simBadge = getSimBadgeColor();

  return (
    <div style={{
      background: 'rgba(9, 13, 22, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1e293b',
      padding: '12px 24px',
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Brand & Engine Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '15px'
          }}>
            RT
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ROADTRACE AI
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>
              AV-03 MAP-MATCHING INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Engine Online Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 'bold', color: '#94a3b8' }}>
          <span>ML <span style={{ color: '#10b981' }}>●</span></span>
          <span>GNSS <span style={{ color: isOutage ? '#ef4444' : '#10b981' }}>●</span></span>
          <span>IMU <span style={{ color: '#10b981' }}>●</span></span>
          <span>HMM <span style={{ color: '#a855f7' }}>●</span></span>
          <span>FUSION <span style={{ color: '#38bdf8' }}>●</span></span>
        </div>
      </div>

      {/* Live Telemetry Status Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#0f172a', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Current Road</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: classifiedRoad === 'highway' ? '#60a5fa' : '#fb923c' }}>
            {roadStr}
          </div>
        </div>

        <div style={{ background: '#0f172a', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Confidence</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: confPct >= 75 ? '#34d399' : '#fca5a5' }}>
            {confPct}%
          </div>
        </div>

        <div style={{ background: '#0f172a', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>GNSS Signal</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: isOutage ? '#ef4444' : '#34d399' }}>
            {isOutage ? 'LOST (35s)' : 'ONLINE'}
          </div>
        </div>

        {/* Simulation Lifecycle Badge */}
        <div style={{
          background: simBadge.bg,
          border: `1px solid ${simBadge.border}`,
          color: simBadge.color,
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '800',
          letterSpacing: '0.05em'
        }}>
          SIMULATION: {simBadge.label}
        </div>
      </div>
    </div>
  );
}
