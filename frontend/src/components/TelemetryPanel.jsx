import React from 'react';

export default function TelemetryPanel({ currentClassification, currentPoint }) {
  const features = currentClassification?.features || {};
  const isOutage = currentClassification?.is_outage || currentPoint?.is_outage;
  const classifiedRoad = currentClassification?.classified_road;
  const confidence = currentClassification?.confidence ?? 0;
  const confidencePct = Math.round(confidence * 100);

  const pHwy = features.p_highway ?? (classifiedRoad === 'highway' ? 0.94 : 0.06);
  const pSrv = features.p_service ?? (classifiedRoad === 'service_road' ? 0.94 : 0.06);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      color: '#f8fafc'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
          LIVE ML CLASSIFICATION &amp; TELEMETRY
        </h3>
        <span style={{ fontSize: '11px', background: '#090d16', padding: '3px 10px', borderRadius: '4px', border: '1px solid #334155', fontFamily: 'monospace' }}>
          Step {currentPoint?.step ?? 0} / 100
        </span>
      </div>

      {/* Main Mode & Classification Banner */}
      <div style={{
        background: isOutage ? 'rgba(239, 68, 68, 0.12)' : (classifiedRoad === 'highway' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(249, 115, 22, 0.12)'),
        border: `1px solid ${isOutage ? '#ef4444' : (classifiedRoad === 'highway' ? '#2563eb' : '#f97316')}`,
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            {currentClassification?.mode || (isOutage ? 'DEAD RECKONING' : 'HMM + RF MATCHED')}
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '800',
            marginTop: '2px',
            color: isOutage ? '#fca5a5' : (classifiedRoad === 'highway' ? '#60a5fa' : '#fb923c')
          }}>
            {isOutage ? '35s GNSS OUTAGE (DEAD RECKONING)' : (classifiedRoad === 'highway' ? 'NH-48 HIGHWAY (MOTORWAY)' : 'PARALLEL SERVICE ROAD')}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Posterior Conf</div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: isOutage ? '#ef4444' : '#10b981' }}>
            {confidencePct}%
          </div>
        </div>
      </div>

      {/* Progressive Confidence Decay Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#94a3b8' }}>
          <span>Confidence Score {isOutage ? '(Progressive Decay)' : '(HMM Viterbi)'}</span>
          <span>{confidencePct}%</span>
        </div>
        <div style={{ height: '8px', background: '#090d16', borderRadius: '4px', overflow: 'hidden', border: '1px solid #334155' }}>
          <div style={{
            height: '100%',
            width: `${confidencePct}%`,
            background: isOutage ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : (classifiedRoad === 'highway' ? 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' : 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)'),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* ML Probabilities P(HIGHWAY) vs P(SERVICE ROAD) */}
      <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px' }}>
          Random Forest / HMM State Probabilities
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#60a5fa', marginBottom: '2px' }}>
              <span>P(HIGHWAY)</span>
              <span>{Math.round(pHwy * 100)}%</span>
            </div>
            <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(pHwy * 100)}%`, background: '#2563eb' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#fb923c', marginBottom: '2px' }}>
              <span>P(SERVICE ROAD)</span>
              <span>{Math.round(pSrv * 100)}%</span>
            </div>
            <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(pSrv * 100)}%`, background: '#f97316' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Speed</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399' }}>
            {currentPoint?.speed || 60} km/h
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Heading (θ)</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>
            {currentPoint?.heading || 45}°
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>GNSS Error</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: isOutage ? '#ef4444' : '#fb923c' }}>
            {isOutage ? 'LOST' : `${currentPoint?.gnss_error_m || 0} m`}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Dist Highway (d_hw)</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#60a5fa' }}>
            {isOutage ? 'DR' : `${features.d_highway_m ?? 0} m`}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Dist Service (d_srv)</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fb923c' }}>
            {isOutage ? 'DR' : `${features.d_service_m ?? 0} m`}
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Delta Dist (Δd)</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7' }}>
            {isOutage ? 'DR' : `${features.dist_diff_m ?? 0} m`}
          </div>
        </div>
      </div>
    </div>
  );
}
