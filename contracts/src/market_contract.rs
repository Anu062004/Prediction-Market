use crate::types::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub struct MarketContract;

impl MarketContract {
    pub fn new(market_info: MarketInfo) -> MarketState {
        let mut odds = HashMap::new();
        let num_outcomes = market_info.outcomes.len();
        
        // Initialize with equal odds
        for i in 0..num_outcomes {
            odds.insert(i, 1.0 / num_outcomes as f64);
        }

        MarketState {
            info: market_info,
            bets: Vec::new(),
            total_pool: HashMap::new(),
            odds,
        }
    }

    pub fn place_bet(
        state: &mut MarketState,
        user: String,
        outcome: usize,
        amount: u64,
    ) -> Result<Bet, String> {
        if state.info.is_resolved {
            return Err("Market is already resolved".to_string());
        }

        if outcome >= state.info.outcomes.len() {
            return Err("Invalid outcome".to_string());
        }

        let current_time = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        if current_time > state.info.expiry_time {
            return Err("Market has expired".to_string());
        }

        let bet_id = format!("bet_{}_{}", state.bets.len(), user);
        let current_odds = state.odds.get(&outcome).copied().unwrap_or(1.0);

        let bet = Bet {
            id: bet_id,
            user,
            outcome,
            amount,
            odds: current_odds,
            timestamp: current_time,
        };

        state.bets.push(bet.clone());
        
        // Update total pool
        *state.total_pool.entry(outcome).or_insert(0) += amount;

        Ok(bet)
    }

    pub fn resolve_market(
        state: &mut MarketState,
        winning_outcome: usize,
    ) -> Result<HashMap<String, u64>, String> {
        if state.info.is_resolved {
            return Err("Market is already resolved".to_string());
        }

        if winning_outcome >= state.info.outcomes.len() {
            return Err("Invalid winning outcome".to_string());
        }

        state.info.is_resolved = true;
        state.info.winning_outcome = Some(winning_outcome);

        let mut payouts = HashMap::new();
        let total_pool: u64 = state.total_pool.values().sum();
        let winning_pool = state.total_pool.get(&winning_outcome).copied().unwrap_or(0);

        if winning_pool == 0 {
            return Ok(payouts);
        }

        // Calculate payouts for winning bets
        for bet in &state.bets {
            if bet.outcome == winning_outcome {
                let payout = (bet.amount as f64 * total_pool as f64 / winning_pool as f64) as u64;
                *payouts.entry(bet.user.clone()).or_insert(0) += payout;
            }
        }

        Ok(payouts)
    }

    pub fn update_odds(
        state: &mut MarketState,
        new_odds: HashMap<usize, f64>,
    ) -> Result<(), String> {
        if state.info.is_resolved {
            return Err("Cannot update odds for resolved market".to_string());
        }

        // Validate odds sum to 1.0 (approximately)
        let total: f64 = new_odds.values().sum();
        if (total - 1.0).abs() > 0.01 {
            return Err("Odds must sum to 1.0".to_string());
        }

        state.odds = new_odds;
        Ok(())
    }

    pub fn get_odds(state: &MarketState) -> &HashMap<usize, f64> {
        &state.odds
    }

    pub fn get_market_info(state: &MarketState) -> &MarketInfo {
        &state.info
    }
}