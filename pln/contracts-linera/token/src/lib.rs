use std::collections::BTreeMap;
use serde::{Serialize, Deserialize};

#[derive(Default)]
pub struct Token {
    pub balances: BTreeMap<String, u128>,
    pub symbol: String,
    pub decimals: u8,
}

impl Token {
    pub fn new(symbol: &str, decimals: u8) -> Self {
        Self { balances: BTreeMap::new(), symbol: symbol.into(), decimals }
    }

    pub fn mint(&mut self, to: String, amount: u128) {
        *self.balances.entry(to).or_default() += amount;
    }

    pub fn transfer(&mut self, from: &str, to: String, amount: u128) -> bool {
        let from_bal = self.balances.entry(from.into()).or_default();
        if *from_bal < amount { return false; }
        *from_bal -= amount;
        *self.balances.entry(to).or_default() += amount;
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transfer_works() {
        let mut t = Token::new("PRED", 9);
        t.mint("alice".into(), 100);
        assert!(t.transfer("alice", "bob".into(), 40));
        assert_eq!(t.balances.get("alice").cloned().unwrap(), 60);
        assert_eq!(t.balances.get("bob").cloned().unwrap(), 40);
    }
}
