import React from 'react';
import AnomalyBanner from '../AnomalyBanner';

export default function GNSSAnomalyControlView({
  onInjectNoise,
  classification,
  currentPoint,
  isSimulatedFailure,
  onSimulateBackendFailure,
  onRestoreBackend,
  inferenceMode
}) {
  const anomalyInfo = classification?.anomaly_detection;
  const isOutage = classification?.is_outage;
  const isAnomalous = anomalyInfo?.is_anomalous;
  const classificationType = anomalyInfo?.classification || (isOutage ? 'GNSS OUTAGE' : 'NORMAL');
  const score = anomalyInfo?.anomaly_score || 0.0;
  const confPct = Math.round((classification?.confidence || 0.95) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#ef4444', textTransform: 'uppercase' }}>
          GNSS ANOMALY CONTROL CENTER &amp; EDGE FAILSAFE STRESS TEST
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Real-time physical kinematic anomaly detection, multipath bias injection, 45s GNSS outage, and backend failure failsafe testing.
        </p>
      </div>

      {/* Anomaly Live Banner */}
      <AnomalyBanner anomalyDetection={anomalyInfo} currentPoint={currentPoint} />

      {/* Main Control & Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Action Trigger Panel */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase' }}>
            ANOMALY &amp; BACKEND FAILSAFE CONTROLS
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              onClick={() => onInjectNoise('multipath')}
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
              }}
            >
              ⚠️ + INJECT MULTIPATH BIAS (15m Offset)
              <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9, marginTop: '2px' }}>
                Simulates urban canyon satellite reflection towards Service Road.
              </div>
            </button>

            <button
              type="button"
              onClick={() => onInjectNoise('outage')}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              🛑 + KILL GPS — 45 SEC (Tunnel Outage)
              <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9, marginTop: '2px' }}>
                Complete GNSS signal loss; triggers IMU + EKF Dead Reckoning propagation.
              </div>
            </button>

            <button
              type="button"
              onClick={() => onInjectNoise('spoofing')}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}
            >
              🚨 + INJECT GNSS SPOOFING (50m Jump)
              <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9, marginTop: '2px' }}>
                Simulates physically impossible kinematic velocity &amp; acceleration spike.
              </div>
            </button>

            {/* Feature 9: Backend Failure Simulation Controls */}
            {!isSimulatedFailure ? (
              <button
                type="button"
                onClick={onSimulateBackendFailure}
                style={{
                  background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 4px 12px rgba(185, 28, 28, 0.4)'
                }}
              >
                ⚡ [ SIMULATE BACKEND FAILURE ]
                <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9, marginTop: '2px' }}>
                  Simulates API disconnection &amp; seamlessly activates Local Edge Inference mode.
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onRestoreBackend}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
                }}
              >
                ✓ [ RESTORE BACKEND CONNECTION ]
                <div style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.9, marginTop: '2px' }}>
                  Restores FastAPI backend HTTP connection &amp; live server inference.
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Anomaly Status Display */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase' }}>
            CURRENT FAILSAFE TELEMETRY
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>INFERENCE MODE</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: inferenceMode === 'LIVE_BACKEND' ? '#10b981' : (inferenceMode === 'EDGE_INFERENCE' ? '#fde047' : '#c084fc'), marginTop: '2px' }}>
                {inferenceMode.replace('_', ' ')}
              </div>
            </div>

            <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>SIGNAL STATUS</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: isOutage ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                {isOutage ? 'GPS LOST (35s)' : 'GPS ACTIVE'}
              </div>
            </div>

            <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>ANOMALY SCORE</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: isAnomalous ? '#ef4444' : '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                {score.toFixed(2)} / 1.00
              </div>
            </div>

            <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>POSTERIOR CONFIDENCE</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: confPct >= 70 ? '#34d399' : '#fca5a5', marginTop: '2px' }}>
                {confPct}%
              </div>
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '11px', color: '#cbd5e1' }}>
            <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>Detection Reason: </span>
            {anomalyInfo?.reason || 'Clean GNSS fix — Kinematic bounds respected.'}
          </div>
        </div>
      </div>
    </div>
  );
}
