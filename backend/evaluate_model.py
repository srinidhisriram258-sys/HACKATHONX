import json
from app.data_gen import generate_synthetic_trajectory
from app.models.hmm_model import HMMMapMatcher

def run_evaluation():
    print("==================================================")
    print("ROADTRACE AI — REAL MULTI-MODEL EVALUATION BENCHMARK")
    print("==================================================")
    
    matcher = HMMMapMatcher()
    tiers = ["clean", "moderate", "bias", "hard", "adversarial"]
    
    overall_results = {}
    
    for tier in tiers:
        hw, srv, points = generate_synthetic_trajectory(tier=tier, road_choice="switch")
        res = matcher.classify_trajectory(points, hw, srv)
        summary = res["accuracy_summary"]
        overall_results[tier] = summary
        
        print(f"\n--- SCENARIO TIER: {tier.upper()} ---")
        print(f"Nearest Road Baseline Acc : {summary['nearest_road_acc']}%")
        print(f"Random Forest Classifier Acc: {summary['random_forest_acc']}%")
        print(f"HMM Viterbi Temporal Acc  : {summary['hmm_viterbi_acc']}%")
        print(f"ROADTRACE Fusion Engine Acc: {summary['fusion_engine_acc']}%")
        print(f"Precision: {summary['precision']}% | Recall: {summary['recall']}% | F1: {summary['f1_score']}%")
        print(f"Confusion Matrix: {summary['confusion_matrix']}")

    print("\n==================================================")
    print("[OK] Real Multi-Model Benchmark Completed Successfully")
    print("==================================================")
    return overall_results

if __name__ == "__main__":
    run_evaluation()
