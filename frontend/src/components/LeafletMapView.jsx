import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapController({ center, highwayCoords }) {
  const map = useMap();

  useEffect(() => {
    if (highwayCoords && highwayCoords.length > 0) {
      const bounds = L.latLngBounds(highwayCoords);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [highwayCoords, map]);

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 0.25 });
    }
  }, [center, map]);

  return null;
}

export default function LeafletMapView({
  highwayCoords = [],
  serviceCoords = [],
  points = [],
  currentIndex = 0,
  classifications = []
}) {
  const defaultCenter = useMemo(() => {
    if (highwayCoords.length > 0) {
      return highwayCoords[0];
    }
    return [13.0827, 80.2707]; // Chennai NH-48
  }, [highwayCoords]);

  const currentPoint = points[currentIndex];
  const currentClassification = classifications[currentIndex];

  // Vehicle position: noisy GNSS fix if available, or Dead Reckoning / Ground truth during outage
  const currentPos = useMemo(() => {
    if (!currentPoint) return defaultCenter;
    if (currentPoint.is_outage) {
      if (currentPoint.dr_lat != null && currentPoint.dr_lon != null) {
        return [currentPoint.dr_lat, currentPoint.dr_lon];
      }
      return [currentPoint.true_lat, currentPoint.true_lon];
    }
    if (currentPoint.noisy_lat != null && currentPoint.noisy_lon != null) {
      return [currentPoint.noisy_lat, currentPoint.noisy_lon];
    }
    return [currentPoint.true_lat, currentPoint.true_lon];
  }, [currentPoint, defaultCenter]);

  // Ground truth path
  const groundTruthCoords = useMemo(() => {
    return points.map(pt => [pt.true_lat, pt.true_lon]);
  }, [points]);

  const isOutage = currentClassification?.is_outage;
  const road = currentClassification?.classified_road;

  const markerColor = isOutage ? '#ef4444' : (road === 'highway' ? '#2563eb' : '#f97316');

  return (
    <div style={{ height: '420px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController center={currentPos} highwayCoords={highwayCoords} />

        {/* Highway Line (Blue) */}
        {highwayCoords.length > 0 && (
          <Polyline
            positions={highwayCoords}
            pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.85 }}
          >
            <Popup>NH-48 Highway (Chennai Urban Corridor)</Popup>
          </Polyline>
        )}

        {/* Service Road Line (Orange 12.4m separation) */}
        {serviceCoords.length > 0 && (
          <Polyline
            positions={serviceCoords}
            pathOptions={{ color: '#f97316', weight: 4, opacity: 0.85, dashArray: '6, 6' }}
          >
            <Popup>Parallel Service Road (Frontage Road - 12.4m Separation)</Popup>
          </Polyline>
        )}

        {/* Ground Truth Path (Emerald line) */}
        {groundTruthCoords.length > 0 && (
          <Polyline
            positions={groundTruthCoords}
            pathOptions={{ color: '#10b981', weight: 2, opacity: 0.5, dashArray: '3, 4' }}
          />
        )}

        {/* Noisy Fixes Trace */}
        {points.slice(0, currentIndex + 1).map((pt, idx) => {
          if (pt.is_outage || pt.noisy_lat == null || pt.noisy_lon == null) return null;
          const isCurrent = idx === currentIndex;
          const cls = classifications[idx];
          const color = cls?.classified_road === 'highway' ? '#60a5fa' : '#fb923c';

          return (
            <CircleMarker
              key={idx}
              center={[pt.noisy_lat, pt.noisy_lon]}
              radius={isCurrent ? 6 : 3}
              pathOptions={{
                fillColor: color,
                color: isCurrent ? '#ffffff' : color,
                weight: isCurrent ? 2 : 1,
                fillOpacity: isCurrent ? 0.9 : 0.4
              }}
            />
          );
        })}

        {/* GNSS Uncertainty Region Circle (Expands during 35s outage) */}
        {currentPos && (
          <Circle
            center={currentPos}
            radius={currentClassification?.uncertainty_radius_m || 10.0}
            pathOptions={{
              color: isOutage ? '#ef4444' : '#38bdf8',
              fillColor: isOutage ? '#ef4444' : '#38bdf8',
              fillOpacity: isOutage ? 0.25 : 0.12,
              weight: 1.5,
              dashArray: isOutage ? '4, 4' : undefined
            }}
          />
        )}

        {/* Autonomous Vehicle Marker */}
        {currentPos && (
          <CircleMarker
            center={currentPos}
            radius={9}
            pathOptions={{
              fillColor: markerColor,
              color: '#ffffff',
              weight: 3,
              fillOpacity: 1.0
            }}
          >
            <Popup>
              <div style={{ color: '#0f172a', fontWeight: 'bold' }}>
                Chennai NH-48 Corridor Fix #{currentIndex}<br />
                Mode: {isOutage ? 'DEAD RECKONING (35s OUTAGE)' : road?.toUpperCase()}<br />
                Confidence: {Math.round((currentClassification?.confidence || 0) * 100)}%
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
