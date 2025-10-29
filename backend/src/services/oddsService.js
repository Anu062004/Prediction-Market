const axios = require('axios');

class OddsService {
  constructor(marketService) {
    this.aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8001';
    this.marketOdds = new Map();
    this.marketService = marketService; // share same instance
  }

  async updateOdds(marketId) {
    try {
      // Get market data from shared market service
      const market = await this.marketService.getMarket(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      const bets = await this.marketService.getMarketBets(marketId);
      
      // Calculate current betting amounts per outcome
      const currentBets = {};
      market.outcomes.forEach((_, index) => {
        currentBets[index] = 0;
      });

      bets.forEach(bet => {
        currentBets[bet.outcome] = (currentBets[bet.outcome] || 0) + bet.amount;
      });

      // Call AI engine to get updated odds
      const response = await axios.post(`${this.aiEngineUrl}/update_odds`, {
        market_id: marketId,
        question: market.question,
        outcomes: market.outcomes,
        current_bets: currentBets,
        historical_data: null
      });

      const { odds, confidence } = response.data;
      
      // Update market odds
      market.odds = market.outcomes.map((_, index) => odds[index] || 1.0 / market.outcomes.length);
      
      // Store odds with metadata
      this.marketOdds.set(marketId, {
        odds: market.odds,
        confidence,
        lastUpdated: new Date(),
        totalBets: Object.values(currentBets).reduce((sum, amount) => sum + amount, 0)
      });

      console.log(`Updated odds for market ${marketId}:`, market.odds);
      return market.odds;
      
    } catch (error) {
      console.error(`Failed to update odds for market ${marketId}:`, error.message);
      
      // Return current odds if AI engine is unavailable
      const currentOdds = this.marketOdds.get(marketId);
      if (currentOdds) {
        return currentOdds.odds;
      }
      
      // Fallback to equal odds
      const market = await this.marketService.getMarket(marketId);
      
      if (market) {
        const equalOdds = market.outcomes.map(() => 1.0 / market.outcomes.length);
        return equalOdds;
      }
      
      throw error;
    }
  }

  async getOdds(marketId) {
    const oddsData = this.marketOdds.get(marketId);
    if (oddsData) {
      return {
        odds: oddsData.odds,
        confidence: oddsData.confidence,
        lastUpdated: oddsData.lastUpdated,
        totalBets: oddsData.totalBets
      };
    }

    // If no odds cached, calculate them
    const odds = await this.updateOdds(marketId);
    return {
      odds,
      confidence: 0.5,
      lastUpdated: new Date(),
      totalBets: 0
    };
  }

  async recordOutcome(marketId, winningOutcome) {
    try {
      const oddsData = this.marketOdds.get(marketId);
      if (!oddsData) {
        console.warn(`No odds data found for market ${marketId}`);
        return;
      }

      // Send outcome to AI engine for learning
      await axios.post(`${this.aiEngineUrl}/record_outcome`, null, {
        params: {
          market_id: marketId,
          winning_outcome: winningOutcome,
          final_odds: oddsData.odds.reduce((obj, odd, index) => {
            obj[index] = odd;
            return obj;
          }, {})
        }
      });

      console.log(`Recorded outcome for market ${marketId}: ${winningOutcome}`);
      
    } catch (error) {
      console.error(`Failed to record outcome for market ${marketId}:`, error.message);
    }
  }

  getMarketOddsHistory(marketId) {
    return this.marketOdds.get(marketId);
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.aiEngineUrl}/health`);
      return response.data;
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = OddsService;