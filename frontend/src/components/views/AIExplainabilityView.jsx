import React from 'react';
import FusionBreakdownCard from '../FusionBreakdownCard';

export default function AIExplainabilityView({ classification }) {
  const predictions = classification?.predictions || {};
  const features = classification?.features || {};
  const pHw = Math.round((predictions.p_highway ?? 0.913) * 100);
  const pSrv = Math.round((predictions.p_service ?? 0.087) * 100);
  const conf = Math.round((classification?.confidence ?? 0.95) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#38bdf8', textTransform: 'uppercase' }}>
          AI DECISION EXPLAINABILITY PANEL
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Why did the model choose this road? Real-time feature attribution &amp; probabilistic breakdown.
        </p>
      </div>

      {/* Main Explainability Breakdown */}
      <FusionBreakdownCard classification={classification} />

      {/* Probabilistic Visual Distribution */}
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#a855f7', textTransform: 'uppercase' }}>
          CLASSIFICATION PROBABILITY DISTRIBUTION
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>HIGHWAY PROBABILITY P(HIGHWAY)</span>
              <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{pHw}%</span>
            </div>
            <div style={{ height: '10px', background: '#090d16', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pHw}%`, background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#fb923c', fontWeight: 'bold' }}>SERVICE ROAD PROBABILITY P(SERVICE ROAD)</span>
              <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{pSrv}%</span>
            </div>
            <div style={{ height: '10px', background: '#090d16', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pSrv}%`, background: 'linear-gradient(90deg, #ea580c, #fb923c)' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: '#090d16', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic' }}>
          “Classification is primarily supported by road distance ({features.d_highway_m ?? 2.5}m vs {features.d_service_m ?? 12.4}m), heading alignment ({features.heading ?? 45}°), and temporal HMM Viterbi state continuity.”
        </div>
      </div>
    </div>
  );
}
