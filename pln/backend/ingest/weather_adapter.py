from typing import Dict, Any
import requests
import pandas as pd

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def load_weather_features(lat: float, lon: float, horizon_h: int = 24) -> pd.DataFrame:
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m","relative_humidity_2m","pressure_msl","windspeed_10m","cloudcover"],
        "forecast_days": 2
    }
    r = requests.get(OPEN_METEO_URL, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    hourly = data.get("hourly", {})
    df = pd.DataFrame(hourly)
    if "time" in df:
        df["timestamp"] = pd.to_datetime(df["time"]) 
        df = df.drop(columns=["time"]) 
    return df.tail(horizon_h)
