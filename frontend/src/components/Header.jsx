import React from 'react';

export default function Header({
  simStatus,
  inferenceMode, // 'LIVE_BACKEND' | 'EDGE_INFERENCE' | 'SYNTHETIC_DEMO'
  isOutage,
  demoMode,
  onToggleDemoMode
}) {
  const getSimBadge = () => {
    switch (simStatus) {
      case 'RUNNING': return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399', text: '● SIMULATION LIVE' };
      case 'PAUSED': return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', color: '#fde047', text: '● SIMULATION PAUSED' };
      case 'STOPPED': return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', color: '#fca5a5', text: '● SIMULATION STOPPED' };
      default: return { bg: 'rgba(148, 163, 184, 0.12)', border: '#475569', color: '#94a3b8', text: '● SIMULATION IDLE' };
    }
  };

  const getModeBadge = () => {
    switch (inferenceMode) {
      case 'LIVE_BACKEND':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', color: '#34d399', text: '● LIVE BACKEND (FASTAPI)' };
      case 'EDGE_INFERENCE':
        return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', color: '#fde047', text: '● EDGE INFERENCE (LOCAL JS)' };
      default:
        return { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', color: '#c084fc', text: '● SYNTHETIC DEMO' };
    }
  };

  const badge = getSimBadge();
  const modeBadge = getModeBadge();

  return (
    <header style={{
      height: '60px',
      background: 'rgba(9, 13, 22, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1e293b',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      zIndex: 90,
      userSelect: 'none'
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '16px',
          color: '#ffffff',
          boxShadow: '0 0 15px rgba(37, 99, 235, 0.4)'
        }}>
          AV
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '-0.01em', background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AV-03 — GNSS Map-Matching Intelligence
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            Real-Time Highway vs Service Road Intelligence • <span style={{ color: '#38bdf8' }}>Chennai NH-48 Corridor</span>
          </div>
        </div>
      </div>

      {/* Top Status Indicators & Presenter Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold' }}>
          <span style={{ padding: '4px 10px', borderRadius: '20px', background: modeBadge.bg, border: `1px solid ${modeBadge.border}`, color: modeBadge.color }}>
            {modeBadge.text}
          </span>

          <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid #a855f7', color: '#c084fc' }}>
            ● HMM READY
          </span>

          <span style={{ padding: '4px 10px', borderRadius: '20px', background: isOutage ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)', border: `1px solid ${isOutage ? '#ef4444' : '#10b981'}`, color: isOutage ? '#fca5a5' : '#34d399' }}>
            ● GPS {isOutage ? 'LOST (35s)' : 'ACTIVE'}
          </span>

          <span style={{ padding: '4px 10px', borderRadius: '20px', background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
            {badge.text}
          </span>
        </div>

        {/* Presenter / Hackathon Demo Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDemoMode}
          style={{
            background: demoMode ? 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' : '#1e293b',
            color: demoMode ? '#ffffff' : '#94a3b8',
            border: demoMode ? 'none' : '1px solid #334155',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: demoMode ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🏆</span>
          <span>{demoMode ? 'JUDGE DEMO MODE: ON' : 'JUDGE DEMO MODE'}</span>
        </button>
      </div>
    </header>
  );
}
