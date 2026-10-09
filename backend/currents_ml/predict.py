import os
import sys
import json
import math
import argparse
import numpy as np
import pandas as pd
import joblib

def calculate_direction(u, v):
    """Oceanographic direction convention (degrees clockwise from North)"""
    dir_rad = math.atan2(u, v)
    return round(float((math.degrees(dir_rad) + 360) % 360), 2)

def run_inference(lat, lon, date_str=None):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, "models")
    data_path = os.path.join(script_dir, "data", "oscar_surface_currents.csv")

    rf_u_path = os.path.join(models_dir, "rf_u_model.joblib")
    rf_v_path = os.path.join(models_dir, "rf_v_model.joblib")
    feature_cols_path = os.path.join(models_dir, "feature_cols.joblib")

    if not os.path.exists(rf_u_path) or not os.path.exists(rf_v_path):
        return {
            "success": False,
            "error": "Trained Random Forest models not found. Please run training pipeline.",
            "status": "UNAVAILABLE"
        }

    rf_u = joblib.load(rf_u_path)
    rf_v = joblib.load(rf_v_path)
    feature_cols = joblib.load(feature_cols_path)

    df = pd.read_csv(data_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Find nearest grid point
    df["lat_diff"] = (df["latitude"] - lat).abs()
    df["lon_diff"] = (df["longitude"] - lon).abs()
    df["dist"] = df["lat_diff"] + df["lon_diff"]
    
    nearest = df.sort_values("dist").iloc[0]
    near_lat = nearest["latitude"]
    near_lon = nearest["longitude"]

    sub_df = df[(df["latitude"] == near_lat) & (df["longitude"] == near_lon)].sort_values("timestamp")
    
    if len(sub_df) < 3:
        return {
            "success": False,
            "error": f"Insufficient historical records for location ({lat}, {lon})",
            "status": "NO_DATA"
        }

    latest = sub_df.iloc[-1]
    prev_1 = sub_df.iloc[-2]
    prev_2 = sub_df.iloc[-3]

    u_obs = float(latest["u"])
    v_obs = float(latest["v"])
    obs_speed = round(float(np.sqrt(u_obs**2 + v_obs**2)), 4)
    obs_dir = calculate_direction(u_obs, v_obs)

    target_date = pd.to_datetime(date_str) if date_str else (latest["timestamp"] + pd.Timedelta(days=1))
    day_of_year = target_date.dayofyear

    u_lag1 = u_obs
    v_lag1 = v_obs
    u_lag2 = float(prev_1["u"])
    v_lag2 = float(prev_1["v"])

    rolling_u = float(np.mean([u_obs, u_lag2, float(prev_2["u"])]))
    rolling_v = float(np.mean([v_obs, v_lag2, float(prev_2["v"])]))

    feat_dict = {
        "latitude": near_lat,
        "longitude": near_lon,
        "day_of_year": day_of_year,
        "u_lag1": u_lag1,
        "v_lag1": v_lag1,
        "u_lag2": u_lag2,
        "v_lag2": v_lag2,
        "rolling_u_3": rolling_u,
        "rolling_v_3": rolling_v
    }

    X_in = pd.DataFrame([feat_dict])[feature_cols]

    pred_u = round(float(rf_u.predict(X_in)[0]), 4)
    pred_v = round(float(rf_v.predict(X_in)[0]), 4)
    pred_speed = round(float(np.sqrt(pred_u**2 + pred_v**2)), 4)
    pred_dir = calculate_direction(pred_u, pred_v)

    # Persistence Baseline (Lag 1 value)
    pers_u = round(u_lag1, 4)
    pers_v = round(v_lag1, 4)
    pers_speed = round(float(np.sqrt(pers_u**2 + pers_v**2)), 4)
    pers_dir = calculate_direction(pers_u, pers_v)

    return {
        "success": True,
        "status": "PREDICTED",
        "coordinates": {
            "latitude": near_lat,
            "longitude": near_lon,
            "requestedLat": lat,
            "requestedLon": lon
        },
        "targetTimestamp": target_date.strftime("%Y-%m-%d"),
        "inputTimestamp": latest["timestamp"].strftime("%Y-%m-%d"),
        "modelInfo": {
            "name": "Random Forest Ocean Current Regressor",
            "version": "v1.2.0",
            "dataSource": "NASA PO.DAAC OSCAR Surface Currents V2.0"
        },
        "prediction": {
            "u": pred_u,
            "v": pred_v,
            "speed": pred_speed,
            "direction": pred_dir,
            "unit": "m/s"
        },
        "persistenceBaseline": {
            "u": pers_u,
            "v": pers_v,
            "speed": pers_speed,
            "direction": pers_dir,
            "unit": "m/s"
        },
        "latestObservation": {
            "u": u_obs,
            "v": v_obs,
            "speed": obs_speed,
            "direction": obs_dir,
            "timestamp": latest["timestamp"].strftime("%Y-%m-%d"),
            "unit": "m/s"
        },
        "absoluteErrors": {
            "rf_u_error": round(abs(u_obs - pred_u), 4),
            "rf_v_error": round(abs(v_obs - pred_v), 4),
            "pers_u_error": round(abs(u_obs - pers_u), 4),
            "pers_v_error": round(abs(v_obs - pers_v), 4)
        }
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, default=16.98)
    parser.add_argument("--lon", type=float, default=82.24)
    parser.add_argument("--date", type=str, default=None)
    args = parser.parse_args()

    result = run_inference(args.lat, args.lon, args.date)
    print(json.dumps(result, indent=2))
