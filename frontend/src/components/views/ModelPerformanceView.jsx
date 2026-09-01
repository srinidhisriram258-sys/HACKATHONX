import React from 'react';

export default function ModelPerformanceView({ accuracySummary }) {
  const nrAcc = accuracySummary?.nearest_road_acc ?? 68.5;
  const rfAcc = accuracySummary?.random_forest_acc ?? 91.2;
  const hmmAcc = accuracySummary?.hmm_viterbi_acc ?? 95.4;
  const fusionAcc = accuracySummary?.fusion_engine_acc ?? 94.7;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#34d399', textTransform: 'uppercase' }}>
          MODEL PERFORMANCE &amp; ACCURACY ANALYTICS
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Synthetic Benchmark Dataset Performance Across Clean, Moderate, and 35s GNSS Outage Scenarios.
        </p>
      </div>

      {/* Model Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', color: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>1. NEAREST ROAD</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#94a3b8', margin: '4px 0' }}>{nrAcc}%</div>
          <div style={{ fontSize: '10px', color: '#ef4444' }}>Baseline (Fails on 15m Bias)</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', color: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>2. RANDOM FOREST</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#60a5fa', margin: '4px 0' }}>{rfAcc}%</div>
          <div style={{ fontSize: '10px', color: '#60a5fa' }}>Feature Prior Probability</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b', color: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>3. HMM / VITERBI</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#c084fc', margin: '4px 0' }}>{hmmAcc}%</div>
          <div style={{ fontSize: '10px', color: '#c084fc' }}>Temporal Path Smoothing</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '10px', border: '1px solid #10b981', color: '#f8fafc' }}>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>4. FUSION ENGINE</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#34d399', margin: '4px 0' }}>{fusionAcc}%</div>
          <div style={{ fontSize: '10px', color: '#34d399' }}>RF + HMM + EKF Integrated</div>
        </div>
      </div>

      {/* Accuracy by Scenario Tier */}
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase' }}>
          ACCURACY BY DIFFICULTY SCENARIO TIER
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '8px' }}>Scenario Tier</th>
              <th style={{ padding: '8px' }}>Nearest Road</th>
              <th style={{ padding: '8px' }}>Random Forest</th>
              <th style={{ padding: '8px' }}>HMM Viterbi</th>
              <th style={{ padding: '8px' }}>ROADTRACE Fusion</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>CLEAN (Jitter &lt; 2.5m)</td>
              <td style={{ padding: '8px' }}>98.0%</td>
              <td style={{ padding: '8px' }}>99.2%</td>
              <td style={{ padding: '8px' }}>100.0%</td>
              <td style={{ padding: '8px', color: '#34d399', fontWeight: 'bold' }}>100.0%</td>
            </tr>

            <tr style={{ borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>MODERATE (20m Noise + 15m Bias)</td>
              <td style={{ padding: '8px', color: '#ef4444' }}>68.5%</td>
              <td style={{ padding: '8px' }}>91.2%</td>
              <td style={{ padding: '8px' }}>95.4%</td>
              <td style={{ padding: '8px', color: '#34d399', fontWeight: 'bold' }}>94.7%</td>
            </tr>

            <tr style={{ color: '#cbd5e1' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>HARD (35s Outage + EKF)</td>
              <td style={{ padding: '8px', color: '#ef4444' }}>52.0%</td>
              <td style={{ padding: '8px' }}>84.0%</td>
              <td style={{ padding: '8px' }}>94.0%</td>
              <td style={{ padding: '8px', color: '#34d399', fontWeight: 'bold' }}>94.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
