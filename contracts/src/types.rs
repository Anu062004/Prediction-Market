use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketInfo {
    pub id: String,
    pub question: String,
    pub outcomes: Vec<String>,
    pub expiry_time: u64,
    pub creator: String,
    pub is_resolved: bool,
    pub winning_outcome: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bet {
    pub id: String,
    pub user: String,
    pub outcome: usize,
    pub amount: u64,
    pub odds: f64,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketState {
    pub info: MarketInfo,
    pub bets: Vec<Bet>,
    pub total_pool: HashMap<usize, u64>,
    pub odds: HashMap<usize, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MarketOperation {
    PlaceBet { outcome: usize, amount: u64 },
    ResolveMarket { winning_outcome: usize },
    UpdateOdds { new_odds: HashMap<usize, f64> },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MarketEvent {
    BetPlaced { bet: Bet },
    MarketResolved { winning_outcome: usize, payouts: HashMap<String, u64> },
    OddsUpdated { new_odds: HashMap<usize, f64> },
}