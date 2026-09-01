import React, { useState } from 'react';
import LeafletMapView from '../LeafletMapView';

export default function TrajectoryAnalysisView({
  highwayCoords,
  serviceCoords,
  points,
  classifications,
  tier,
  roadChoice
}) {
  const [selectedStep, setSelectedStep] = useState(0);

  if (!points || points.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <h3>NO TRAJECTORY LOADED</h3>
        <p>Generate a trajectory to begin spatial analysis.</p>
      </div>
    );
  }

  const selectedPt = points[selectedStep] || points[0];
  const selectedCls = classifications[selectedStep] || classifications[0];

  const totalFixes = points.length;
  const missingFixes = points.filter(p => p.is_outage).length;
  const avgSpeed = Math.round(points.reduce((acc, p) => acc + (p.speed || 0), 0) / totalFixes);
  const maxSpeed = Math.round(Math.max(...points.map(p => p.speed || 0)));
  const anomaliesCount = classifications.filter(c => c.anomaly_detection?.is_anomalous).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overview Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>TRAJECTORY ID</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace' }}>TRJ-CH-8080</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>SCENARIO TIER</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#a855f7' }}>{tier.toUpperCase()}</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>TOTAL FIXES</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc', fontFamily: 'monospace' }}>{totalFixes} pts</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>OUTAGE FIXES</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: missingFixes > 0 ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>{missingFixes} pts</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>AVG / MAX SPEED</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#34d399', fontFamily: 'monospace' }}>{avgSpeed} / {maxSpeed} km/h</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>ANOMALIES</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: anomaliesCount > 0 ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>{anomaliesCount} detected</div>
        </div>
      </div>

      {/* Map & Point Inspector Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Trajectory Map */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>
            TRAJECTORY SPATIAL PATHWAY
          </div>
          <div style={{ height: '420px', width: '100%' }}>
            <LeafletMapView
              highwayCoords={highwayCoords}
              serviceCoords={serviceCoords}
              points={points}
              currentIndex={selectedStep}
              classifications={classifications}
            />
          </div>
        </div>

        {/* Selected Point Inspector */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase' }}>
              POINT INSPECTOR (STEP #{selectedStep})
            </h3>
            <span style={{ fontSize: '11px', background: '#090d16', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155', fontFamily: 'monospace' }}>
              t = {selectedPt.timestamp} s
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>LATITUDE</span>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', marginTop: '2px' }}>
                {(selectedPt.noisy_lat || selectedPt.dr_lat || selectedPt.true_lat).toFixed(6)}
              </div>
            </div>

            <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>LONGITUDE</span>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', marginTop: '2px' }}>
                {(selectedPt.noisy_lon || selectedPt.dr_lon || selectedPt.true_lon).toFixed(6)}
              </div>
            </div>

            <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>SPEED</span>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>{selectedPt.speed} km/h</div>
            </div>

            <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>HEADING</span>
              <div style={{ fontWeight: 'bold', color: '#a855f7', marginTop: '2px' }}>{selectedPt.heading}°</div>
            </div>

            <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>HIGHWAY DIST</span>
              <div style={{ fontWeight: 'bold', color: '#60a5fa', marginTop: '2px' }}>{selectedCls.features?.d_highway_m || 2.5} m</div>
            </div>

            <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>SERVICE DIST</span>
              <div style={{ fontWeight: 'bold', color: '#fb923c', marginTop: '2px' }}>{selectedCls.features?.d_service_m || 12.4} m</div>
            </div>
          </div>

          {/* Classification & Confidence Box */}
          <div style={{ background: '#090d16', padding: '12px', borderRadius: '8px', border: '1px solid #38bdf8', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>MATCHED CLASSIFICATION</div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: selectedCls.classified_road === 'highway' ? '#60a5fa' : '#fb923c', marginTop: '2px' }}>
              {selectedCls.classified_road.toUpperCase()} — {Math.round((selectedCls.confidence || 0.95) * 100)}% CONFIDENCE
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
              Mode: {selectedCls.mode}
            </div>
          </div>

          {/* Point Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Scrub Fix Index</span>
              <span style={{ fontFamily: 'monospace' }}>{selectedStep} / {points.length - 1}</span>
            </div>
            <input
              type="range"
              min={0}
              max={points.length - 1}
              value={selectedStep}
              onChange={(e) => setSelectedStep(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
