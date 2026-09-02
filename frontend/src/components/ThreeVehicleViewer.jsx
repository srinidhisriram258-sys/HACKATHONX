import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeVehicleViewer({ currentPoint, classification, speed = 60, heading = 45 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const vehicleRef = useRef(null);
  const lidarBeamRef = useRef(null);
  const uncertaintySphereRef = useRef(null);
  const chassisMatRef = useRef(null);
  const wheelsRef = useRef([]);
  const serviceWarningRingRef = useRef(null);
  const serviceBeaconRef = useRef(null);
  const isServiceRoadRef = useRef(false);

  // Initialize Three.js scene once to avoid unmounting/remounting flicker
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // obsidian black
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 4.5, 7.5);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xa855f7, 2.0, 20, Math.PI / 4, 0.5);
    spotLight.position.set(-5, 8, -5);
    scene.add(spotLight);

    // 3D Road Surfaces
    // Highway Surface (Blue tint edges)
    const hwGeo = new THREE.BoxGeometry(20, 0.05, 3.5);
    const hwMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const hwMesh = new THREE.Mesh(hwGeo, hwMat);
    hwMesh.position.set(0, -0.025, 0);
    hwMesh.receiveShadow = true;
    scene.add(hwMesh);

    // Parallel Service Road Surface (Orange tint edges, 12.4m scaled separation = ~4.5 units in 3D)
    const srvGeo = new THREE.BoxGeometry(20, 0.05, 2.5);
    const srvMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.7 });
    const srvMesh = new THREE.Mesh(srvGeo, srvMat);
    srvMesh.position.set(0, -0.025, -4.5);
    srvMesh.receiveShadow = true;
    scene.add(srvMesh);

    // Lane Markings
    const laneGeo = new THREE.BoxGeometry(1.2, 0.06, 0.1);
    const laneMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let x = -8; x <= 8; x += 3) {
      const lane = new THREE.Mesh(laneGeo, laneMat);
      lane.position.set(x, 0.01, 0);
      scene.add(lane);
    }

    // Vehicle Group
    const vehicleGroup = new THREE.Group();
    vehicleRef.current = vehicleGroup;
    scene.add(vehicleGroup);

    // Metallic Chassis
    const chassisGeo = new THREE.BoxGeometry(2.4, 0.55, 1.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.15,
      metalness: 0.85,
    });
    chassisMatRef.current = chassisMat;
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    vehicleGroup.add(chassis);

    // Windshield & Cabin
    const cabinGeo = new THREE.BoxGeometry(1.3, 0.5, 1.0);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.1, 0.9, 0);
    cabin.castShadow = true;
    vehicleGroup.add(cabin);

    // Roof GNSS / LiDAR Rotating Sensor
    const sensorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16);
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.9, roughness: 0.1 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.set(0.1, 1.25, 0);
    vehicleGroup.add(sensor);

    // Rotating LiDAR Beam
    const beamGeo = new THREE.ConeGeometry(1.5, 0.4, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0.1, 1.25, 0);
    lidarBeamRef.current = beam;
    vehicleGroup.add(beam);

    // 3D GNSS Uncertainty Volume (Sphere)
    const sphereGeo = new THREE.SphereGeometry(1.5, 32, 16);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const uncertaintySphere = new THREE.Mesh(sphereGeo, sphereMat);
    uncertaintySphere.position.set(0, 0.6, 0);
    uncertaintySphereRef.current = uncertaintySphere;
    vehicleGroup.add(uncertaintySphere);

    // 3D SERVICE ROAD WARNING ALERT RING (Orange Halo around vehicle)
    const warningRingGeo = new THREE.TorusGeometry(2.0, 0.08, 16, 32);
    const warningRingMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    const warningRing = new THREE.Mesh(warningRingGeo, warningRingMat);
    warningRing.rotation.x = Math.PI / 2;
    warningRing.position.set(0, 0.1, 0);
    warningRing.visible = false;
    serviceWarningRingRef.current = warningRing;
    vehicleGroup.add(warningRing);

    // 3D SERVICE ROAD FLOATING WARNING BEACON (Above vehicle roof)
    const beaconGeo = new THREE.OctahedronGeometry(0.35);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xff6600,
      emissiveIntensity: 1.8,
      roughness: 0.1
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 2.2, 0);
    beacon.visible = false;
    serviceBeaconRef.current = beacon;
    vehicleGroup.add(beacon);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
    const wheelPositions = [
      [0.75, 0.28, 0.65],
      [0.75, 0.28, -0.65],
      [-0.75, 0.28, 0.65],
      [-0.75, 0.28, -0.65]
    ];
    
    wheelsRef.current = wheelPositions.map(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(...pos);
      vehicleGroup.add(w);
      return w;
    });

    // Headlights (Electric LED)
    const hlGeo = new THREE.BoxGeometry(0.06, 0.12, 0.25);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(1.2, 0.5, 0.4);
    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(1.2, 0.5, -0.4);
    vehicleGroup.add(hlLeft, hlRight);

    // Animation loop
    let animId;
    const timer = new THREE.Timer();

    const animate = (timestamp) => {
      animId = requestAnimationFrame(animate);
      timer.update(timestamp);
      const delta = timer.getDelta();
      const time = timer.getElapsed();

      // Rotate LiDAR Sensor beam continuously
      if (lidarBeamRef.current) {
        lidarBeamRef.current.rotation.z += 3.0 * delta;
      }

      // Rotate wheels based on current speed
      if (wheelsRef.current.length > 0) {
        const rot = (speed / 12) * delta;
        wheelsRef.current.forEach(w => {
          w.rotation.z -= rot;
        });
      }

      // Gentle floating/bouncing suspension dynamics
      if (vehicleRef.current) {
        vehicleRef.current.position.y = Math.sin(time * 6) * 0.015;
      }

      // 3D SERVICE ROAD WARNING ALERT ANIMATION
      const isService = isServiceRoadRef.current;
      if (serviceWarningRingRef.current) {
        serviceWarningRingRef.current.visible = isService;
        if (isService) {
          serviceWarningRingRef.current.rotation.z += 1.8 * delta;
          const pulse = 1.0 + 0.12 * Math.sin(time * 5.0);
          serviceWarningRingRef.current.scale.set(pulse, pulse, pulse);
        }
      }

      if (serviceBeaconRef.current) {
        serviceBeaconRef.current.visible = isService;
        if (isService) {
          serviceBeaconRef.current.rotation.y += 2.5 * delta;
          serviceBeaconRef.current.position.y = 2.2 + 0.1 * Math.sin(time * 4.0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Smoothly update vehicle state, position, 3D uncertainty sphere, and Service Road warning without re-mounting
  useEffect(() => {
    if (!classification) return;

    const isOutage = classification.is_outage;
    const road = classification.classified_road || classification.predictions?.fusion_engine || 'highway';
    const isService = road.includes('service');
    const uncertRadius = classification.uncertainty_radius_m || 5.0;

    isServiceRoadRef.current = isService;

    // Update chassis color
    if (chassisMatRef.current) {
      if (isOutage) {
        chassisMatRef.current.color.setHex(0xef4444); // Red during 35s GNSS outage
      } else if (!isService) {
        chassisMatRef.current.color.setHex(0x2563eb); // Blue for Highway
      } else {
        chassisMatRef.current.color.setHex(0xf97316); // Orange for Service Road
      }
    }

    // Update 3D vehicle position on highway vs service road 3D surface
    if (vehicleRef.current) {
      const zPos = (!isService) ? 0 : -4.5;
      vehicleRef.current.position.z = zPos;
      // Vehicle heading angle in 3D
      vehicleRef.current.rotation.y = THREE.MathUtils.degToRad((heading || 45) - 45);
    }

    // Update 3D uncertainty sphere scale & opacity
    if (uncertaintySphereRef.current) {
      const scale = Math.min(3.5, Math.max(0.8, uncertRadius / 6.0));
      uncertaintySphereRef.current.scale.set(scale, scale, scale);
      uncertaintySphereRef.current.material.color.setHex(isOutage ? 0xef4444 : (isService ? 0xf97316 : 0x38bdf8));
      uncertaintySphereRef.current.material.opacity = isOutage ? 0.45 : 0.25;
    }
  }, [classification, heading]);

  return (
    <div style={{
      width: '100%',
      height: '420px',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      background: '#060913',
      border: '1px solid #1e293b'
    }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* 3D HUD Telemetry Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(9, 13, 22, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        backdropFilter: 'blur(8px)',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#f8fafc',
        fontFamily: 'monospace',
        zIndex: 10
      }}>
        <div><span style={{ color: '#38bdf8' }}>3D SENSORS:</span> LiDAR &amp; GNSS Active</div>
        <div><span style={{ color: '#a855f7' }}>3D UNCERTAINTY:</span> {classification?.uncertainty_radius_m || 5.0}m</div>
        <div><span style={{ color: '#10b981' }}>3D HEADING:</span> {heading}°</div>
      </div>

      {/* 3D Service Road Visual Alert Banner inside 3D View */}
      {isServiceRoadRef.current && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(249, 115, 22, 0.9)',
          color: '#ffffff',
          border: '1.5px solid #ff6600',
          backdropFilter: 'blur(10px)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '900',
          letterSpacing: '0.05em',
          boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>⚠️</span>
          <span>SERVICE ROAD CLASSIFIED — 12.4M LATERAL SEPARATION</span>
        </div>
      )}
    </div>
  );
}
