from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random

app = FastAPI(title="PLN AI Service", version="0.1.0")

class PredictRequest(BaseModel):
    eventId: str
    features: Dict[str, float] = {}

class PredictResponse(BaseModel):
    eventId: str
    p_true: float
    confidence: float = 0.6
    model_version: str = "baseline-0.1"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CalibrateRequest(BaseModel):
    y_hat: List[float]
    y_true_hist: List[int]

class UpdateProbabilitiesRequest(BaseModel):
    eventIds: Optional[List[str]] = None

class VerifyRequest(BaseModel):
    eventId: str
    outcome: int

# In-memory stores for local prototype
EVENT_PROBS: Dict[str, PredictResponse] = {}
EVENT_STATUS: Dict[str, Dict[str, Any]] = {}


def _compute_probability(features: Dict[str, float]) -> float:
    # very simple baseline: sigmoid of weighted sum
    score = sum(features.values()) / (len(features) or 1)
    # clamp and add a small random component to avoid 0/1
    base = 1 / (1 + pow(2.71828, -score))
    jitter = random.uniform(-0.05, 0.05)
    p = max(0.01, min(0.99, base + jitter))
    return p

@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "model_versions": {"weather": "baseline-0.1", "crypto": "lstm-0.1"},
        "events_cached": len(EVENT_PROBS)
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    p = _compute_probability(req.features)
    resp = PredictResponse(eventId=req.eventId, p_true=p)
    EVENT_PROBS[req.eventId] = resp
    return resp

@app.post("/calibrate")
def calibrate(req: CalibrateRequest) -> Dict[str, Any]:
    # placeholder: return identity calibration
    return {"method": "isotonic", "status": "ok", "params": {"a": 1.0, "b": 0.0}}

@app.post("/update_probabilities")
def update_probabilities(req: UpdateProbabilitiesRequest, bg: BackgroundTasks) -> Dict[str, Any]:
    # for demo, update all cached events by decaying or nudging probability
    updated = []
    ids = req.eventIds or list(EVENT_PROBS.keys())
    for eid in ids:
        current = EVENT_PROBS.get(eid)
        if not current:
            # create a default one if missing
            current = PredictResponse(eventId=eid, p_true=random.uniform(0.2, 0.8))
        # nudge towards 0.5 slowly
        delta = (0.5 - current.p_true) * 0.1
        new_p = max(0.01, min(0.99, current.p_true + delta))
        current.p_true = new_p
        current.timestamp = datetime.utcnow()
        EVENT_PROBS[eid] = current
        updated.append({"eventId": eid, "p_true": new_p})
    return {"updated": updated, "count": len(updated)}

@app.post("/verify")
def verify(req: VerifyRequest) -> Dict[str, Any]:
    # record outcome; in real system compute accuracy and update store
    EVENT_STATUS[req.eventId] = {
        "outcome": req.outcome,
        "verified_at": datetime.utcnow().isoformat()
    }
    return {"status": "ok"}

@app.post("/score")
def score() -> Dict[str, Any]:
    # placeholder: return static scores
    return {"leaderboard": [{"user": "demo", "roi": 0.12, "accuracy": 0.61}]}
