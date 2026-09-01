import os
import math
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def generate_road_geometry():
    num_points = 120
    base_lat = 13.0827
    base_lon = 80.2707
    highway = []
    service = []
    for i in range(num_points):
        t = i / float(num_points - 1)
        lat = base_lat + (t * 0.030) + 0.002 * math.sin(t * math.pi * 2.0)
        lon = base_lon + (t * 0.030) + 0.003 * math.sin(t * math.pi * 1.5)
        highway.append((lat, lon))
        service.append((lat - (12.4 / 111000.0), lon + (12.4 / 111000.0)))
    return highway, service

def min_distance_to_road(lat, lon, road_coords):
    min_d = 999999.0
    for rlat, rlon in road_coords:
        d = math.sqrt(((lat - rlat) * 111000.0) ** 2 + ((lon - rlon) * 111000.0) ** 2)
        if d < min_d:
            min_d = d
    return min_d

def generate_training_dataset(num_samples=5000, seed=42):
    np.random.seed(seed)
    highway, service = generate_road_geometry()
    
    X = []
    y = []
    
    scenarios = ["clean", "moderate", "hard", "bias"]
    
    for i in range(num_samples):
        scen = scenarios[i % len(scenarios)]
        true_label = 0 if (i % 2 == 0) else 1 # 0: highway, 1: service_road
        
        idx = np.random.randint(0, len(highway))
        tlat, tlon = highway[idx] if true_label == 0 else service[idx]
        
        speed = np.random.uniform(70, 110) if true_label == 0 else np.random.uniform(25, 55)
        heading = 45.0 + np.random.normal(0, 3.0)
        
        # Add noise based on scenario
        if scen == "clean":
            noise_lat = np.random.normal(0, 2.0 / 111000.0)
            noise_lon = np.random.normal(0, 2.0 / 111000.0)
        elif scen == "moderate":
            noise_lat = np.random.normal(0, 8.0 / 111000.0)
            noise_lon = np.random.normal(0, 8.0 / 111000.0)
        elif scen == "hard":
            noise_lat = np.random.normal(0, 18.0 / 111000.0)
            noise_lon = np.random.normal(0, 18.0 / 111000.0)
        elif scen == "bias":
            # 14.5m bias offset towards service road
            noise_lat = (14.5 / 111000.0) + np.random.normal(0, 4.0 / 111000.0)
            noise_lon = (14.5 / 111000.0) + np.random.normal(0, 4.0 / 111000.0)
            
        nlat = tlat + noise_lat
        nlon = tlon + noise_lon
        
        d_hw = min_distance_to_road(nlat, nlon, highway)
        d_srv = min_distance_to_road(nlat, nlon, service)
        dist_diff = d_srv - d_hw
        heading_diff = abs((heading - 45.0 + 180) % 360 - 180)
        
        # Feature Vector: [d_hw, d_srv, dist_diff, speed, heading, heading_diff]
        X.append([d_hw, d_srv, dist_diff, speed, heading, heading_diff])
        y.append(true_label)
        
    return np.array(X), np.array(y)

def train_and_save_model():
    print("==================================================")
    print("TRAINING REAL SCIKIT-LEARN RANDOM FOREST MODEL")
    print("==================================================")
    
    X, y = generate_training_dataset(num_samples=5000, seed=42)
    
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Dataset Size: {len(X)} samples (Train: {len(X_train)}, Test: {len(X_test)})")
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    print(f"F1-Score : {f1 * 100:.2f}%")
    print(f"Confusion Matrix:\n{cm}")
    
    out_dir = os.path.join(os.path.dirname(__file__), "app", "models")
    os.makedirs(out_dir, exist_ok=True)
    model_path = os.path.join(out_dir, "rf_model.joblib")
    
    joblib.dump(rf, model_path)
    print(f"\n[OK] Saved Random Forest model to: {model_path}")
    return model_path

if __name__ == "__main__":
    train_and_save_model()
