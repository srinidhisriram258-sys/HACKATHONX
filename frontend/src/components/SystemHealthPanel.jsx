import React from 'react';

export default function SystemHealthPanel({ backendConnected, isOutage }) {
  const items = [
    { label: 'ML MODEL', status: 'ONLINE', color: '#10b981' },
    { label: 'HMM ENGINE', status: 'ONLINE', color: '#a855f7' },
    { label: 'IMU SENSOR', status: 'ONLINE', color: '#10b981' },
    { label: 'KALMAN FILTER', status: 'ONLINE', color: '#38bdf8' },
    { label: 'GNSS SENSOR', status: isOutage ? 'LOST (35s)' : 'ONLINE', color: isOutage ? '#ef4444' : '#10b981' },
    { label: 'FUSION ENGINE', status: 'ONLINE', color: '#38bdf8' },
    { label: 'LEAFLET 2D MAP', status: 'ONLINE', color: '#10b981' },
    { label: 'THREE.JS 3D VIEW', status: 'ONLINE', color: '#a855f7' }
  ];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      color: '#f8fafc'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
          SYSTEM HEALTH &amp; RUNTIME MODE
        </h3>
        <span style={{ fontSize: '10px', color: backendConnected ? '#34d399' : '#c084fc', fontWeight: 'bold' }}>
          {backendConnected ? 'FASTAPI BACKEND CONNECTED' : 'LOCAL SYNTHETIC DEMO ACTIVE'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            background: '#090d16',
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid #1e293b',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '10px'
          }}>
            <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: '800' }}>● {item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
