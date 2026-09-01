import numpy as np
import math

class HMMMapMatcher:
    """Manual HMM & Random Forest Map-Matcher with 35s Dead Reckoning & Confidence Decay."""
    
    def __init__(self):
        self.states = ["highway", "service_road"]
        self.trans_matrix = np.array([
            [0.97, 0.03],
            [0.04, 0.96]
        ])
        self.start_prob = np.array([0.5, 0.5])

    def compute_rf_probabilities(self, d_hw_m, d_srv_m, speed_kmh):
        """Simulates Random Forest probability estimation based on distance differential & speed."""
        diff = d_srv_m - d_hw_m
        # Sigmoid probability curve
        z = diff / 6.0 + (speed_kmh - 60.0) / 25.0
        p_hw = 1.0 / (1.0 + math.exp(-z))
        p_hw = max(0.01, min(0.99, p_hw))
        p_srv = 1.0 - p_hw
        return round(p_hw, 4), round(p_srv, 4)

    def classify_trajectory(self, points, highway_coords, service_coords):
        N = len(points)
        if N == 0:
            return []

        emission_matrix = []
        features_list = []
        outage_counter = 0

        for i, pt in enumerate(points):
            is_outage = pt.get("is_outage", False)
            
            if is_outage or pt.get("noisy_lat") is None:
                outage_counter += 1
                # Dead reckoning position or last known
                lat = pt.get("dr_lat") or pt.get("true_lat")
                lon = pt.get("dr_lon") or pt.get("true_lon")
                
                min_d_hw = min([math.sqrt((lat - hlat)**2 + (lon - hlon)**2) * 111000.0 for hlat, hlon in highway_coords])
                min_d_srv = min([math.sqrt((lat - slat)**2 + (lon - slon)**2) * 111000.0 for slat, slon in service_coords])
                
                p_hw, p_srv = self.compute_rf_probabilities(min_d_hw, min_d_srv, pt.get("speed", 60.0))
                emission_matrix.append(np.array([0.5, 0.5]))
                
                features_list.append({
                    "d_highway_m": round(min_d_hw, 2),
                    "d_service_m": round(min_d_srv, 2),
                    "dist_diff_m": round(min_d_srv - min_d_hw, 2),
                    "speed": pt.get("speed", 60.0),
                    "heading": pt.get("heading", 45.0),
                    "is_outage": True,
                    "outage_seconds": outage_counter,
                    "p_highway": p_hw,
                    "p_service": p_srv
                })
            else:
                outage_counter = 0
                nlat, nlon = pt["noisy_lat"], pt["noisy_lon"]
                
                min_d_hw = min([math.sqrt((nlat - hlat)**2 + (nlon - hlon)**2) * 111000.0 for hlat, hlon in highway_coords])
                min_d_srv = min([math.sqrt((nlat - slat)**2 + (nlon - slon)**2) * 111000.0 for slat, slon in service_coords])
                
                p_hw, p_srv = self.compute_rf_probabilities(min_d_hw, min_d_srv, pt.get("speed", 60.0))
                emission_matrix.append(np.array([p_hw, p_srv]))
                
                features_list.append({
                    "d_highway_m": round(min_d_hw, 2),
                    "d_service_m": round(min_d_srv, 2),
                    "dist_diff_m": round(min_d_srv - min_d_hw, 2),
                    "speed": pt.get("speed", 60.0),
                    "heading": pt.get("heading", 45.0),
                    "is_outage": False,
                    "outage_seconds": 0,
                    "p_highway": p_hw,
                    "p_service": p_srv
                })

        # Viterbi Algorithm
        viterbi = np.zeros((N, 2))
        backpointer = np.zeros((N, 2), dtype=int)
        viterbi[0] = np.log(self.start_prob + 1e-12) + np.log(emission_matrix[0] + 1e-12)
        
        for t in range(1, N):
            for s in range(2):
                trans_probs = viterbi[t-1] + np.log(self.trans_matrix[:, s] + 1e-12)
                backpointer[t, s] = np.argmax(trans_probs)
                viterbi[t, s] = np.max(trans_probs) + np.log(emission_matrix[t][s] + 1e-12)

        best_path = np.zeros(N, dtype=int)
        best_path[-1] = np.argmax(viterbi[-1])
        for t in range(N - 2, -1, -1):
            best_path[t] = backpointer[t + 1, best_path[t + 1]]

        # Forward-Backward
        forward = np.zeros((N, 2))
        forward[0] = self.start_prob * emission_matrix[0]
        forward[0] /= np.sum(forward[0])
        
        for t in range(1, N):
            forward[t] = (forward[t-1] @ self.trans_matrix) * emission_matrix[t]
            forward[t] /= (np.sum(forward[t]) + 1e-12)

        backward = np.zeros((N, 2))
        backward[-1] = np.array([1.0, 1.0])
        for t in range(N - 2, -1, -1):
            backward[t] = (self.trans_matrix @ (backward[t+1] * emission_matrix[t+1]))
            backward[t] /= (np.sum(backward[t]) + 1e-12)

        posterior = forward * backward
        posterior /= (np.sum(posterior, axis=1, keepdims=True) + 1e-12)

        results = []
        outage_decay_factor = 1.0

        for t in range(N):
            state_idx = best_path[t]
            raw_conf = float(np.max(posterior[t]))
            is_outage = features_list[t]["is_outage"]
            
            # Progressively decay confidence during 35s GNSS outage (e.g., 95% -> 88% -> 79% -> 68% -> 55%)
            if is_outage:
                sec = features_list[t]["outage_seconds"]
                confidence = max(0.40, round(0.95 * math.exp(-0.015 * sec), 4))
                uncertainty_radius_m = round(8.0 + 1.2 * sec, 1)
                mode = "DEAD RECKONING (GPS OUTAGE)"
            else:
                confidence = round(max(0.75, raw_conf), 4)
                uncertainty_radius_m = round(features_list[t]["d_highway_m"] * 0.4 + 3.0, 1)
                mode = "HMM + RF MATCHED"

            results.append({
                "step": points[t]["step"],
                "timestamp": points[t]["timestamp"],
                "classified_road": self.states[state_idx],
                "confidence": confidence,
                "uncertainty_radius_m": uncertainty_radius_m,
                "mode": mode,
                "features": features_list[t],
                "noisy_lat": points[t]["noisy_lat"],
                "noisy_lon": points[t]["noisy_lon"],
                "dr_lat": points[t].get("dr_lat"),
                "dr_lon": points[t].get("dr_lon"),
                "true_road": points[t]["true_road"],
                "is_outage": is_outage
            })

        return results
