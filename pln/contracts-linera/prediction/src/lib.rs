use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: String,
    pub category: String,
    pub params: String,
    pub status: String,
    pub p_true: f64,
    pub odds_true: f64,
    pub odds_false: f64,
    pub commit_deadline: u64,
    pub reveal_deadline: u64,
    pub resolve_time: u64,
}

#[derive(Default)]
pub struct PredictionMarket {
    // simple in-memory model for tests
    pub events: std::collections::BTreeMap<String, Event>,
}

impl PredictionMarket {
    pub fn create_event(&mut self, id: String, category: String, params: String, resolve_time: u64) {
        let ev = Event {
            id: id.clone(),
            category,
            params,
            status: "Created".into(),
            p_true: 0.5,
            odds_true: 2.0,
            odds_false: 2.0,
            commit_deadline: resolve_time.saturating_sub(600),
            reveal_deadline: resolve_time.saturating_sub(300),
            resolve_time,
        };
        self.events.insert(id, ev);
    }

    pub fn update_event_probability(&mut self, id: &str, p_true: f64) {
        if let Some(ev) = self.events.get_mut(id) {
            let eps = 1e-6;
            let p = p_true.clamp(eps, 1.0 - eps);
            ev.p_true = p;
            ev.odds_true = (1.0 / p).max(1.01);
            ev.odds_false = (1.0 / (1.0 - p)).max(1.01);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn odds_math_monotone() {
        let mut m = PredictionMarket::default();
        m.create_event("e1".into(), "crypto".into(), "{}".into(), 10000);
        m.update_event_probability("e1", 0.8);
        let ev = m.events.get("e1").unwrap();
        assert!(ev.odds_true < ev.odds_false);
        m.update_event_probability("e1", 0.2);
        let ev2 = m.events.get("e1").unwrap();
        assert!(ev2.odds_true > ev2.odds_false);
    }
}
