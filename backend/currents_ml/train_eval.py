import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

from data_generator import generate_oscar_dataset
from feature_engineering import build_features

def run_training_and_eval():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "data", "oscar_surface_currents.csv")
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        data_path = generate_oscar_dataset()

    df = pd.read_csv(data_path)
    df_clean, X, y_u, y_v, feature_cols = build_features(df)

    # Chronological Split (70% Train, 15% Val, 15% Test)
    n_samples = len(df_clean)
    train_end = int(n_samples * 0.70)
    val_end = int(n_samples * 0.85)

    X_train, y_u_train, y_v_train = X.iloc[:train_end], y_u.iloc[:train_end], y_v.iloc[:train_end]
    X_test, y_u_test, y_v_test = X.iloc[val_end:], y_u.iloc[val_end:], y_v.iloc[val_end:]
    df_test = df_clean.iloc[val_end:].copy()

    # Train Random Forest Regressors
    rf_u = RandomForestRegressor(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1)
    rf_v = RandomForestRegressor(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1)

    rf_u.fit(X_train, y_u_train)
    rf_v.fit(X_train, y_v_train)

    # Predictions on Held-Out Test Set
    rf_u_pred = rf_u.predict(X_test)
    rf_v_pred = rf_v.predict(X_test)

    # Persistence Baseline Predictions (Lagged 1 step)
    pers_u_pred = X_test["u_lag1"].values
    pers_v_pred = X_test["v_lag1"].values

    # Calculate Evaluation Metrics
    mae_u_rf = float(mean_absolute_error(y_u_test, rf_u_pred))
    mae_v_rf = float(mean_absolute_error(y_v_test, rf_v_pred))
    rmse_u_rf = float(root_mean_squared_error(y_u_test, rf_u_pred))
    rmse_v_rf = float(root_mean_squared_error(y_v_test, rf_v_pred))

    mae_u_pers = float(mean_absolute_error(y_u_test, pers_u_pred))
    mae_v_pers = float(mean_absolute_error(y_v_test, pers_v_pred))
    rmse_u_pers = float(root_mean_squared_error(y_u_test, pers_u_pred))
    rmse_v_pers = float(root_mean_squared_error(y_v_test, pers_v_pred))

    # Derived speed metrics
    actual_speed = np.sqrt(y_u_test**2 + y_v_test**2)
    rf_speed = np.sqrt(rf_u_pred**2 + rf_v_pred**2)
    pers_speed = np.sqrt(pers_u_pred**2 + pers_v_pred**2)

    mae_speed_rf = float(mean_absolute_error(actual_speed, rf_speed))
    rmse_speed_rf = float(root_mean_squared_error(actual_speed, rf_speed))

    mae_speed_pers = float(mean_absolute_error(actual_speed, pers_speed))
    rmse_speed_pers = float(root_mean_squared_error(actual_speed, pers_speed))

    test_dates = df_test["timestamp"].astype(str)
    test_start = str(test_dates.min().split(" ")[0])
    test_end = str(test_dates.max().split(" ")[0])

    metrics = {
        "modelName": "Random Forest Ocean Current Regressor",
        "modelVersion": "v1.2.0",
        "dataset": "NASA PO.DAAC OSCAR Surface Currents Historical Final V2.0",
        "datasetVersion": "V2.0",
        "testPeriod": {
            "start": test_start,
            "end": test_end
        },
        "evaluatedRecords": len(X_test),
        "evaluationTimestamp": pd.Timestamp.now().isoformat(),
        "randomForestMetrics": {
            "mae_u": round(mae_u_rf, 4),
            "mae_v": round(mae_v_rf, 4),
            "rmse_u": round(rmse_u_rf, 4),
            "rmse_v": round(rmse_v_rf, 4),
            "mae_speed": round(mae_speed_rf, 4),
            "rmse_speed": round(rmse_speed_rf, 4)
        },
        "persistenceMetrics": {
            "mae_u": round(mae_u_pers, 4),
            "mae_v": round(mae_v_pers, 4),
            "rmse_u": round(rmse_u_pers, 4),
            "rmse_v": round(rmse_v_pers, 4),
            "mae_speed": round(mae_speed_pers, 4),
            "rmse_speed": round(rmse_speed_pers, 4)
        },
        "performanceGain": {
            "mae_u_diff": round(mae_u_pers - mae_u_rf, 4),
            "mae_v_diff": round(mae_v_pers - mae_v_rf, 4),
            "rmse_u_diff": round(rmse_u_pers - rmse_u_rf, 4),
            "rmse_v_diff": round(rmse_v_pers - rmse_v_rf, 4),
            "improvement_pct_u": round(((mae_u_pers - mae_u_rf) / mae_u_pers) * 100, 2),
            "improvement_pct_v": round(((mae_v_pers - mae_v_rf) / mae_v_pers) * 100, 2)
        },
        "status": "EVALUATED_READY"
    }

    # Save models and metrics
    joblib.dump(rf_u, os.path.join(models_dir, "rf_u_model.joblib"))
    joblib.dump(rf_v, os.path.join(models_dir, "rf_v_model.joblib"))
    joblib.dump(feature_cols, os.path.join(models_dir, "feature_cols.joblib"))

    metrics_path = os.path.join(models_dir, "evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print("--- MODEL TRAINING & EVALUATION COMPLETED ---")
    print(f"Evaluated Records: {len(X_test)}")
    print(f"Random Forest MAE (u): {mae_u_rf:.4f} m/s | Persistence MAE (u): {mae_u_pers:.4f} m/s")
    print(f"Random Forest MAE (v): {mae_v_rf:.4f} m/s | Persistence MAE (v): {mae_v_pers:.4f} m/s")
    print(f"Metrics saved to {metrics_path}")

    return metrics

if __name__ == "__main__":
    run_training_and_eval()
