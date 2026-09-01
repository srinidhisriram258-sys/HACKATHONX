import math
import numpy as np

class IMUKalmanFilter:
    """
    Lightweight 2D Extended Kalman Filter (EKF) fusing GNSS position measurements 
    and synthetic IMU telemetry (accel_x, accel_y, yaw_rate) for robust localization.
    """
    
    def __init__(self):
        # State vector x = [lat, lon, v, heading_rad]
        self.state = None
        self.P = np.diag([1e-5, 1e-5, 2.0, 0.1]) # Covariance matrix
        self.Q = np.diag([1e-6, 1e-6, 0.5, 0.05]) # Process noise covariance
        self.R_gnss = np.diag([(15.0 / 111000.0)**2, (15.0 / 111000.0)**2]) # Measurement noise covariance
        
    def reset(self, initial_lat, initial_lon, initial_speed_kmh, initial_heading_deg):
        v_ms = (initial_speed_kmh * 1000.0) / 3600.0
        heading_rad = math.radians(initial_heading_deg)
        self.state = np.array([initial_lat, initial_lon, v_ms, heading_rad])
        self.P = np.diag([1e-5, 1e-5, 1.0, 0.05])

    def predict(self, accel_x, yaw_rate, dt=1.0):
        """IMU-assisted state prediction step."""
        if self.state is None:
            return
            
        lat, lon, v, heading = self.state
        
        # Kinematic state transition
        v_new = max(0.0, v + accel_x * dt)
        heading_new = (heading + yaw_rate * dt + math.pi * 2) % (math.pi * 2)
        
        avg_v = (v + v_new) / 2.0
        avg_heading = (heading + heading_new) / 2.0
        
        dist_m = avg_v * dt
        dlat = (dist_m * math.cos(avg_heading)) / 111000.0
        dlon = (dist_m * math.sin(avg_heading)) / 111000.0
        
        self.state = np.array([lat + dlat, lon + dlon, v_new, heading_new])
        self.P = self.P + self.Q

    def update_gnss(self, gnss_lat, gnss_lon):
        """Kalman update step when GNSS measurement is available."""
        if self.state is None or gnss_lat is None or gnss_lon is None:
            return
            
        H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ])
        
        z = np.array([gnss_lat, gnss_lon])
        y = z - H @ self.state # Measurement residual
        
        S = H @ self.P @ H.T + self.R_gnss
        K = self.P @ H.T @ np.linalg.inv(S) # Kalman gain
        
        self.state = self.state + K @ y
        self.P = (np.eye(4) - K @ H) @ self.P

    def get_estimation(self):
        if self.state is None:
            return None
        lat, lon, v_ms, heading_rad = self.state
        speed_kmh = (v_ms * 3600.0) / 1000.0
        heading_deg = (math.degrees(heading_rad) + 360.0) % 360.0
        return {
            "kalman_lat": round(lat, 6),
            "kalman_lon": round(lon, 6),
            "kalman_speed_kmh": round(speed_kmh, 1),
            "kalman_heading_deg": round(heading_deg, 1),
            "cov_trace": round(float(np.trace(self.P)), 6)
        }

def generate_synthetic_imu(speed_kmh, heading_deg, prev_speed_kmh=None, prev_heading_deg=None, dt=1.0):
    """Generates synthetic IMU accelerations and yaw rate."""
    v_ms = (speed_kmh * 1000.0) / 3600.0
    prev_v_ms = ((prev_speed_kmh if prev_speed_kmh is not None else speed_kmh) * 1000.0) / 3600.0
    
    accel_x = (v_ms - prev_v_ms) / dt + np.random.normal(0, 0.05) # Longitudinal accel m/s^2
    
    dh = 0.0
    if prev_heading_deg is not None:
        dh = (heading_deg - prev_heading_deg + 180) % 360 - 180
    yaw_rate = math.radians(dh) / dt + np.random.normal(0, 0.01) # Yaw rate rad/s
    accel_y = v_ms * yaw_rate + np.random.normal(0, 0.02) # Lateral accel m/s^2
    
    return {
        "accel_x": round(accel_x, 3),
        "accel_y": round(accel_y, 3),
        "yaw_rate": round(yaw_rate, 4),
        "imu_status": "ACTIVE"
    }
