import React from 'react';

export default function Sidebar({ activeTab, onChangeTab, isCollapsed, onToggleCollapse }) {
  const navItems = [
    { id: 'live_simulation', num: '01', label: 'Live Simulation', icon: '📡' },
    { id: 'trajectory_analysis', num: '02', label: 'Trajectory Analysis', icon: '📈' },
    { id: 'gnss_anomalies', num: '03', label: 'GNSS Anomalies', icon: '⚠️' },
    { id: 'ai_explainability', num: '04', label: 'AI Explainability', icon: '🧠' },
    { id: 'model_performance', num: '05', label: 'Model Performance', icon: '📊' },
    { id: 'evaluation', num: '06', label: 'Evaluation', icon: '🎯' },
    { id: 'system_logs', num: '07', label: 'System Logs', icon: '💻' }
  ];

  return (
    <aside style={{
      width: isCollapsed ? '64px' : '220px',
      background: 'rgba(9, 13, 22, 0.95)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      zIndex: 100,
      userSelect: 'none'
    }}>
      {/* Collapse Toggle Button */}
      <div style={{
        padding: '16px 12px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justify: isCollapsed ? 'center' : 'space-between',
        alignItems: 'center'
      }}>
        {!isCollapsed && (
          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase' }}>
            NAVIGATION
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '4px'
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '➔' : '◀'}
        </button>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? '800' : '500',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              {!isCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: isActive ? '#38bdf8' : '#475569', fontFamily: 'monospace' }}>{item.num}</span>
                  <span>{item.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Identity */}
      {!isCollapsed && (
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b', fontSize: '10px', color: '#475569' }}>
          <div>AV-03 INTELLIGENCE</div>
          <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>v2.4 Production</div>
        </div>
      )}
    </aside>
  );
}
