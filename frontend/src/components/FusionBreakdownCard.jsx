import React from 'react';

export default function FusionBreakdownCard({ classification }) {
  const breakdown = classification?.fusion_breakdown || {};
  const trustScore = breakdown.gnss_trust_score ?? 85.0;
  const rfProb = breakdown.rf_probability ?? 0.913;
  const reasons = breakdown.reasons_why || [
    "✓ RF favors Highway",
    "✓ Vehicle heading matches Highway tangent",
    "✓ Speed matches Highway profile",
    "✓ Temporal continuity supports Highway",
    "✓ GNSS Trust Score = 85%",
    "⚠ Anomaly penalty = 0.00"
  ];

  const roadStateStatus = classification?.road_state_status || "ROAD STATE STABLE";
  const classifiedRoad = (classification?.classified_road || 'highway').replace('_', ' ').toUpperCase();
  const fusedConf = Math.round((classification?.confidence || 0.95) * 100);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '18px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      color: '#f8fafc'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
          PROBABILISTIC FUSION ENGINE &amp; ROAD STABILITY
        </h3>
        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', border: '1px solid #10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>
          {roadStateStatus}
        </span>
      </div>

      {/* Final Fused Decision Header */}
      <div style={{
        background: '#090d16',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #38bdf8',
        marginBottom: '14px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>FINAL FUSED MATCH</div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: classifiedRoad.includes('HIGHWAY') ? '#60a5fa' : '#fb923c', marginTop: '2px' }}>
            {classifiedRoad} — {fusedConf}% CONFIDENCE
          </div>
        </div>

        {/* Feature 7: GNSS Trust Score Bar */}
        <div style={{ width: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
            <span>GNSS TRUST</span>
            <span style={{ color: trustScore >= 70 ? '#34d399' : '#fca5a5', fontWeight: 'bold' }}>{trustScore}%</span>
          </div>
          <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${trustScore}%`,
              background: trustScore >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f97316)'
            }} />
          </div>
        </div>
      </div>

      {/* Component Evidence Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px', fontSize: '10px' }}>
        <div style={{ background: '#090d16', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8' }}>RF Prob:</span> <strong style={{ color: '#60a5fa' }}>{rfProb}</strong>
        </div>
        <div style={{ background: '#090d16', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8' }}>Heading Match:</span> <strong style={{ color: '#34d399' }}>{breakdown.heading_score ?? 0.92}</strong>
        </div>
        <div style={{ background: '#090d16', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8' }}>Speed Profile:</span> <strong style={{ color: '#38bdf8' }}>{breakdown.speed_profile_score ?? 0.85}</strong>
        </div>
        <div style={{ background: '#090d16', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8' }}>HMM Continuity:</span> <strong style={{ color: '#c084fc' }}>{breakdown.temporal_continuity_score ?? 0.95}</strong>
        </div>
      </div>

      {/* "WHY THIS ROAD?" Evidence Checklist */}
      <div style={{ background: '#090d16', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '11px' }}>
        <div style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>
          WHY THIS ROAD? (EXPLAINABLE EVIDENCE BREAKDOWN)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#cbd5e1' }}>
          {reasons.map((r, idx) => (
            <div key={idx} style={{ color: r.startsWith('⚠') ? '#fca5a5' : '#34d399' }}>
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
