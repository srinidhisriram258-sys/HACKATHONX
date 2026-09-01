import React from 'react';

export default function SystemHealthPanel({
  inferenceMode,
  isSimulatedFailure,
  onSimulateBackendFailure,
  onRestoreBackend,
  isOutage
}) {
  const items = [
    { label: 'INFERENCE MODE', status: inferenceMode.replace('_', ' '), color: inferenceMode === 'LIVE_BACKEND' ? '#10b981' : (inferenceMode === 'EDGE_INFERENCE' ? '#fde047' : '#c084fc') },
    { label: 'BACKEND CONNECTION', status: isSimulatedFailure ? 'SIMULATED DISCONNECT' : (inferenceMode === 'LIVE_BACKEND' ? 'ONLINE (127.0.0.1:8080)' : 'OFFLINE'), color: inferenceMode === 'LIVE_BACKEND' ? '#10b981' : '#ef4444' },
    { label: 'HMM VITERBI ENGINE', status: 'ONLINE', color: '#a855f7' },
    { label: 'IMU SENSOR FUSION', status: 'ONLINE', color: '#10b981' },
    { label: 'KALMAN EKF FILTER', status: 'ONLINE', color: '#38bdf8' },
    { label: 'GNSS SENSOR', status: isOutage ? 'LOST (35s)' : 'ACTIVE', color: isOutage ? '#ef4444' : '#10b981' },
    { label: 'LEAFLET 2D MAP', status: 'ONLINE', color: '#10b981' },
    { label: 'THREE.JS 3D CANVAS', status: 'ONLINE', color: '#a855f7' }
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
          SYSTEM HEALTH &amp; INFERENCE FAILSAFE CONTROLS
        </h3>

        {/* Failsafe Simulation Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isSimulatedFailure ? (
            <button
              type="button"
              onClick={onSimulateBackendFailure}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ⚡ SIMULATE BACKEND FAILURE
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestoreBackend}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid #10b981',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✓ RESTORE BACKEND CONNECTION
            </button>
          )}
        </div>
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
