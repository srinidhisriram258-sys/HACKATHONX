import React from 'react';

export default function AnomalyBanner({ anomalyDetection, currentPoint }) {
  if (!anomalyDetection) return null;

  const isAnomalous = anomalyDetection.is_anomalous;
  const classification = anomalyDetection.classification || 'NORMAL';
  const score = anomalyDetection.anomaly_score || 0.0;
  const reason = anomalyDetection.reason || 'Clean GNSS fix';

  return (
    <div style={{
      background: isAnomalous ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '14px 18px',
      borderRadius: '12px',
      border: `1.5px solid ${isAnomalous ? '#ef4444' : '#1e293b'}`,
      color: '#f8fafc',
      boxShadow: isAnomalous ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>
            {isAnomalous ? '⚠️' : (classification === 'BIAS' ? '⚡' : '✅')}
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: isAnomalous ? '#fca5a5' : (classification === 'BIAS' ? '#fb923c' : '#34d399') }}>
              {isAnomalous ? '⚠ GNSS ANOMALY / SPOOFING DETECTED' : `GNSS SIGNAL STATUS: ${classification}`}
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
              Reason: {reason}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Anomaly Score</div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: isAnomalous ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>
            {score.toFixed(2)} / 1.00
          </div>
        </div>
      </div>

      {isAnomalous && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '11px' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Implied Speed:</span>{' '}
            <strong style={{ color: '#ef4444' }}>{anomalyDetection.implied_speed_kmh} km/h</strong>
          </div>

          <div>
            <span style={{ color: '#94a3b8' }}>Jump Distance:</span>{' '}
            <strong style={{ color: '#ef4444' }}>{anomalyDetection.jump_distance_m} m</strong>
          </div>

          <div>
            <span style={{ color: '#94a3b8' }}>Implied Accel:</span>{' '}
            <strong style={{ color: '#ef4444' }}>{anomalyDetection.implied_accel_ms2} m/s²</strong>
          </div>
        </div>
      )}
    </div>
  );
}
