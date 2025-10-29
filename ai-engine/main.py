from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import numpy as np
import json
import os
from datetime import datetime
import uvicorn

app = FastAPI(title="FlashBet AI Odds Engine", version="1.0.0")

class MarketData(BaseModel):
    market_id: str
    question: str
    outcomes: List[str]
    current_bets: Dict[int, float]  # outcome_index -> total_amount
    historical_data: Optional[Dict] = None

class OddsResponse(BaseModel):
    market_id: str
    odds: Dict[int, float]  # outcome_index -> probability
    confidence: float
    timestamp: str

class OddsEngine:
    def __init__(self):
        self.historical_markets = {}
        self.load_historical_data()
    
    def load_historical_data(self):
        """Load historical market data for training"""
        if os.path.exists("historical_data.json"):
            with open("historical_data.json", "r") as f:
                self.historical_markets = json.load(f)
    
    def save_historical_data(self):
        """Save historical data for future training"""
        with open("historical_data.json", "w") as f:
            json.dump(self.historical_markets, f)
    
    def calculate_odds(self, market_data: MarketData) -> Dict[int, float]:
        """Calculate odds based on betting patterns and historical data"""
        num_outcomes = len(market_data.outcomes)
        
        if not market_data.current_bets:
            # Equal odds if no bets
            return {i: 1.0 / num_outcomes for i in range(num_outcomes)}
        
        total_pool = sum(market_data.current_bets.values())
        if total_pool == 0:
            return {i: 1.0 / num_outcomes for i in range(num_outcomes)}
        
        # Calculate implied probabilities from betting amounts
        implied_probs = {}
        for i in range(num_outcomes):
            bet_amount = market_data.current_bets.get(i, 0)
            # More bets on an outcome = higher probability
            implied_probs[i] = bet_amount / total_pool
        
        # Apply smoothing to avoid extreme odds
        smoothing_factor = 0.1
        smoothed_probs = {}
        
        for i in range(num_outcomes):
            base_prob = 1.0 / num_outcomes
            market_prob = implied_probs.get(i, 0)
            smoothed_probs[i] = (1 - smoothing_factor) * market_prob + smoothing_factor * base_prob
        
        # Normalize to ensure probabilities sum to 1
        total_prob = sum(smoothed_probs.values())
        if total_prob > 0:
            for i in smoothed_probs:
                smoothed_probs[i] /= total_prob
        
        return smoothed_probs
    
    def get_confidence_score(self, market_data: MarketData, odds: Dict[int, float]) -> float:
        """Calculate confidence score based on data quality and market activity"""
        total_bets = sum(market_data.current_bets.values())
        
        # Higher confidence with more betting activity
        activity_score = min(total_bets / 1000.0, 1.0)  # Normalize to 0-1
        
        # Higher confidence with more balanced odds (less extreme)
        odds_values = list(odds.values())
        odds_variance = np.var(odds_values)
        balance_score = 1.0 - min(odds_variance * 4, 1.0)  # Normalize to 0-1
        
        # Combine scores
        confidence = (activity_score * 0.6 + balance_score * 0.4)
        return max(0.1, min(confidence, 1.0))  # Clamp between 0.1 and 1.0

odds_engine = OddsEngine()

@app.get("/")
async def root():
    return {"message": "FlashBet AI Odds Engine", "status": "running"}

@app.post("/update_odds", response_model=OddsResponse)
async def update_odds(market_data: MarketData):
    """Calculate and return updated odds for a market"""
    try:
        odds = odds_engine.calculate_odds(market_data)
        confidence = odds_engine.get_confidence_score(market_data, odds)
        
        response = OddsResponse(
            market_id=market_data.market_id,
            odds=odds,
            confidence=confidence,
            timestamp=datetime.now().isoformat()
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating odds: {str(e)}")

@app.post("/record_outcome")
async def record_outcome(market_id: str, winning_outcome: int, final_odds: Dict[int, float]):
    """Record market outcome for future training"""
    try:
        odds_engine.historical_markets[market_id] = {
            "winning_outcome": winning_outcome,
            "final_odds": final_odds,
            "timestamp": datetime.now().isoformat()
        }
        odds_engine.save_historical_data()
        
        return {"message": "Outcome recorded successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording outcome: {str(e)}")

class RecommendRequest(BaseModel):
    userId: str
    balance: float
    lastN: int = 10

@app.post("/recommend")
async def recommend(req: RecommendRequest):
    # Baseline recommender: allocate small stakes across games with simple heuristics
    games = [
        {"game": "mines", "weight": 0.5},
        {"game": "aviator", "weight": 0.5}
    ]
    total_w = sum(g["weight"] for g in games)
    max_total = req.balance
    recs = []
    for g in games:
        stake = min(max_total * (g["weight"] / total_w) * 0.1, max_total)  # cap 10%
        recs.append({
            "game": g["game"],
            "recommendedStake": round(stake, 2),
            "confidence": 0.6,
            "explanation": "Baseline equal-weight recommendation"
        })
    return recs

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)