from typing import Dict, Any
import requests
import pandas as pd

COINGECKO_URL = "https://api.coingecko.com/api/v3"


def load_crypto_features(symbol: str = "bitcoin", horizon_m: int = 60) -> pd.DataFrame:
    # fetch market chart (prices for 1 day)
    r = requests.get(f"{COINGECKO_URL}/coins/{symbol}/market_chart", params={"vs_currency": "usd", "days": 1}, timeout=20)
    r.raise_for_status()
    data = r.json()
    prices = data.get("prices", [])
    df = pd.DataFrame(prices, columns=["timestamp_ms","price"]) if prices else pd.DataFrame(columns=["timestamp_ms","price"]) 
    if not df.empty:
        df["timestamp"] = pd.to_datetime(df["timestamp_ms"], unit="ms")
        df = df.drop(columns=["timestamp_ms"]) 
        df["return"] = df["price"].pct_change().fillna(0.0)
        df["volatility"] = df["return"].rolling(10).std().fillna(0.0)
    return df.tail(max(1, horizon_m))
