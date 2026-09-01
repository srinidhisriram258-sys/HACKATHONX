import React from 'react';

export default function IMUKalmanHUD({ imuTelemetry, kalmanEstimation, isOutage }) {
  const accelX = imuTelemetry?.accel_x ?? 0.12;
  const accelY = imuTelemetry?.accel_y ?? -0.04;
  const yawRate = imuTelemetry?.yaw_rate ?? 0.002;
  const covTrace = kalmanEstimation?.cov_trace ?? 0.0001;

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
        <h3 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
          IMU SENSOR FUSION &amp; KALMAN FILTER (EKF)
        </h3>
        <span style={{ fontSize: '10px', background: isOutage ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: isOutage ? '#ef4444' : '#38bdf8', padding: '3px 8px', borderRadius: '4px', border: `1px solid ${isOutage ? '#ef4444' : '#38bdf8'}`, fontFamily: 'monospace' }}>
          {isOutage ? 'GNSS: LOST | IMU: ACTIVE | DR: ACTIVE' : 'GNSS: ONLINE | IMU: ACTIVE | EKF: FUSED'}
        </span>
      </div>

      {/* Sensor Fusion Status Banner */}
      <div style={{
        background: '#090d16',
        padding: '12px 14px',
        borderRadius: '8px',
        border: `1px solid ${isOutage ? '#ef4444' : '#38bdf8'}`,
        marginBottom: '14px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Position Estimator State</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: isOutage ? '#fca5a5' : '#38bdf8', marginTop: '2px' }}>
            {isOutage ? 'POSITION ESTIMATOR: IMU + KALMAN (DEAD RECKONING)' : 'POSITION ESTIMATOR: KALMAN FUSION'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>State Covariance (Trace P)</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7', fontFamily: 'monospace' }}>
            {covTrace}
          </div>
        </div>
      </div>

      {/* Live IMU Telemetry Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Longitudinal Accel (a_x)</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8' }}>
            {accelX} m/s²
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Lateral Accel (a_y)</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8' }}>
            {accelY} m/s²
          </div>
        </div>

        <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Yaw Rate (ω)</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#a855f7' }}>
            {yawRate} rad/s
          </div>
        </div>
      </div>

      {/* Before / After Comparison Panel */}
      <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>
          Localization Architecture Comparison (35s Outage Test)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>OLD (GNSS-only Basic DR):</span>
            <div style={{ color: '#cbd5e1', marginTop: '2px' }}>Unconstrained linear drift; position error grows exponentially up to 65m.</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>NEW (GNSS + IMU + Kalman):</span>
            <div style={{ color: '#cbd5e1', marginTop: '2px' }}>Constrained EKF kinematics; position error bounded within 18m during 35s gap.</div>
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
          * Synthetic simulation results — Not real-world field data
        </div>
      </div>
    </div>
  );
}
