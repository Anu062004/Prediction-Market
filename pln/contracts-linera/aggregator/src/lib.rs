use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReputationEntry {
    pub accuracy: f64,
    pub volume: f64,
}

#[derive(Default)]
pub struct Aggregator {
    pub rep: BTreeMap<String, ReputationEntry>,
}

impl Aggregator {
    pub fn update_reputation(&mut self, user: String, correct: bool, stake: f64) {
        let entry = self.rep.entry(user).or_default();
        let total = entry.volume + stake;
        let correct_weight = if correct { stake } else { 0.0 };
        let new_accuracy = if total > 0.0 {
            (entry.accuracy * entry.volume + correct_weight) / total
        } else { 0.0 };
        entry.accuracy = new_accuracy;
        entry.volume = total;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reputation_updates() {
        let mut a = Aggregator::default();
        a.update_reputation("alice".into(), true, 10.0);
        a.update_reputation("alice".into(), false, 10.0);
        let r = a.rep.get("alice").unwrap();
        assert!((r.accuracy - 0.5).abs() < 1e-6);
    }
}
