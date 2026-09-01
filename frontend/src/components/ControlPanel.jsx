import React from 'react';

export default function ControlPanel({
  isPlaying,
  onTogglePlay,
  onStep,
  onReset,
  currentIndex,
  totalPoints,
  onScrub,
  tier,
  onChangeTier,
  roadChoice,
  onChangeRoadChoice,
  onStartSimulation,
  onStartJudgeDemo,
  onInjectNoise,
  viewMode,
  onChangeViewMode,
  confidenceThreshold,
  onChangeConfidenceThreshold
}) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      color: '#f8fafc'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: '700' }}>
          SIMULATION &amp; DEMO CONTROLS
        </h3>

        {/* 2D MAP / 3D VIEW / SPLIT VIEW Toggle */}
        <div style={{ display: 'flex', background: '#090d16', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
          <button
            type="button"
            onClick={() => onChangeViewMode('2d')}
            style={{
              background: viewMode === '2d' ? '#2563eb' : 'transparent',
              color: viewMode === '2d' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🗺️ 2D MAP
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('3d')}
            style={{
              background: viewMode === '3d' ? '#a855f7' : 'transparent',
              color: viewMode === '3d' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚘 3D VIEW
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('split')}
            style={{
              background: viewMode === 'split' ? '#10b981' : 'transparent',
              color: viewMode === 'split' ? '#ffffff' : '#94a3b8',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔀 SPLIT
          </button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onStartSimulation();
          }}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          ▶ START LIVE SIMULATION
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onStartJudgeDemo();
          }}
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          ⚡ START JUDGE DEMO (15 STEPS)
        </button>
      </div>

      {/* Configuration Selectors & Safety Threshold Slider */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            GNSS Noise Scenario
          </label>
          <select
            value={tier}
            onChange={(e) => onChangeTier(e.target.value)}
            style={{
              width: '100%',
              background: '#090d16',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '11px'
            }}
          >
            <option value="clean">Clean GPS (Jitter only)</option>
            <option value="moderate">20m Noise + 15m Bias</option>
            <option value="hard">Hard (35s GNSS Outage + EKF)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Ground Truth Route
          </label>
          <select
            value={roadChoice}
            onChange={(e) => onChangeRoadChoice(e.target.value)}
            style={{
              width: '100%',
              background: '#090d16',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '11px'
            }}
          >
            <option value="switch">Highway -&gt; Ramp -&gt; Service Switch</option>
            <option value="highway">Highway Only (NH-48)</option>
            <option value="service">Service Road Only</option>
          </select>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
            <span>Safety Threshold</span>
            <span style={{ color: '#fb923c', fontWeight: 'bold' }}>{confidenceThreshold}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={90}
            step={5}
            value={confidenceThreshold}
            onChange={(e) => onChangeConfidenceThreshold(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: '#fb923c', cursor: 'pointer', marginTop: '6px' }}
          />
        </div>
      </div>

      {/* Live Noise & Anomaly Injection Controls */}
      <div style={{
        background: '#090d16',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px dashed #ef4444',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>LIVE NOISE &amp; ANOMALY INJECTION (JUDGE CONTROLS)</span>
          <span style={{ color: '#ef4444' }}>● READY</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onInjectNoise('multipath')}
            style={{
              background: '#1e293b',
              color: '#fb923c',
              border: '1px solid #f97316',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⚠️ 15m Multipath Bias
          </button>

          <button
            type="button"
            onClick={() => onInjectNoise('outage')}
            style={{
              background: '#1e293b',
              color: '#fca5a5',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🛑 35s GNSS Outage
          </button>

          <button
            type="button"
            onClick={() => onInjectNoise('spoofing')}
            style={{
              background: '#1e293b',
              color: '#c084fc',
              border: '1px solid #a855f7',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚨 GNSS Spoof Jump
          </button>
        </div>
      </div>

      {/* Scrub Bar & Timeline Controls */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Timeline Progress</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}>{currentIndex} / {Math.max(0, totalPoints - 1)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalPoints - 1)}
          value={currentIndex}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer', marginBottom: '10px' }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onTogglePlay}
            style={{
              flex: 1,
              background: isPlaying ? '#eab308' : '#10b981',
              color: '#090d16',
              border: 'none',
              borderRadius: '6px',
              padding: '8px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            type="button"
            onClick={onStep}
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⏭ Step
          </button>

          <button
            type="button"
            onClick={onReset}
            style={{
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}
