import React from 'react';

export default function EvaluationPanel() {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      color: '#f8fafc',
      marginTop: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>
            BENCHMARK EVALUATION &amp; MODEL EXPLAINABILITY
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            Synthetic benchmark / demo evaluation on held-out Chennai corridor trajectories
          </p>
        </div>
        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '4px', border: '1px solid #10b981', fontFamily: 'monospace' }}>
          Latency: 1.42 ms / fix
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Model Accuracy Comparison Table */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Model Performance (Synthetic Benchmark)
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '8px 4px' }}>Model</th>
                <th style={{ padding: '8px 4px' }}>Accuracy</th>
                <th style={{ padding: '8px 4px' }}>Precision</th>
                <th style={{ padding: '8px 4px' }}>Recall</th>
                <th style={{ padding: '8px 4px' }}>F1 Score</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                <td style={{ padding: '8px 4px' }}>Nearest Road (Baseline)</td>
                <td style={{ padding: '8px 4px' }}>68.5%</td>
                <td style={{ padding: '8px 4px' }}>72.0%</td>
                <td style={{ padding: '8px 4px' }}>65.0%</td>
                <td style={{ padding: '8px 4px' }}>68.3%</td>
              </tr>
              <tr style={{ color: '#34d399', fontWeight: 'bold' }}>
                <td style={{ padding: '8px 4px' }}>ROADTRACE AI (HMM+RF)</td>
                <td style={{ padding: '8px 4px' }}>94.7%</td>
                <td style={{ padding: '8px 4px' }}>96.1%</td>
                <td style={{ padding: '8px 4px' }}>93.8%</td>
                <td style={{ padding: '8px 4px' }}>94.9%</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            💡 <strong style={{ color: '#f8fafc' }}>Key Finding:</strong> Baseline Nearest Road misclassifies parallel service roads during 15m GNSS multipath bias. ROADTRACE AI preserves 94.7% accuracy through Viterbi temporal smoothing and Dead Reckoning.
          </div>
        </div>

        {/* Explainability & Feature Importance */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explainability &amp; Feature Importance
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span>Distance Differential (Δd = d_service - d_highway)</span>
                <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>48% Importance</span>
              </div>
              <div style={{ height: '6px', background: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '48%', background: '#38bdf8' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span>Heading Alignment Angle Difference</span>
                <span style={{ fontWeight: 'bold', color: '#a855f7' }}>28% Importance</span>
              </div>
              <div style={{ height: '6px', background: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '28%', background: '#a855f7' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span>Instantaneous Speed &amp; Trailing Variance</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>16% Importance</span>
              </div>
              <div style={{ height: '6px', background: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '16%', background: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span>HMM Transition State Memory</span>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>8% Importance</span>
              </div>
              <div style={{ height: '6px', background: '#090d16', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '8%', background: '#f59e0b' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
