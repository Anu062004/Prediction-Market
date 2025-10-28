use crate::types::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketFactoryState {
    pub markets: HashMap<String, MarketInfo>,
    pub next_market_id: u64,
}

impl Default for MarketFactoryState {
    fn default() -> Self {
        Self {
            markets: HashMap::new(),
            next_market_id: 1,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactoryOperation {
    CreateMarket {
        question: String,
        outcomes: Vec<String>,
        expiry_time: u64,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactoryEvent {
    MarketCreated { market_info: MarketInfo },
}

pub struct MarketFactory;

impl MarketFactory {
    pub fn create_market(
        state: &mut MarketFactoryState,
        creator: String,
        question: String,
        outcomes: Vec<String>,
        expiry_time: u64,
    ) -> Result<MarketInfo, String> {
        let market_id = format!("market_{}", state.next_market_id);
        state.next_market_id += 1;

        let market_info = MarketInfo {
            id: market_id.clone(),
            question,
            outcomes,
            expiry_time,
            creator,
            is_resolved: false,
            winning_outcome: None,
        };

        state.markets.insert(market_id, market_info.clone());
        Ok(market_info)
    }

    pub fn get_market(state: &MarketFactoryState, market_id: &str) -> Option<&MarketInfo> {
        state.markets.get(market_id)
    }

    pub fn list_markets(state: &MarketFactoryState) -> Vec<&MarketInfo> {
        state.markets.values().collect()
    }
}