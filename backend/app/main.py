from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional

from app.data_gen import generate_road_geometry, generate_synthetic_trajectory
from app.models.hmm_model import HMMMapMatcher

app = FastAPI(title="RoadTrace AI Map-Matching API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

hmm_matcher = HMMMapMatcher()

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "2.0.0-upgrade"}

@app.get("/roads")
def get_roads():
    """Returns road polylines as GeoJSON feature collections."""
    highway_coords, service_coords = generate_road_geometry()
    
    highway_geojson = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[lon, lat] for lat, lon in highway_coords]
        },
        "properties": {"name": "NH-48 Highway (Motorway)", "color": "#2563eb"}
    }
    
    service_geojson = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[lon, lat] for lat, lon in service_coords]
        },
        "properties": {"name": "Service Road (12.4m Separation)", "color": "#f97316"}
    }
    
    return {
        "highway": highway_geojson,
        "service_road": service_geojson,
        "raw_highway_coords": highway_coords,
        "raw_service_coords": service_coords
    }

@app.post("/trajectory/generate")
def generate_trajectory(payload: Dict[str, Any] = Body(...)):
    """Generates synthetic noisy trajectory and returns multi-model classifications & EKF state."""
    tier = payload.get("tier", "hard")
    road_choice = payload.get("road_choice", "switch")
    
    highway_coords, service_coords, points = generate_synthetic_trajectory(tier=tier, road_choice=road_choice)
    res = hmm_matcher.classify_trajectory(points, highway_coords, service_coords)
    
    return {
        "tier": tier,
        "road_choice": road_choice,
        "points": points,
        "classifications": res["classifications"],
        "accuracy_summary": res["accuracy_summary"]
    }

@app.post("/trajectory/classify")
def classify_trajectory(payload: Dict[str, Any] = Body(...)):
    """Classifies a given trajectory using Random Forest + HMM Viterbi + EKF Kalman Filter."""
    points = payload.get("points", [])
    highway_coords, service_coords = generate_road_geometry()
    
    res = hmm_matcher.classify_trajectory(points, highway_coords, service_coords)
    return {
        "classifications": res["classifications"],
        "accuracy_summary": res["accuracy_summary"],
        "total_points": len(points)
    }

@app.post("/trajectory/inject_noise")
def inject_noise(payload: Dict[str, Any] = Body(...)):
    """Live noise injection endpoint powering judge demo & spoofing test feature."""
    points = payload.get("points", [])
    event_type = payload.get("event_type", "outage") # "outage", "multipath", or "spoofing"
    start_index = int(payload.get("start_index", 20))
    duration = int(payload.get("duration", 15))
    
    highway_coords, service_coords = generate_road_geometry()
    
    modified_points = []
    for i, pt in enumerate(points):
        new_pt = dict(pt)
        if start_index <= i < start_index + duration:
            if event_type == "outage":
                new_pt["is_outage"] = True
                new_pt["noisy_lat"] = None
                new_pt["noisy_lon"] = None
            elif event_type == "multipath":
                new_pt["is_outage"] = False
                if new_pt.get("noisy_lat") is not None:
                    new_pt["noisy_lat"] += 15.0 / 111000.0
                    new_pt["noisy_lon"] += 15.0 / 111000.0
            elif event_type == "spoofing":
                new_pt["is_outage"] = False
                if new_pt.get("noisy_lat") is not None:
                    # Physically implausible position jump (50m sudden jump)
                    new_pt["noisy_lat"] += 45.0 / 111000.0
                    new_pt["noisy_lon"] += 45.0 / 111000.0
                    new_pt["gnss_error_m"] = 45.0
        modified_points.append(new_pt)
        
    res = hmm_matcher.classify_trajectory(modified_points, highway_coords, service_coords)
    
    return {
        "event_type": event_type,
        "start_index": start_index,
        "duration": duration,
        "points": modified_points,
        "classifications": res["classifications"],
        "accuracy_summary": res["accuracy_summary"]
    }
