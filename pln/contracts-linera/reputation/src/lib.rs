use std::collections::BTreeMap;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RepScore {
    pub accuracy: f64,
    pub roi: f64,
}

#[derive(Default)]
pub struct Reputation {
    pub scores: BTreeMap<String, RepScore>,
}

impl Reputation {
    pub fn update(&mut self, user: String, accuracy: f64, roi: f64) {
        self.scores.insert(user, RepScore { accuracy, roi });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn update_works() {
        let mut r = Reputation::default();
        r.update("alice".into(), 0.7, 0.12);
        let s = r.scores.get("alice").unwrap();
        assert!((s.accuracy - 0.7).abs() < 1e-6);
    }
}
