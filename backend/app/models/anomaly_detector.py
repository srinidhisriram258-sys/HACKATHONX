import math

class GNSSAnomalyDetector:
    """
    Physical kinematic anomaly & spoofing detection module.
    Detects physically implausible position jumps, acceleration spikes, and abnormal offsets.
    """
    
    def __init__(self, max_speed_kmh=160.0, max_accel_ms2=8.0, max_jump_m=35.0):
        self.max_speed_kmh = max_speed_kmh
        self.max_accel_ms2 = max_accel_ms2
        self.max_jump_m = max_jump_m

    def detect_anomaly(self, current_pt, prev_pt=None):
        if current_pt.get("is_outage") or current_pt.get("noisy_lat") is None:
            return {
                "classification": "GNSS OUTAGE",
                "is_anomalous": False,
                "anomaly_score": 0.0,
                "reason": "GNSS Signal Lost (35s Outage)"
            }
            
        nlat, nlon = current_pt["noisy_lat"], current_pt["noisy_lon"]
        gnss_err = current_pt.get("gnss_error_m", 0.0)
        
        if prev_pt is None or prev_pt.get("noisy_lat") is None:
            return {
                "classification": "NORMAL" if gnss_err < 5.0 else "NOISY",
                "is_anomalous": False,
                "anomaly_score": 0.1,
                "reason": "Normal initial fix"
            }
            
        plat, plon = prev_pt["noisy_lat"], prev_pt["noisy_lon"]
        dt = max(0.1, current_pt.get("timestamp", 1.0) - prev_pt.get("timestamp", 0.0))
        
        # Calculate implied physical metrics
        dist_m = math.sqrt((nlat - plat)**2 + (nlon - plon)**2) * 111000.0
        implied_speed_kmh = (dist_m / dt) * 3.6
        
        prev_speed = prev_pt.get("speed", 60.0)
        curr_speed = current_pt.get("speed", 60.0)
        implied_accel = abs((curr_speed - prev_speed) / 3.6) / dt
        
        # Anomaly scoring rules
        is_speed_anomaly = implied_speed_kmh > self.max_speed_kmh
        is_jump_anomaly = dist_m > (self.max_jump_m + (curr_speed / 3.6) * dt * 1.8)
        is_accel_anomaly = implied_accel > self.max_accel_ms2
        
        anomaly_score = 0.0
        reasons = []
        
        if is_speed_anomaly:
            anomaly_score += 0.5
            reasons.append(f"Implied speed ({round(implied_speed_kmh, 1)} km/h) exceeds physical threshold ({self.max_speed_kmh} km/h)")
            
        if is_jump_anomaly:
            anomaly_score += 0.4
            reasons.append(f"Position jump ({round(dist_m, 1)} m) exceeds kinematic bound ({round(self.max_jump_m, 1)} m)")
            
        if is_accel_anomaly:
            anomaly_score += 0.3
            reasons.append(f"Acceleration spike ({round(implied_accel, 1)} m/s²) exceeds vehicle dynamics ({self.max_accel_ms2} m/s²)")
            
        anomaly_score = min(1.0, round(anomaly_score, 2))
        
        if anomaly_score >= 0.4:
            classification = "ANOMALOUS / POSSIBLE SPOOFING"
            is_anomalous = True
            reason_str = " | ".join(reasons)
        elif gnss_err >= 14.0 or abs(current_pt.get("noisy_lat", 0) - current_pt.get("true_lat", 0)) * 111000 > 12.0:
            classification = "BIAS"
            is_anomalous = False
            reason_str = "Sustained GNSS multipath bias offset"
        elif gnss_err >= 5.0:
            classification = "NOISY"
            is_anomalous = False
            reason_str = "Gaussian GNSS jitter"
        else:
            classification = "NORMAL"
            is_anomalous = False
            reason_str = "Clean GNSS fix"

        return {
            "classification": classification,
            "is_anomalous": is_anomalous,
            "anomaly_score": anomaly_score,
            "implied_speed_kmh": round(implied_speed_kmh, 1),
            "implied_accel_ms2": round(implied_accel, 1),
            "jump_distance_m": round(dist_m, 1),
            "reason": reason_str
        }
