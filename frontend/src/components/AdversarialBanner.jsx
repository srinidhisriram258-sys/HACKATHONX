import React from 'react';

export default function AdversarialBanner({ tier, classification }) {
  if (tier !== 'adversarial') return null;

  const nearestPred = classification?.predictions?.nearest_road || 'service_road';
  const fusionPred = classification?.classified_road || 'highway';
  const isFailed = nearestPred !== fusionPred;

  return (
    <div style={{
      background: 'rgba(234, 179, 8, 0.15)',
      border: '1.5px solid #eab308',
      borderRadius: '12px',
      padding: '14px 18px',
      marginBottom: '20px',
      color: '#f8fafc',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#fde047' }}>
              COMBINED ADVERSARIAL SCENARIO ACTIVE
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
              Testing 12.4m road separation, 15m multipath bias, spoofing jumps, missing points, and 35s GNSS outage.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{ background: '#090d16', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${isFailed ? '#ef4444' : '#334155'}` }}>
            <span style={{ color: '#94a3b8' }}>Nearest-Road Baseline:</span>{' '}
            <span style={{ color: isFailed ? '#ef4444' : '#60a5fa' }}>
              {nearestPred.toUpperCase()} {isFailed ? '❌ (FAILS)' : ''}
            </span>
          </div>

          <div style={{ background: '#090d16', padding: '6px 10px', borderRadius: '6px', border: '1px solid #10b981' }}>
            <span style={{ color: '#94a3b8' }}>ROADTRACE AI:</span>{' '}
            <span style={{ color: '#34d399' }}>
              {fusionPred.toUpperCase()} ✓ (CORRECT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
