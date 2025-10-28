const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const MarketService = require('./services/marketService');
const LineraService = require('./services/lineraService');
const OddsService = require('./services/oddsService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Services
const marketService = new MarketService();
const lineraService = new LineraService();
const oddsService = new OddsService();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/markets', async (req, res) => {
  try {
    const markets = await marketService.getAllMarkets();
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/markets/:id', async (req, res) => {
  try {
    const market = await marketService.getMarket(req.params.id);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/markets', async (req, res) => {
  try {
    const { question, outcomes, expiryTime } = req.body;
    
    if (!question || !outcomes || !expiryTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const market = await marketService.createMarket(question, outcomes, expiryTime);
    
    // Broadcast new market to all connected clients
    io.emit('marketCreated', market);
    
    res.status(201).json(market);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/markets/:id/bet', async (req, res) => {
  try {
    const { outcome, amount, user } = req.body;
    const marketId = req.params.id;
    
    if (outcome === undefined || !amount || !user) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bet = await marketService.placeBet(marketId, user, outcome, amount);
    
    // Update odds after new bet
    const updatedOdds = await oddsService.updateOdds(marketId);
    
    // Broadcast bet and odds update
    io.emit('betPlaced', { marketId, bet });
    io.emit('oddsUpdated', { marketId, odds: updatedOdds });
    
    res.status(201).json(bet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/markets/:id/resolve', async (req, res) => {
  try {
    const { winningOutcome } = req.body;
    const marketId = req.params.id;
    
    if (winningOutcome === undefined) {
      return res.status(400).json({ error: 'Missing winning outcome' });
    }

    const result = await marketService.resolveMarket(marketId, winningOutcome);
    
    // Broadcast market resolution
    io.emit('marketResolved', { marketId, winningOutcome, payouts: result.payouts });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/markets/:id/odds', async (req, res) => {
  try {
    const odds = await oddsService.getOdds(req.params.id);
    res.json(odds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('joinMarket', (marketId) => {
    socket.join(`market_${marketId}`);
    console.log(`Client ${socket.id} joined market ${marketId}`);
  });
  
  socket.on('leaveMarket', (marketId) => {
    socket.leave(`market_${marketId}`);
    console.log(`Client ${socket.id} left market ${marketId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Periodic odds updates
setInterval(async () => {
  try {
    const markets = await marketService.getAllMarkets();
    for (const market of markets) {
      if (!market.isResolved) {
        const updatedOdds = await oddsService.updateOdds(market.id);
        io.emit('oddsUpdated', { marketId: market.id, odds: updatedOdds });
      }
    }
  } catch (error) {
    console.error('Error updating odds:', error);
  }
}, 30000); // Update every 30 seconds

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`FlashBet backend server running on port ${PORT}`);
});