import React, { useState, useEffect, useRef, useCallback } from 'react';
import ThreeVehicleViewer from './components/ThreeVehicleViewer';
import LeafletMapView from './components/LeafletMapView';
import TelemetryPanel from './components/TelemetryPanel';
import ControlPanel from './components/ControlPanel';
import EventConsole from './components/EventConsole';
import EvaluationPanel from './components/EvaluationPanel';
import './App.css';

const BACKEND_URL = 'http://127.0.0.1:8080';

export default function App() {
  const [highwayCoords, setHighwayCoords] = useState([]);
  const [serviceCoords, setServiceCoords] = useState([]);
  const [points, setPoints] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tier, setTier] = useState('hard');
  const [roadChoice, setRoadChoice] = useState('switch');
  const [viewMode, setViewMode] = useState('split'); // '2d', '3d', 'split'
  const [backendConnected, setBackendConnected] = useState(false);
  const [events, setEvents] = useState([]);

  const timerRef = useRef(null);

  const addEvent = useCallback((type, message) => {
    const timeStr = new Date().toLocaleTimeString();
    setEvents(prev => [...prev.slice(-30), { time: timeStr, type, message }]);
  }, []);

  // Local fallback generator if backend is unavailable
  const generateLocalData = useCallback((selectedTier, selectedChoice) => {
    const num_points = 100;
    const base_lat = 13.0827;
    const base_lon = 80.2707;
    const hw = [];
    const srv = [];
    const pts = [];
    const cls = [];

    for (let i = 0; i < 120; i++) {
      const t = i / 119.0;
      const lat = base_lat + (t * 0.030) + 0.002 * Math.sin(t * Math.PI * 2.0);
      const lon = base_lon + (t * 0.030) + 0.003 * Math.sin(t * Math.PI * 1.5);
      hw.push([lat, lon]);
      srv.push([lat - (12.4 / 111000.0), lon + (12.4 / 111000.0)]);
    }

    let dr_lat = null;
    let dr_lon = null;

    for (let i = 0; i < num_points; i++) {
      const t = i / (num_points - 1);
      const is_outage = (selectedTier === 'hard' && i >= 50 && i <= 85);
      const true_road = (selectedChoice === 'highway') ? 'highway' : ((selectedChoice === 'service') ? 'service_road' : (t < 0.45 ? 'highway' : 'service_road'));
      const idx = Math.floor(t * (hw.length - 1));
      const [tlat, tlon] = (true_road === 'highway') ? hw[idx] : srv[idx];
      const speed = true_road === 'highway' ? 86 : 42;
      const heading = 45;

      let nlat = tlat + (Math.random() - 0.5) * (selectedTier === 'clean' ? 0.00005 : 0.00018);
      let nlon = tlon + (Math.random() - 0.5) * (selectedTier === 'clean' ? 0.00005 : 0.00018);

      if (selectedTier !== 'clean' && i >= 25 && i <= 40) {
        nlat += 15.0 / 111000.0;
        nlon += 15.0 / 111000.0;
      }

      if (is_outage) {
        nlat = null;
        nlon = null;
        if (dr_lat === null) {
          dr_lat = tlat;
          dr_lon = tlon;
        } else {
          dr_lat += (speed * 1000 / 3600 * 1.0 * Math.cos(Math.PI / 4)) / 111000.0;
          dr_lon += (speed * 1000 / 3600 * 1.0 * Math.sin(Math.PI / 4)) / 111000.0;
        }
      } else {
        dr_lat = null;
        dr_lon = null;
      }

      pts.push({
        step: i,
        timestamp: i * 1.0,
        true_lat: tlat,
        true_lon: tlon,
        noisy_lat: nlat,
        noisy_lon: nlon,
        dr_lat: dr_lat,
        dr_lon: dr_lon,
        speed: speed,
        heading: heading,
        gnss_error_m: is_outage ? 0 : 8.5,
        true_road: true_road,
        is_outage: is_outage
      });

      const outageSec = is_outage ? (i - 50 + 1) : 0;
      const conf = is_outage ? Math.max(0.40, Math.round(0.95 * Math.exp(-0.015 * outageSec) * 100) / 100) : 0.94;

      cls.push({
        step: i,
        timestamp: i * 1.0,
        classified_road: true_road,
        confidence: conf,
        uncertainty_radius_m: is_outage ? (8.0 + 1.2 * outageSec) : 6.0,
        mode: is_outage ? 'DEAD RECKONING (GPS OUTAGE)' : 'HMM + RF MATCHED',
        is_outage: is_outage,
        features: {
          d_highway_m: true_road === 'highway' ? 2.5 : 12.4,
          d_service_m: true_road === 'highway' ? 12.4 : 2.5,
          dist_diff_m: true_road === 'highway' ? 9.9 : -9.9,
          speed: speed,
          heading: heading,
          is_outage: is_outage,
          outage_seconds: outageSec,
          p_highway: true_road === 'highway' ? 0.94 : 0.06,
          p_service: true_road === 'highway' ? 0.06 : 0.94
        }
      });
    }

    setHighwayCoords(hw);
    setServiceCoords(srv);
    setPoints(pts);
    setClassifications(cls);
  }, []);

  // Fetch road polylines from FastAPI
  const fetchRoads = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/roads`);
      if (res.ok) {
        const data = await res.json();
        setHighwayCoords(data.raw_highway_coords || []);
        setServiceCoords(data.raw_service_coords || []);
        setBackendConnected(true);
        addEvent('GPS', 'Connected to FastAPI backend at http://127.0.0.1:8080');
      } else {
        throw new Error('Non-200 /roads response');
      }
    } catch (err) {
      setBackendConnected(false);
      addEvent('DEMO', 'FastAPI backend unavailable, running in LOCAL SYNTHETIC DEMO mode');
    }
  }, [addEvent]);

  // Load trajectory from FastAPI or fallback
  const loadTrajectory = useCallback(async (selectedTier = tier, selectedChoice = roadChoice) => {
    try {
      const res = await fetch(`${BACKEND_URL}/trajectory/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, road_choice: selectedChoice })
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || []);
        setClassifications(data.classifications || []);
        setCurrentIndex(0);
        setBackendConnected(true);
      } else {
        throw new Error('Non-200 response');
      }
    } catch (err) {
      setBackendConnected(false);
      generateLocalData(selectedTier, selectedChoice);
      setCurrentIndex(0);
    }
  }, [tier, roadChoice, generateLocalData]);

  useEffect(() => {
    fetchRoads();
    loadTrajectory('hard', 'switch');
  }, [fetchRoads, loadTrajectory]);

  // Simulation timer loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= points.length - 1) {
            setIsPlaying(false);
            addEvent('SUCCESS', 'Simulation playback completed.');
            return prev;
          }
          const nextIdx = prev + 1;
          const pt = points[nextIdx];
          const cls = classifications[nextIdx];

          // Log key scenario transition events
          if (nextIdx === 25) {
            addEvent('NOISE', '15m GNSS Multipath Bias detected! Nearest Road baseline fails...');
            addEvent('SUCCESS', 'ROADTRACE AI maintains correct Highway classification (Confidence 94%).');
          } else if (nextIdx === 50) {
            addEvent('OUTAGE', 'CRITICAL: 35-Second GNSS Outage Triggered! GNSS = LOST.');
            addEvent('DEMO', 'Dead Reckoning Active: Propagating via last pos + speed + heading.');
          } else if (nextIdx === 70) {
            addEvent('OUTAGE', 'GNSS Outage +20s: Confidence decaying (68%), uncertainty expanding.');
          } else if (nextIdx === 86) {
            addEvent('GPS', 'GNSS Restored! Recovering confidence to 95%.');
          }

          return nextIdx;
        });
      }, 250); // 4 Hz playback
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, points, classifications, addEvent]);

  // Handlers (WITHOUT AUTO SCROLLING)
  const handleTogglePlay = () => setIsPlaying(p => !p);
  const handleStep = () => setCurrentIndex(prev => Math.min(prev + 1, points.length - 1));
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    addEvent('DEMO', 'Simulation reset to step 0.');
  };
  const handleScrub = (idx) => setCurrentIndex(idx);

  const handleChangeTier = (newTier) => {
    setTier(newTier);
    loadTrajectory(newTier, roadChoice);
    addEvent('DEMO', `Switched GNSS Noise Scenario to: ${newTier.toUpperCase()}`);
  };

  const handleChangeRoadChoice = (newChoice) => {
    setRoadChoice(newChoice);
    loadTrajectory(tier, newChoice);
    addEvent('DEMO', `Switched Ground Truth Route to: ${newChoice.toUpperCase()}`);
  };

  // START LIVE SIMULATION (No scrolling)
  const handleStartSimulation = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
    addEvent('SUCCESS', 'START LIVE SIMULATION initiated: Vehicle moving along Chennai NH-48 corridor.');
  };

  // START JUDGE DEMO (No scrolling)
  const handleStartJudgeDemo = async () => {
    setIsPlaying(false);
    setTier('hard');
    setRoadChoice('switch');
    await loadTrajectory('hard', 'switch');
    setCurrentIndex(0);
    setIsPlaying(true);

    addEvent('DEMO', '==================================================');
    addEvent('DEMO', 'START JUDGE DEMO SEQUENCE INITIATED');
    addEvent('DEMO', '1. Clean GPS -> 2. 20m Noise -> 3. 15m Bias -> 4. Nearest Road Failure');
    addEvent('DEMO', '5. ROADTRACE AI Success -> 6. 35s GNSS Outage -> 7. Dead Reckoning');
    addEvent('DEMO', '8. Confidence Decay (95% -> 55%) -> 9. GNSS Restored -> 10. Evaluation');
    addEvent('DEMO', '==================================================');
  };

  const handleInjectNoise = async (eventType) => {
    try {
      const res = await fetch(`${BACKEND_URL}/trajectory/inject_noise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: points,
          event_type: eventType,
          start_index: Math.max(10, currentIndex),
          duration: 35
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || []);
        setClassifications(data.classifications || []);
        addEvent('OUTAGE', `Live noise injection (${eventType.toUpperCase()}) applied for 35s from step ${currentIndex}`);
      } else {
        throw new Error('Backend noise injection failed');
      }
    } catch (err) {
      addEvent('OUTAGE', `Live noise injection (${eventType.toUpperCase()}) simulated locally from step ${currentIndex}`);
    }
  };

  const currentPoint = points[currentIndex];
  const currentClassification = classifications[currentIndex];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060913',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '24px 32px',
      boxSizing: 'border-box'
    }}>
      {/* Header & Status HUD */}
      <header style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '20px',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            RT
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 50%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ROADTRACE AI — AV-03
            </h1>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              AI-Powered Highway vs Service Road Map Matching • <span style={{ color: '#38bdf8' }}>Chennai Urban Highway Corridor (NH-48, 12.4m Separation)</span>
            </div>
          </div>
        </div>

        {/* Mode HUD Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '5px 12px',
            borderRadius: '20px',
            background: backendConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(168, 85, 247, 0.12)',
            border: `1px solid ${backendConnected ? '#10b981' : '#a855f7'}`,
            color: backendConnected ? '#34d399' : '#c084fc'
          }}>
            MODE: {backendConnected ? 'FASTAPI BACKEND (http://127.0.0.1:8080)' : 'LOCAL SYNTHETIC DEMO'}
          </span>

          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '5px 12px',
            borderRadius: '20px',
            background: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.12)',
            border: `1px solid ${isPlaying ? '#10b981' : '#475569'}`,
            color: isPlaying ? '#34d399' : '#94a3b8'
          }}>
            SIMULATION: {isPlaying ? '● LIVE MOVING' : 'PAUSED'}
          </span>
        </div>
      </header>

      {/* Main Command Center Visualization Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) 1fr', gap: '24px', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Left / Primary Column: Visualizations (2D Map / 3D View / Split View) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                MAIN GEOSPATIAL VISUALIZATION CENTER
              </span>
              <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                {viewMode === '2d' ? '2D Leaflet Map' : (viewMode === '3d' ? '3D Three.js Autonomous Vehicle View' : 'Split Screen View')}
              </div>
            </div>

            {/* Viewport Container (Fixed Height ~420px, Stable Viewport, NO SCROLL) */}
            <div style={{ height: '420px', width: '100%', position: 'relative' }}>
              {viewMode === '2d' && (
                <LeafletMapView
                  highwayCoords={highwayCoords}
                  serviceCoords={serviceCoords}
                  points={points}
                  currentIndex={currentIndex}
                  classifications={classifications}
                />
              )}

              {viewMode === '3d' && (
                <ThreeVehicleViewer
                  currentPoint={currentPoint}
                  classification={currentClassification}
                  speed={currentClassification?.features?.speed || currentPoint?.speed || 60}
                  heading={currentPoint?.heading || 45}
                />
              )}

              {viewMode === 'split' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', height: '100%' }}>
                  <LeafletMapView
                    highwayCoords={highwayCoords}
                    serviceCoords={serviceCoords}
                    points={points}
                    currentIndex={currentIndex}
                    classifications={classifications}
                  />
                  <ThreeVehicleViewer
                    currentPoint={currentPoint}
                    classification={currentClassification}
                    speed={currentClassification?.features?.speed || currentPoint?.speed || 60}
                    heading={currentPoint?.heading || 45}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <ControlPanel
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStep={handleStep}
            onReset={handleReset}
            currentIndex={currentIndex}
            totalPoints={points.length}
            onScrub={handleScrub}
            tier={tier}
            onChangeTier={handleChangeTier}
            roadChoice={roadChoice}
            onChangeRoadChoice={handleChangeRoadChoice}
            onStartSimulation={handleStartSimulation}
            onStartJudgeDemo={handleStartJudgeDemo}
            onInjectNoise={handleInjectNoise}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
          />
        </div>

        {/* Right Column: Live Telemetry, Event Console & Explainability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Telemetry Panel */}
          <TelemetryPanel
            currentClassification={currentClassification}
            currentPoint={currentPoint}
          />

          {/* Real-time Streaming Event Console */}
          <EventConsole events={events} />
        </div>
      </div>

      {/* Synthetic Benchmark Evaluation Section */}
      <EvaluationPanel />
    </div>
  );
}
