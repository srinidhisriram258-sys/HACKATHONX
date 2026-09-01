import math
import numpy as np

def generate_road_geometry():
    """Generates parallel highway (NH-48 Chennai) and service road polylines with 12.4m separation."""
    num_points = 120
    base_lat = 13.0827
    base_lon = 80.2707
    
    highway_coords = []
    service_coords = []
    
    for i in range(num_points):
        t = i / float(num_points - 1)
        lat = base_lat + (t * 0.030) + 0.002 * math.sin(t * math.pi * 2.0)
        lon = base_lon + (t * 0.030) + 0.003 * math.sin(t * math.pi * 1.5)
        
        if i == 0:
            dlat, dlon = 0.030, 0.030
        else:
            dlat = lat - highway_coords[-1][0]
            dlon = lon - highway_coords[-1][1]
            
        norm = math.sqrt(dlat**2 + dlon**2)
        n_lat = -dlon / norm
        n_lon = dlat / norm
        
        offset_m = 12.4
        offset_deg = offset_m / 111000.0
        
        service_lat = lat + n_lat * offset_deg
        service_lon = lon + n_lon * offset_deg
        
        highway_coords.append((lat, lon))
        service_coords.append((service_lat, service_lon))
        
    return highway_coords, service_coords

def generate_synthetic_trajectory(tier="hard", road_choice="switch"):
    """
    Generates ground truth and noisy trajectory for simulation supporting all demo scenarios:
    - clean, moderate, hard (35s outage), missing_points, spoofing, bias, adversarial.
    """
    highway_coords, service_coords = generate_road_geometry()
    num_points = 100
    points = []
    
    last_known_pos = None
    
    for i in range(num_points):
        t = i / float(num_points - 1)
        timestamp = i * 1.0
        
        if road_choice == "highway":
            true_road = "highway"
            idx = int(t * (len(highway_coords) - 1))
            true_lat, true_lon = highway_coords[idx]
            speed = 88.0 + np.random.normal(0, 2.5)
        elif road_choice == "service":
            true_road = "service_road"
            idx = int(t * (len(service_coords) - 1))
            true_lat, true_lon = service_coords[idx]
            speed = 42.0 + np.random.normal(0, 2.0)
        else:
            if t < 0.45:
                true_road = "highway"
                idx = int(t * (len(highway_coords) - 1))
                true_lat, true_lon = highway_coords[idx]
                speed = 85.0 + np.random.normal(0, 3.0)
            else:
                true_road = "service_road"
                idx = int(t * (len(service_coords) - 1))
                true_lat, true_lon = service_coords[idx]
                speed = 40.0 + np.random.normal(0, 2.0)
                
        if i == 0:
            heading_deg = 45.0
        else:
            prev_lat, prev_lon = points[-1]["true_lat"], points[-1]["true_lon"]
            heading_rad = math.atan2(true_lon - prev_lon, true_lat - prev_lat)
            heading_deg = (math.degrees(heading_rad) + 360) % 360
            
        # Scenario Noise Configurations
        if tier == "clean":
            jitter_std_m = 2.0
        elif tier in ["moderate", "bias"]:
            jitter_std_m = 10.0
        elif tier == "adversarial":
            jitter_std_m = 16.0
        else:
            jitter_std_m = 18.0
            
        jitter_lat = np.random.normal(0, jitter_std_m / 111000.0)
        jitter_lon = np.random.normal(0, jitter_std_m / 111000.0)
        
        noisy_lat = true_lat + jitter_lat
        noisy_lon = true_lon + jitter_lon
        
        # Scenario Specific Modifications
        is_outage = False
        
        if tier == "bias" and 20 <= i <= 45:
            noisy_lat += 14.5 / 111000.0
            noisy_lon += 14.5 / 111000.0
            
        elif tier == "missing_points" and (15 <= i <= 25 or 50 <= i <= 60):
            is_outage = True
            noisy_lat, noisy_lon = None, None
            
        elif tier == "spoofing" and 35 <= i <= 42:
            noisy_lat += 55.0 / 111000.0
            noisy_lon += 55.0 / 111000.0
            
        elif tier == "hard" and 50 <= i <= 85: # 35-second Outage
            is_outage = True
            noisy_lat, noisy_lon = None, None
            
        elif tier == "adversarial": # Combined Adversarial Test Scenario
            if 15 <= i <= 28: # 15m Multipath Bias
                noisy_lat += 14.0 / 111000.0
                noisy_lon += 14.0 / 111000.0
            elif 32 <= i <= 36: # Spoof Jump
                noisy_lat += 48.0 / 111000.0
                noisy_lon += 48.0 / 111000.0
            elif 50 <= i <= 85: # 35-second Outage
                is_outage = True
                noisy_lat, noisy_lon = None, None

        # Dead Reckoning position calculation during outage
        dead_reckoning_pos = None
        if is_outage:
            if last_known_pos is not None:
                dt = 1.0
                v_ms = (speed * 1000.0) / 3600.0
                dist_m = v_ms * dt
                rad = math.radians(heading_deg)
                dr_lat = last_known_pos[0] + (dist_m * math.cos(rad)) / 111000.0
                dr_lon = last_known_pos[1] + (dist_m * math.sin(rad)) / 111000.0
                dead_reckoning_pos = (dr_lat, dr_lon)
                last_known_pos = dead_reckoning_pos
        else:
            if noisy_lat is not None:
                last_known_pos = (noisy_lat, noisy_lon)
            
        gnss_error_m = round(math.sqrt((jitter_lat*111000)**2 + (jitter_lon*111000)**2), 2) if not is_outage else 0.0

        points.append({
            "step": i,
            "timestamp": timestamp,
            "true_lat": true_lat,
            "true_lon": true_lon,
            "noisy_lat": noisy_lat,
            "noisy_lon": noisy_lon,
            "dr_lat": dead_reckoning_pos[0] if dead_reckoning_pos else None,
            "dr_lon": dead_reckoning_pos[1] if dead_reckoning_pos else None,
            "speed": max(0.0, round(speed, 1)),
            "heading": round(heading_deg, 1),
            "gnss_error_m": gnss_error_m,
            "true_road": true_road,
            "is_outage": is_outage
        })
        
    return highway_coords, service_coords, points
