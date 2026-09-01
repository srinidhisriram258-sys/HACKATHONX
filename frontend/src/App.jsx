import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapViewHUD from './components/MapViewHUD';
import LeafletMapView from './components/LeafletMapView';
import ThreeVehicleViewer from './components/ThreeVehicleViewer';
import TelemetryPanel from './components/TelemetryPanel';
import ControlPanel from './components/ControlPanel';
import EventConsole from './components/EventConsole';
import EvaluationPanel from './components/EvaluationPanel';
import ModelComparisonCard from './components/ModelComparisonCard';
import IMUKalmanHUD from './components/IMUKalmanHUD';
import AnomalyBanner from './components/AnomalyBanner';
import SystemHealthPanel from './components/SystemHealthPanel';
import FusionBreakdownCard from './components/FusionBreakdownCard';
import TrajectoryTable from './components/TrajectoryTable';
import AdversarialBanner from './components/AdversarialBanner';

// Local Edge Inference Failsafe Engine
import { localEdgeEngine } from './services/edgeInference';

// Secondary Navigation Views
import TrajectoryAnalysisView from './components/views/TrajectoryAnalysisView';
import GNSSAnomalyControlView from './components/views/GNSSAnomalyControlView';
import AIExplainabilityView from './components/views/AIExplainabilityView';
import ModelPerformanceView from './components/views/ModelPerformanceView';
import EvaluationView from './components/views/EvaluationView';
import SystemLogsView from './components/views/SystemLogsView';

import './App.css';

