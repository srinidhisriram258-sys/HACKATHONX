import math
import numpy as np

def generate_road_geometry():
    """Generates parallel highway (NH-48 Chennai) and service road polylines with 12.4m separation."""
    num_points = 120
    # Chennai Urban Highway Corridor (NH-48)
    base_lat = 13.0827
    base_lon = 80.2707
    
    highway_coords = []
    service_coords = []
    
    for i in range(num_points):
        t = i / float(num_points - 1)
        # S-curve highway corridor spanning ~3.5 km
        lat = base_lat + (t * 0.030) + 0.002 * math.sin(t * math.pi * 2.0)
        lon = base_lon + (t * 0.030) + 0.003 * math.sin(t * math.pi * 1.5)
        
        # Tangent vector for heading
        if i == 0:
            dlat, dlon = 0.030, 0.030
        else:
            dlat = lat - highway_coords[-1][0]
            dlon = lon - highway_coords[-1][1]
            
        norm = math.sqrt(dlat**2 + dlon**2)
        n_lat = -dlon / norm
        n_lon = dlat / norm
        
        # Road separation = 12.4 meters normally, converging to 4m at interchange (t=0.45..0.55)
        if 0.40 <= t <= 0.60:
            offset_m = 4.0 + 8.4 * (math.cos((t - 0.5) / 0.1 * math.pi) ** 2)
        else:
            offset_m = 12.4
            
        offset_deg = offset_m / 111000.0
        
        service_lat = lat + n_lat * offset_deg
        service_lon = lon + n_lon * offset_deg
        
        highway_coords.append((lat, lon))
        service_coords.append((service_lat, service_lon))
        
    return highway_coords, service_coords

def generate_synthetic_trajectory(tier="hard", road_choice="switch"):
    """Generates ground truth and noisy trajectory for simulation, including 35s GNSS outage."""
    highway_coords, service_coords = generate_road_geometry()
    num_points = 100
    points = []
    
    last_known_pos = None
    
    for i in range(num_points):
        t = i / float(num_points - 1)
        timestamp = i * 1.0 # 1 Hz
        
        # Ground truth route assignment
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
        else: # switch at t=0.45
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
                
        # Heading calculation
        if i == 0:
            heading_deg = 45.0
        else:
            prev_lat, prev_lon = points[-1]["true_lat"], points[-1]["true_lon"]
            heading_rad = math.atan2(true_lon - prev_lon, true_lat - prev_lat)
            heading_deg = (math.degrees(heading_rad) + 360) % 360
            
        # Noise injection
        jitter_std_m = 3.0 if tier == "clean" else (12.0 if tier == "moderate" else 20.0)
        jitter_lat = np.random.normal(0, jitter_std_m / 111000.0)
        jitter_lon = np.random.normal(0, jitter_std_m / 111000.0)
        
        noisy_lat = true_lat + jitter_lat
        noisy_lon = true_lon + jitter_lon
        
        # 15m Multipath bias during i in [25, 40]
        if tier in ["moderate", "hard"] and 25 <= i <= 40:
            noisy_lat += 15.0 / 111000.0
            noisy_lon += 15.0 / 111000.0
            
        # 35-second GNSS Outage during i in [50, 85] (35 points at 1Hz)
        is_outage = False
        dead_reckoning_pos = None
        
        if tier == "hard" and 50 <= i <= 85:
            is_outage = True
            noisy_lat = None
            noisy_lon = None
            
            # Dead Reckoning calculation: last_pos + speed * heading * dt
            if last_known_pos is not None:
                dt = 1.0 # 1 second
                v_ms = (speed * 1000.0) / 3600.0
                dist_m = v_ms * dt
                rad = math.radians(heading_deg)
                dr_lat = last_known_pos[0] + (dist_m * math.cos(rad)) / 111000.0
                dr_lon = last_known_pos[1] + (dist_m * math.sin(rad)) / 111000.0
                dead_reckoning_pos = (dr_lat, dr_lon)
                last_known_pos = dead_reckoning_pos
        else:
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
