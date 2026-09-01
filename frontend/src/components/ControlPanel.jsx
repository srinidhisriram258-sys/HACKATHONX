import React from 'react';

export default function ControlPanel({
  simStatus,
  onStartSimulation,
  onStopSimulation,
  onResumeSimulation,
  onResetSimulation,
  onStep,
  currentIndex,
  totalPoints,
  onScrub,
  tier,
  onChangeTier,
  roadChoice,
  onChangeRoadChoice,
  onStartJudgeDemo,
  onInjectNoise,
  viewMode,
  onChangeViewMode,
  confidenceThreshold,
  onChangeConfidenceThreshold,
  currentClassification
}) {
  const confPct = Math.round((currentClassification?.confidence || 0.95) * 100);
  const roadStr = (currentClassification?.classified_road || 'highway').replace('_', ' ').toUpperCase();

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
          SIMULATION &amp; LIFECYCLE CONTROLS
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

      {/* Feature 1: Explicit Stop / Start / Resume Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {simStatus === 'RUNNING' ? (
          <button
            type="button"
            onClick={onStopSimulation}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ■ STOP SIMULATION
          </button>
        ) : simStatus === 'STOPPED' || simStatus === 'PAUSED' ? (
          <button
            type="button"
            onClick={onResumeSimulation}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            ▶ RESUME SIMULATION
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartSimulation}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: '900',
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
        )}

        <button
          type="button"
          onClick={onStartJudgeDemo}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '13px',
            fontWeight: '900',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          ⚡ START JUDGE DEMO (15 STEPS)
        </button>
      </div>

      {/* Stopped Lifecycle Status Banner */}
      {simStatus === 'STOPPED' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '12px'
        }}>
          <div>
            <strong style={{ color: '#fca5a5' }}>SIMULATION STOPPED</strong>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
              Step {currentIndex} / {Math.max(0, totalPoints - 1)} | Match: {roadStr} ({confPct}%)
            </div>
          </div>
          <button
            type="button"
            onClick={onResetSimulation}
            style={{
              background: '#090d16',
              color: '#fca5a5',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ↻ RESET
          </button>
        </div>
      )}

      {/* Feature 12: Scenario Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Demo Scenario
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
            <option value="clean">Clean GNSS</option>
            <option value="moderate">20m Noise</option>
            <option value="bias">15m Bias</option>
            <option value="missing_points">Missing Points</option>
            <option value="spoofing">GNSS Spoofing</option>
            <option value="hard">35s Outage</option>
            <option value="adversarial">🔥 Combined Adversarial</option>
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
            <option value="switch">Highway -&gt; Service Switch</option>
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

      {/* Live Noise Injection Controls */}
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

      {/* Scrub Bar & Step Controls */}
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
            onClick={onStep}
            style={{
              flex: 1,
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ⏭ Step Forward
          </button>

          <button
            type="button"
            onClick={onResetSimulation}
            style={{
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 16px',
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
