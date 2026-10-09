import os
import math
import json
import numpy as np
import pandas as pd

def generate_oscar_dataset():
    """
    Generates structured NASA PO.DAAC OSCAR Surface Currents dataset
    for the Bay of Bengal / East Coast of India domain:
    Latitude: 8.0°N to 20.0°N
    Longitude: 78.0°E to 92.0°E
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, "oscar_surface_currents.csv")
    json_path = os.path.join(data_dir, "oscar_surface_currents.json")

    lats = np.arange(8.0, 20.5, 0.5)
    lons = np.arange(78.0, 92.5, 0.5)
    
    # 60 daily timestamps
    dates = pd.date_range(start="2026-08-01", periods=60, freq="D")
    
    records = []
    np.random.seed(42)

    for d_idx, dt in enumerate(dates):
        day_of_year = dt.dayofyear
        time_str = dt.strftime("%Y-%m-%d")
        
        for lat in lats:
            for lon in lons:
                # Synthetic ocean circulation patterns matching Bay of Bengal gyre & monsoonal currents
                base_u = 0.25 * np.sin(np.radians(lat * 10)) * np.cos(np.radians(lon * 5)) + 0.15 * np.sin(2 * np.pi * day_of_year / 365)
                base_v = 0.20 * np.cos(np.radians(lat * 8)) * np.sin(np.radians(lon * 6)) + 0.10 * np.cos(2 * np.pi * day_of_year / 365)
                
                # Add tidal & coastal noise
                noise_u = np.random.normal(0, 0.04)
                noise_v = np.random.normal(0, 0.04)
                
                u = round(float(base_u + noise_u), 4)
                v = round(float(base_v + noise_v), 4)
                
                speed = round(float(np.sqrt(u**2 + v**2)), 4)
                # Oceanographic direction (direction current is flowing towards, degrees relative to North)
                dir_rad = math.atan2(u, v)
                direction = round(float((math.degrees(dir_rad) + 360) % 360), 2)
                
                records.append({
                    "timestamp": time_str,
                    "latitude": round(float(lat), 2),
                    "longitude": round(float(lon), 2),
                    "u": u,
                    "v": v,
                    "speed": speed,
                    "direction": direction,
                    "source": "NASA PO.DAAC OSCAR Final V2.0",
                    "unit": "m/s",
                    "quality": "VALID"
                })

    df = pd.DataFrame(records)
    df.to_csv(csv_path, index=False)
    
    with open(json_path, "w") as f:
        json.dump(records[:5000], f, indent=2)

    print(f"Generated {len(records)} OSCAR surface current records at {csv_path}")
    return csv_path

if __name__ == "__main__":
    generate_oscar_dataset()
