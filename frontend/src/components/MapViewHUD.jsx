import React from 'react';

export default function MapViewHUD({
  currentPoint,
  classification,
  simSpeed,
  onChangeSimSpeed
}) {
  const isOutage = classification?.is_outage;
  const roadStr = (classification?.classified_road || 'highway').replace('_', ' ').toUpperCase();
  const confPct = Math.round((classification?.confidence || 0.95) * 100);
  const trustScore = classification?.fusion_breakdown?.gnss_trust_score ?? (isOutage ? 0 : 92);

  const lat = currentPoint?.noisy_lat ?? currentPoint?.dr_lat ?? currentPoint?.true_lat ?? 13.0827;
  const lon = currentPoint?.noisy_lon ?? currentPoint?.dr_lon ?? currentPoint?.true_lon ?? 80.2707;
  const speed = Math.round(classification?.features?.speed || currentPoint?.speed || 60);
  const heading = Math.round(currentPoint?.heading || 45);

  return (
    <>
      {/* Top-Left Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        padding: '6px 12px',
        borderRadius: '8px',
        zIndex: 500,
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>LIVE GNSS TRACKING</span>
        <span style={{ color: isOutage ? '#ef4444' : '#10b981', fontWeight: '800' }}>
          ● {isOutage ? 'OUTAGE' : 'LIVE'}
        </span>
      </div>

      {/* Top-Right Overlay: Primary Classification Pill */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        border: `1.5px solid ${roadStr.includes('HIGHWAY') ? '#2563eb' : '#f97316'}`,
        padding: '8px 14px',
        borderRadius: '8px',
        zIndex: 500,
        color: '#f8fafc',
        textAlign: 'right',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>CLASSIFICATION</div>
        <div style={{ fontSize: '14px', fontWeight: '900', color: roadStr.includes('HIGHWAY') ? '#60a5fa' : '#fb923c' }}>
          {roadStr}
        </div>
        <div style={{ fontSize: '11px', color: confPct >= 70 ? '#34d399' : '#fca5a5', marginTop: '2px' }}>
          Confidence: {confPct}%
        </div>
      </div>

      {/* Bottom-Left Overlay: Telemetry Stats */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        padding: '8px 12px',
        borderRadius: '8px',
        zIndex: 500,
        fontSize: '11px',
        color: '#f8fafc',
        display: 'flex',
        gap: '12px',
        fontFamily: 'monospace'
      }}>
        <div><span style={{ color: '#94a3b8' }}>LAT</span> <strong>{lat.toFixed(4)}</strong></div>
        <div><span style={{ color: '#94a3b8' }}>LON</span> <strong>{lon.toFixed(4)}</strong></div>
        <div><span style={{ color: '#94a3b8' }}>SPEED</span> <strong style={{ color: '#38bdf8' }}>{speed} km/h</strong></div>
        <div><span style={{ color: '#94a3b8' }}>HEADING</span> <strong style={{ color: '#a855f7' }}>{heading}°</strong></div>
      </div>

      {/* Bottom-Right Overlay: Signal Trust Bar & Speed Multiplier */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        padding: '8px 12px',
        borderRadius: '8px',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '11px'
      }}>
        <div>
          <span style={{ color: '#94a3b8', fontSize: '10px' }}>GPS SIGNAL:</span>{' '}
          <strong style={{ color: isOutage ? '#ef4444' : (trustScore >= 70 ? '#34d399' : '#fb923c'), fontFamily: 'monospace' }}>
            {isOutage ? 'SIGNAL LOST (35s)' : `█████████░ ${trustScore}%`}
          </strong>
        </div>

        {/* Speed Multiplier Controls */}
        <div style={{ display: 'flex', gap: '3px', background: '#0f172a', padding: '2px', borderRadius: '4px', border: '1px solid #334155' }}>
          {[0.5, 1, 2, 4].map(spd => (
            <button
              key={spd}
              type="button"
              onClick={() => onChangeSimSpeed(spd)}
              style={{
                background: simSpeed === spd ? '#2563eb' : 'transparent',
                color: simSpeed === spd ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
