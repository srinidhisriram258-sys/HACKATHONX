from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import json

from app.data_gen import generate_road_geometry, generate_synthetic_trajectory
from app.models.hmm_model import HMMMapMatcher

app = FastAPI(title="RoadTrace AI Map-Matching API", version="1.0.0")

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
    return {"status": "ok"}

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
        "properties": {"name": "Highway (Motorway)", "color": "#2563eb"}
    }
    
    service_geojson = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[lon, lat] for lat, lon in service_coords]
        },
        "properties": {"name": "Service Road", "color": "#f97316"}
    }
    
    return {
        "highway": highway_geojson,
        "service_road": service_geojson,
        "raw_highway_coords": highway_coords,
        "raw_service_coords": service_coords
    }

@app.post("/trajectory/generate")
def generate_trajectory(payload: Dict[str, Any] = Body(...)):
    """Generates synthetic noisy trajectory and returns HMM classifications."""
    tier = payload.get("tier", "hard")
    road_choice = payload.get("road_choice", "switch")
    
    highway_coords, service_coords, points = generate_synthetic_trajectory(tier=tier, road_choice=road_choice)
    classifications = hmm_matcher.classify_trajectory(points, highway_coords, service_coords)
    
    return {
        "tier": tier,
        "road_choice": road_choice,
        "points": points,
        "classifications": classifications
    }

@app.post("/trajectory/classify")
def classify_trajectory(payload: Dict[str, Any] = Body(...)):
    """Classifies a given trajectory using the HMM model."""
    points = payload.get("points", [])
    highway_coords, service_coords = generate_road_geometry()
    
    classifications = hmm_matcher.classify_trajectory(points, highway_coords, service_coords)
    return {
        "classifications": classifications,
        "total_points": len(points)
    }

@app.post("/trajectory/inject_noise")
def inject_noise(payload: Dict[str, Any] = Body(...)):
    """Live noise injection endpoint powering judge demo feature."""
    points = payload.get("points", [])
    event_type = payload.get("event_type", "outage") # "outage" or "multipath"
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
                    # Offset position by 25m toward wrong road
                    new_pt["noisy_lat"] += 25.0 / 111000.0
                    new_pt["noisy_lon"] += 25.0 / 111000.0
        modified_points.append(new_pt)
        
    classifications = hmm_matcher.classify_trajectory(modified_points, highway_coords, service_coords)
    
    return {
        "event_type": event_type,
        "start_index": start_index,
        "duration": duration,
        "points": modified_points,
        "classifications": classifications
    }
