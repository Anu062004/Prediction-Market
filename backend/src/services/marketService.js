const { v4: uuidv4 } = require('uuid');

class MarketService {
  constructor() {
    this.markets = new Map();
    this.bets = new Map();
  }

  async createMarket(question, outcomes, expiryTime) {
    const marketId = uuidv4();
    const market = {
      id: marketId,
      question,
      outcomes,
      expiryTime: new Date(expiryTime),
      createdAt: new Date(),
      isResolved: false,
      winningOutcome: null,
      totalPool: outcomes.map(() => 0),
      odds: outcomes.map(() => 1.0 / outcomes.length)
    };

    this.markets.set(marketId, market);
    this.bets.set(marketId, []);

    console.log(`Created market: ${marketId} - ${question}`);
    return market;
  }

  async getMarket(marketId) {
    return this.markets.get(marketId);
  }

  async getAllMarkets() {
    return Array.from(this.markets.values());
  }

  async placeBet(marketId, user, outcome, amount) {
    const market = this.markets.get(marketId);
    if (!market) {
      throw new Error('Market not found');
    }

    if (market.isResolved) {
      throw new Error('Market is already resolved');
    }

    if (new Date() > market.expiryTime) {
      throw new Error('Market has expired');
    }

    if (outcome < 0 || outcome >= market.outcomes.length) {
      throw new Error('Invalid outcome');
    }

    const bet = {
      id: uuidv4(),
      marketId,
      user,
      outcome,
      amount: parseFloat(amount),
      odds: market.odds[outcome],
      timestamp: new Date()
    };

    const marketBets = this.bets.get(marketId);
    marketBets.push(bet);

    // Update total pool
    market.totalPool[outcome] += bet.amount;

    console.log(`Bet placed: ${bet.id} - ${user} bet ${amount} on outcome ${outcome}`);
    return bet;
  }

  async resolveMarket(marketId, winningOutcome) {
    const market = this.markets.get(marketId);
    if (!market) {
      throw new Error('Market not found');
    }

    if (market.isResolved) {
      throw new Error('Market is already resolved');
    }

    if (winningOutcome < 0 || winningOutcome >= market.outcomes.length) {
      throw new Error('Invalid winning outcome');
    }

    market.isResolved = true;
    market.winningOutcome = winningOutcome;
    market.resolvedAt = new Date();

    // Calculate payouts
    const marketBets = this.bets.get(marketId);
    const totalPool = market.totalPool.reduce((sum, pool) => sum + pool, 0);
    const winningPool = market.totalPool[winningOutcome];
    const payouts = new Map();

    if (winningPool > 0) {
      marketBets
        .filter(bet => bet.outcome === winningOutcome)
        .forEach(bet => {
          const payout = (bet.amount * totalPool) / winningPool;
          payouts.set(bet.user, (payouts.get(bet.user) || 0) + payout);
        });
    }

    console.log(`Market resolved: ${marketId} - winning outcome: ${winningOutcome}`);
    return {
      market,
      payouts: Object.fromEntries(payouts)
    };
  }

  async getMarketBets(marketId) {
    return this.bets.get(marketId) || [];
  }

  async getUserBets(user) {
    const userBets = [];
    for (const [marketId, bets] of this.bets.entries()) {
      const market = this.markets.get(marketId);
      const marketUserBets = bets
        .filter(bet => bet.user === user)
        .map(bet => ({ ...bet, market }));
      userBets.push(...marketUserBets);
    }
    return userBets;
  }
}

module.exports = MarketService;