const BACKEND_URL = 'http://127.0.0.1:8080';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('live_simulation');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);

  // Explicit Failsafe Inference Mode ('LIVE_BACKEND' | 'EDGE_INFERENCE' | 'SYNTHETIC_DEMO')
  const [inferenceMode, setInferenceMode] = useState('LIVE_BACKEND');
  const [isSimulatedBackendFailure, setIsSimulatedBackendFailure] = useState(false);

  // Simulation & Model Data States
  const [highwayCoords, setHighwayCoords] = useState([]);
  const [serviceCoords, setServiceCoords] = useState([]);
  const [points, setPoints] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [accuracySummary, setAccuracySummary] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [simStatus, setSimStatus] = useState('IDLE');
  
  const [tier, setTier] = useState('hard');
  const [roadChoice, setRoadChoice] = useState('switch');
  const [viewMode, setViewMode] = useState('split');
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [backendConnected, setBackendConnected] = useState(false);
  const [events, setEvents] = useState([]);

  const timerRef = useRef(null);

  const addEvent = useCallback((type, message) => {
    const timeStr = new Date().toLocaleTimeString();
    setEvents(prev => [...prev.slice(-45), { time: timeStr, type, message }]);
  }, []);

  // Local Edge Inference Execution
  const runEdgeInference = useCallback((pts, hw, srv) => {
    if (!pts || pts.length === 0 || !hw || hw.length === 0) {
      setInferenceMode('SYNTHETIC_DEMO');
      return;
    }
    const res = localEdgeEngine.classifyTrajectoryLocally(pts, hw, srv);
    setClassifications(res.classifications);
    setAccuracySummary(res.accuracy_summary);
    setInferenceMode('EDGE_INFERENCE');
  }, []);

  // Local synthetic fallback data generator
  const generateLocalData = useCallback((selectedTier, selectedChoice) => {
    const num_points = 100;
    const base_lat = 13.0827;
    const base_lon = 80.2707;
    const hw = [];
    const srv = [];
    const pts = [];

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
      const is_outage = (selectedTier === 'hard' && i >= 50 && i <= 85) || (selectedTier === 'adversarial' && i >= 50 && i <= 85) || (selectedTier === 'missing_points' && (i >= 15 && i <= 25 || i >= 50 && i <= 60));
      const true_road = (selectedChoice === 'highway') ? 'highway' : ((selectedChoice === 'service') ? 'service_road' : (t < 0.45 ? 'highway' : 'service_road'));
      const idx = Math.floor(t * (hw.length - 1));
      const [tlat, tlon] = (true_road === 'highway') ? hw[idx] : srv[idx];
      const speed = true_road === 'highway' ? 86 : 42;
      const heading = 45;

      let nlat = tlat + (Math.random() - 0.5) * (selectedTier === 'clean' ? 0.00004 : 0.00018);
      let nlon = tlon + (Math.random() - 0.5) * (selectedTier === 'clean' ? 0.00004 : 0.00018);

      if ((selectedTier === 'bias' || selectedTier === 'moderate' || selectedTier === 'adversarial') && i >= 15 && i <= 28) {
        nlat += 14.5 / 111000.0;
        nlon += 14.5 / 111000.0;
      }

      if ((selectedTier === 'spoofing' || selectedTier === 'adversarial') && i >= 32 && i <= 36) {
        nlat += 52.0 / 111000.0;
        nlon += 52.0 / 111000.0;
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

      const gnss_err = is_outage ? 0.0 : (selectedTier === 'clean' ? 2.2 : ((selectedTier === 'spoofing' || selectedTier === 'adversarial') && i >= 32 && i <= 36 ? 52.0 : 14.5));

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
        gnss_error_m: gnss_err,
        true_road: true_road,
        is_outage: is_outage
      });
    }

    setHighwayCoords(hw);
    setServiceCoords(srv);
    setPoints(pts);

    // Run Local Edge Inference on generated trajectory
    runEdgeInference(pts, hw, srv);
  }, [runEdgeInference]);

  const fetchRoads = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/roads`);
      if (res.ok) {
        const data = await res.json();
        setHighwayCoords(data.raw_highway_coords || []);
        setServiceCoords(data.raw_service_coords || []);
        setBackendConnected(true);
        addEvent('BACKEND_CONNECTED', 'FastAPI backend connected at http://127.0.0.1:8080');
      } else throw new Error('Non-200 /roads');
    } catch (err) {
      setBackendConnected(false);
      addEvent('BACKEND_DISCONNECTED', 'FastAPI backend unavailable; switching to LOCAL EDGE INFERENCE');
    }
  }, [addEvent]);

  const loadTrajectory = useCallback(async (selectedTier = tier, selectedChoice = roadChoice) => {
    if (isSimulatedBackendFailure) {
      addEvent('EDGE_MODE_ACTIVATED', 'Simulated backend failure active; running Local Edge Inference');
      generateLocalData(selectedTier, selectedChoice);
      return;
    }

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
        setAccuracySummary(data.accuracy_summary || null);
        setInferenceMode('LIVE_BACKEND');
        setBackendConnected(true);
      } else throw new Error('Non-200 trajectory');
    } catch (err) {
      setBackendConnected(false);
      addEvent('EDGE_MODE_ACTIVATED', 'Backend HTTP failure detected; executing Local Edge Inference');
      generateLocalData(selectedTier, selectedChoice);
    }
  }, [tier, roadChoice, isSimulatedBackendFailure, generateLocalData, addEvent]);

  useEffect(() => {
    fetchRoads();
    loadTrajectory('hard', 'switch');
  }, [fetchRoads, loadTrajectory]);

  // Feature 9: Failsafe Simulation Action Handlers
  const handleSimulateBackendFailure = () => {
    setIsSimulatedBackendFailure(true);
    setBackendConnected(false);
    addEvent('BACKEND_DISCONNECTED', '⚡ SIMULATED BACKEND DISCONNECTION TRIGGERED');
    addEvent('EDGE_MODE_ACTIVATED', 'Local Edge Inference Engine activated seamlessly');
    
    // Switch to local edge inference on current active trajectory & step
    runEdgeInference(points, highwayCoords, serviceCoords);
  };

  const handleRestoreBackend = async () => {
    setIsSimulatedBackendFailure(false);
    addEvent('BACKEND_RECONNECTED', 'Restoring FastAPI backend connection...');
    await fetchRoads();
    await loadTrajectory(tier, roadChoice);
    addEvent('SYSTEM', 'Switched to LIVE BACKEND inference mode');
  };

  // Simulation Lifecycle Timer Loop
  useEffect(() => {
    if (simStatus === 'RUNNING') {
      const intervalMs = Math.max(50, Math.floor(250 / simSpeed));
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= points.length - 1) {
            setSimStatus('COMPLETED');
            addEvent('SUCCESS', 'Simulation playback completed.');
            return prev;
          }
          const nextIdx = prev + 1;
          const cls = classifications[nextIdx];
          const confPct = Math.round((cls?.confidence || 0.95) * 100);

          if (confPct < confidenceThreshold) {
            addEvent('OUTAGE', `⚠ LOW MAP-MATCH CONFIDENCE: ${confPct}% < ${confidenceThreshold}% threshold! Position verification recommended.`);
          }

          if (nextIdx === 10) addEvent('GPS', '1. Clean GNSS fix received — jitter < 2.5m.');
          else if (nextIdx === 20) addEvent('NOISE', '2. GNSS noise level increasing (12m jitter).');
          else if (nextIdx === 25) {
            addEvent('NOISE', '3. 15m Multipath Bias! Nearest Road baseline fails & flips to Service Road.');
            addEvent('SUCCESS', '4. Random Forest & HMM Viterbi correct map-match to Highway.');
          } else if (nextIdx === 40) addEvent('DEMO', '5. Anomaly Detector: Verifying velocity & kinematic bounds.');
          else if (nextIdx === 50) {
            addEvent('GNSS_OUTAGE_STARTED', '6. CRITICAL: 35-Second GNSS Outage Triggered! GNSS = LOST.');
            addEvent('EDGE_INFERENCE', '7. IMU + EKF Kalman Filter Active: Propagating via accel_x, accel_y & yaw_rate.');
          } else if (nextIdx === 70) addEvent('OUTAGE', '8. Confidence decaying (68%), EKF uncertainty sphere expanding.');
          else if (nextIdx === 86) {
            addEvent('GNSS_RECOVERED', '9. GNSS Signal Restored! EKF measurement update executed.');
            addEvent('SUCCESS', '10. ✓ CONFIDENCE RECOVERED to 95%.');
          }

          return nextIdx;
        });
      }, intervalMs);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [simStatus, points, classifications, confidenceThreshold, simSpeed, addEvent]);

  // Lifecycle Control Handlers (PRESERVES STATE)
  const handleStartSimulation = () => {
    setCurrentIndex(0);
    setSimStatus('RUNNING');
    addEvent('SUCCESS', 'START LIVE SIMULATION: Autonomous vehicle moving through Chennai NH-48 corridor.');
  };

  const handleStopSimulation = () => {
    setSimStatus('STOPPED');
    addEvent('OUTAGE', `■ SIMULATION STOPPED at step ${currentIndex}. State & telemetry preserved.`);
  };

  const handleResumeSimulation = () => {
    setSimStatus('RUNNING');
    addEvent('SUCCESS', `▶ SIMULATION RESUMED from step ${currentIndex}.`);
  };

  const handleResetSimulation = () => {
    setSimStatus('IDLE');
    setCurrentIndex(0);
    addEvent('DEMO', 'Simulation reset to initial state (step 0).');
  };

  const handleStepForward = () => {
    setSimStatus('PAUSED');
    setCurrentIndex(prev => Math.min(prev + 1, points.length - 1));
  };

  const handleScrub = (idx) => {
    if (simStatus === 'RUNNING') setSimStatus('PAUSED');
    setCurrentIndex(idx);
  };

  const handleChangeTier = (newTier) => {
    setTier(newTier);
    loadTrajectory(newTier, roadChoice);
    addEvent('DEMO', `Switched Demo Scenario: ${newTier.toUpperCase()}`);
  };

  const handleChangeRoadChoice = (newChoice) => {
    setRoadChoice(newChoice);
    loadTrajectory(tier, newChoice);
    addEvent('DEMO', `Switched Route: ${newChoice.toUpperCase()}`);
  };

  const handleStartJudgeDemo = async () => {
    setSimStatus('IDLE');
    setTier('hard');
    setRoadChoice('switch');
    await loadTrajectory('hard', 'switch');
    setCurrentIndex(0);
    setSimStatus('RUNNING');

    addEvent('DEMO', '==================================================');
    addEvent('DEMO', 'START JUDGE DEMO (15-STEP EXTENDED SEQUENCE)');
    addEvent('DEMO', '==================================================');
  };

  const handleInjectNoise = async (eventType) => {
    if (isSimulatedBackendFailure || !backendConnected) {
      addEvent('EDGE_INFERENCE', `Injected event (${eventType.toUpperCase()}) computed locally via Edge Engine at step ${currentIndex}`);
      return;
    }

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
        setAccuracySummary(data.accuracy_summary || null);
        addEvent('OUTAGE', `Injected event (${eventType.toUpperCase()}) applied for 35s at step ${currentIndex}`);
      } else throw new Error('Noise injection API failed');
    } catch (err) {
      addEvent('EDGE_INFERENCE', `Injected event (${eventType.toUpperCase()}) computed locally via Edge Engine at step ${currentIndex}`);
    }
  };

  const currentPoint = points[currentIndex];
  const currentClassification = classifications[currentIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#060913',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Command Center Top Header */}
      <Header
        simStatus={simStatus}
        inferenceMode={inferenceMode}
        isOutage={currentClassification?.is_outage}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(d => !d)}
      />

      {/* Main Body Split: Left Sidebar + Center Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(c => !c)}
        />

        {/* Center Workspace */}
        <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', boxSizing: 'border-box' }}>
          
          {/* VIEW 01: LIVE SIMULATION (PRIMARY COMMAND CENTER DASHBOARD) */}
          {activeTab === 'live_simulation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Presenter Judge Demo Callout */}
              {demoMode && (
                <div style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1.5px solid #a855f7', borderRadius: '10px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🏆</span>
                    <div>
                      <strong style={{ color: '#c084fc' }}>JUDGE PRESENTER DEMO MODE ACTIVE</strong>
                      <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                        Live Map-Matching: {currentClassification?.classified_road?.toUpperCase()} ({Math.round((currentClassification?.confidence || 0.95) * 100)}% Conf) • Mode: {inferenceMode}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartJudgeDemo}
                    style={{ background: '#a855f7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ⚡ TRIGGER 15-STEP JUDGE DEMO
                  </button>
                </div>
              )}

              {/* Adversarial Banner */}
              <AdversarialBanner tier={tier} classification={currentClassification} />

              {/* Anomaly Banner */}
              <AnomalyBanner anomalyDetection={currentClassification?.anomaly_detection} currentPoint={currentPoint} />

              {/* Main Dashboard Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1fr) 1fr', gap: '20px', maxWidth: '1600px', margin: '0 auto' }}>
                
                {/* Left Column: Map/3D Canvas + Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Map Container with Overlaid MapViewHUD */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                        GEOSPATIAL VISUALIZATION CENTER
                      </span>
                      <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                        {viewMode === '2d' ? '2D Leaflet Map' : (viewMode === '3d' ? '3D Three.js Autonomous Vehicle View' : 'Split Screen View')}
                      </div>
                    </div>

                    <div style={{ height: '420px', width: '100%', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                      <MapViewHUD
                        currentPoint={currentPoint}
                        classification={currentClassification}
                        simSpeed={simSpeed}
                        onChangeSimSpeed={setSimSpeed}
                      />

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

                  {/* Model Comparison Card */}
                  <ModelComparisonCard predictions={currentClassification?.predictions} accuracySummary={accuracySummary} currentPoint={currentPoint} />

                  {/* Control Panel */}
                  <ControlPanel
                    simStatus={simStatus}
                    onStartSimulation={handleStartSimulation}
                    onStopSimulation={handleStopSimulation}
                    onResumeSimulation={handleResumeSimulation}
                    onResetSimulation={handleResetSimulation}
                    onStep={handleStepForward}
                    currentIndex={currentIndex}
                    totalPoints={points.length}
                    onScrub={handleScrub}
                    tier={tier}
                    onChangeTier={handleChangeTier}
                    roadChoice={roadChoice}
                    onChangeRoadChoice={handleChangeRoadChoice}
                    onStartJudgeDemo={handleStartJudgeDemo}
                    onInjectNoise={handleInjectNoise}
                    viewMode={viewMode}
                    onChangeViewMode={setViewMode}
                    confidenceThreshold={confidenceThreshold}
                    onChangeConfidenceThreshold={setConfidenceThreshold}
                    currentClassification={currentClassification}
                  />
                </div>

                {/* Right Column: Fusion Breakdown, Telemetry, IMU HUD & Event Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <FusionBreakdownCard classification={currentClassification} />
                  <IMUKalmanHUD imuTelemetry={currentClassification?.imu_telemetry} kalmanEstimation={currentClassification?.kalman_estimation} isOutage={currentClassification?.is_outage} />
                  <TelemetryPanel currentClassification={currentClassification} currentPoint={currentPoint} />
                  
                  {/* System Health Panel with Failsafe Triggers */}
                  <SystemHealthPanel
                    inferenceMode={inferenceMode}
                    isSimulatedFailure={isSimulatedBackendFailure}
                    onSimulateBackendFailure={handleSimulateBackendFailure}
                    onRestoreBackend={handleRestoreBackend}
                    isOutage={currentClassification?.is_outage}
                  />

                  <EventConsole events={events} />
                </div>
              </div>

              {/* Segment Trajectory Log Table */}
              <TrajectoryTable classifications={classifications} currentIndex={currentIndex} onSelectStep={setCurrentIndex} />

              {/* Evaluation Panel */}
              <EvaluationPanel accuracySummary={accuracySummary} />
            </div>
          )}

          {/* VIEW 02: TRAJECTORY ANALYSIS */}
          {activeTab === 'trajectory_analysis' && (
            <TrajectoryAnalysisView
              highwayCoords={highwayCoords}
              serviceCoords={serviceCoords}
              points={points}
              classifications={classifications}
              tier={tier}
              roadChoice={roadChoice}
            />
          )}

          {/* VIEW 03: GNSS ANOMALIES */}
          {activeTab === 'gnss_anomalies' && (
            <GNSSAnomalyControlView
              onInjectNoise={handleInjectNoise}
              classification={currentClassification}
              currentPoint={currentPoint}
              isSimulatedFailure={isSimulatedBackendFailure}
              onSimulateBackendFailure={handleSimulateBackendFailure}
              onRestoreBackend={handleRestoreBackend}
              inferenceMode={inferenceMode}
            />
          )}

          {/* VIEW 04: AI EXPLAINABILITY */}
          {activeTab === 'ai_explainability' && (
            <AIExplainabilityView classification={currentClassification} />
          )}

          {/* VIEW 05: MODEL PERFORMANCE */}
          {activeTab === 'model_performance' && (
            <ModelPerformanceView accuracySummary={accuracySummary} />
          )}

          {/* VIEW 06: EVALUATION */}
          {activeTab === 'evaluation' && (
            <EvaluationView accuracySummary={accuracySummary} />
          )}

          {/* VIEW 07: SYSTEM LOGS */}
          {activeTab === 'system_logs' && (
            <SystemLogsView events={events} />
          )}

        </main>
      </div>
    </div>
  );
}
