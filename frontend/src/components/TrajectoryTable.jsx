import React from 'react';

export default function TrajectoryTable({ classifications, currentIndex, onSelectStep }) {
  if (!classifications || classifications.length === 0) return null;

  // Render a slice of 10 rows centered around current index for optimal performance
  const start = Math.max(0, currentIndex - 4);
  const end = Math.min(classifications.length, currentIndex + 6);
  const visibleRows = classifications.slice(start, end);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      color: '#f8fafc',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
          SEGMENT-BY-SEGMENT TRAJECTORY LOG TABLE
        </h3>
        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
          Step {currentIndex} of {classifications.length - 1} Selected
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#090d16', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 8px' }}>SEGMENT</th>
              <th style={{ padding: '6px 8px' }}>GROUND TRUTH</th>
              <th style={{ padding: '6px 8px' }}>RF P(HW)</th>
              <th style={{ padding: '6px 8px' }}>HMM</th>
              <th style={{ padding: '6px 8px' }}>FUSION MATCH</th>
              <th style={{ padding: '6px 8px' }}>CONFIDENCE</th>
              <th style={{ padding: '6px 8px' }}>GNSS TRUST</th>
              <th style={{ padding: '6px 8px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const isCurrent = row.step === currentIndex;
              const confPct = Math.round((row.confidence || 0.95) * 100);
              const trustScore = row.fusion_breakdown?.gnss_trust_score ?? (row.is_outage ? 0 : 85);
              const rfPhw = row.predictions?.p_highway ?? 0.91;
              const hmmPred = row.predictions?.hmm_viterbi || row.classified_road;
              const isAnom = row.anomaly_detection?.is_anomalous;

              return (
                <tr
                  key={row.step}
                  onClick={() => onSelectStep(row.step)}
                  style={{
                    background: isCurrent ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                    borderBottom: '1px solid #1e293b',
                    cursor: 'pointer',
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isCurrent ? '#ffffff' : '#cbd5e1'
                  }}
                >
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>
                    {String(row.step).padStart(3, '0')} {isCurrent ? '◄' : ''}
                  </td>
                  <td style={{ padding: '6px 8px', color: row.true_road === 'highway' ? '#60a5fa' : '#fb923c' }}>
                    {row.true_road.toUpperCase()}
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>
                    {rfPhw}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#c084fc' }}>
                    {hmmPred === 'highway' ? 'H' : 'S'}
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', color: row.classified_road === 'highway' ? '#60a5fa' : '#fb923c' }}>
                    {row.classified_road === 'highway' ? 'HIGHWAY' : 'SERVICE'}
                  </td>
                  <td style={{ padding: '6px 8px', color: confPct >= 70 ? '#34d399' : '#fca5a5' }}>
                    {confPct}%
                  </td>
                  <td style={{ padding: '6px 8px', color: trustScore >= 70 ? '#34d399' : '#ef4444' }}>
                    {trustScore}%
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {row.is_outage ? (
                      <span style={{ color: '#ef4444' }}>🛑 OUTAGE</span>
                    ) : isAnom ? (
                      <span style={{ color: '#ef4444' }}>⚠ SPOOF</span>
                    ) : (
                      <span style={{ color: '#10b981' }}>✓ GOOD</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
