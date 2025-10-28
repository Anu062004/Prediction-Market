use linera_sdk::{
    base::{ApplicationId, WithContractAbi},
    Contract, ContractRuntime,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash, Debug, Serialize, Deserialize)]
pub struct MarketFactoryAbi;

impl WithContractAbi for MarketFactoryAbi {
    type Abi = market_factory::MarketFactoryAbi;
}

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Debug, Serialize, Deserialize)]
pub enum FactoryOperation {
    CreateMarket {
        question: String,
        outcomes: Vec<String>,
        expiry_time: u64,
    },
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FactoryResponse {
    MarketCreated { market_info: MarketInfo },
}

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

impl Contract for MarketFactoryAbi {
    type Error = String;
    type Storage = ();
    type State = MarketFactoryState;
    type Message = ();
    type Parameters = ();
    type InstantiationArgument = ();

    async fn load(
        _storage: Self::Storage,
        _runtime: &mut ContractRuntime<Self>,
    ) -> Result<Self::State, Self::Error> {
        Ok(MarketFactoryState::default())
    }

    async fn instantiate(
        _state: &mut Self::State,
        _argument: Self::InstantiationArgument,
        _runtime: &mut ContractRuntime<Self>,
    ) -> Result<(), Self::Error> {
        Ok(())
    }

    async fn execute_operation(
        state: &mut Self::State,
        operation: Self::Operation,
        _runtime: &mut ContractRuntime<Self>,
    ) -> Result<Self::Response, Self::Error> {
        match operation {
            FactoryOperation::CreateMarket {
                question,
                outcomes,
                expiry_time,
            } => {
                let market_id = format!("market_{}", state.next_market_id);
                state.next_market_id += 1;

                let market_info = MarketInfo {
                    id: market_id.clone(),
                    question,
                    outcomes,
                    expiry_time,
                    creator: "factory".to_string(),
                    is_resolved: false,
                    winning_outcome: None,
                };

                state.markets.insert(market_id, market_info.clone());

                Ok(FactoryResponse::MarketCreated { market_info })
            }
        }
    }

    async fn execute_message(
        _state: &mut Self::State,
        _message: Self::Message,
        _runtime: &mut ContractRuntime<Self>,
    ) -> Result<(), Self::Error> {
        Err("Messages not supported".to_string())
    }
}

mod market_factory {
    pub struct MarketFactoryAbi;
}