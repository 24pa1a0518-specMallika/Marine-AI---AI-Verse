import pandas as pd
import numpy as np

def build_features(df):
    """
    Constructs spatial, temporal, and lagged ocean velocity features
    for predicting u (eastward) and v (northward) components.
    """
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(by=["latitude", "longitude", "timestamp"]).reset_index(drop=True)

    # Group by spatial point to construct temporal lags without cross-point contamination
    grouped = df.groupby(["latitude", "longitude"])
    
    df["u_lag1"] = grouped["u"].shift(1)
    df["v_lag1"] = grouped["v"].shift(1)
    df["u_lag2"] = grouped["u"].shift(2)
    df["v_lag2"] = grouped["v"].shift(2)
    
    df["rolling_u_3"] = grouped["u"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean())
    df["rolling_v_3"] = grouped["v"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean())
    
    df["day_of_year"] = df["timestamp"].dt.dayofyear

    # Drop initial NaN rows created by lagging
    df_clean = df.dropna(subset=["u_lag1", "v_lag1", "u_lag2", "v_lag2"]).reset_index(drop=True)

    feature_cols = [
        "latitude", "longitude", "day_of_year",
        "u_lag1", "v_lag1", "u_lag2", "v_lag2",
        "rolling_u_3", "rolling_v_3"
    ]

    X = df_clean[feature_cols]
    y_u = df_clean["u"]
    y_v = df_clean["v"]

    return df_clean, X, y_u, y_v, feature_cols
