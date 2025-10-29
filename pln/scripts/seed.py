import requests

API = 'http://localhost:8000'

EXAMPLES = [
    {"id": "weather_delhi", "question": "Rain in Delhi tomorrow?", "p_true": 0.35},
    {"id": "crypto_btc_up", "question": "BTC up in next 5m?", "p_true": 0.55},
    {"id": "sports_match", "question": "Team A beats Team B?", "p_true": 0.48},
    {"id": "social_topic", "question": "Topic X trends today?", "p_true": 0.42},
    {"id": "econ_cpi", "question": "CPI surprise positive?", "p_true": 0.51},
]

for e in EXAMPLES:
    try:
        r = requests.post(f"{API}/api/markets", json={
            "question": e["question"],
            "outcomes": ["Yes","No"],
            "expiryTime": "2099-01-01T00:00:00Z"
        }, timeout=10)
        print('create', e['id'], r.status_code)
    except Exception as ex:
        print('error', e['id'], ex)
