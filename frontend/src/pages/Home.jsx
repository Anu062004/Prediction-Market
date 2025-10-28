import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useSocket } from '../contexts/SocketContext'
import MarketCard from '../components/MarketCard'
import LoadingSpinner from '../components/LoadingSpinner'

const Home = () => {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, resolved
  const { socket } = useSocket()

  useEffect(() => {
    fetchMarkets()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('marketCreated', (market) => {
        setMarkets(prev => [market, ...prev])
      })

      socket.on('marketResolved', ({ marketId, winningOutcome }) => {
        setMarkets(prev => prev.map(market => 
          market.id === marketId 
            ? { ...market, isResolved: true, winningOutcome }
            : market
        ))
      })

      return () => {
        socket.off('marketCreated')
        socket.off('marketResolved')
      }
    }
  }, [socket])

  const fetchMarkets = async () => {
    try {
      const response = await axios.get('/api/markets')
      setMarkets(response.data)
    } catch (error) {
      console.error('Failed to fetch markets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMarkets = markets.filter(market => {
    if (filter === 'active') return !market.isResolved
    if (filter === 'resolved') return market.isResolved
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-5xl font-bold gradient-text mb-4">
          Ultra-Fast Prediction Markets
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience instant finality with Linera microchains. Create and resolve markets in minutes, not hours.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/create" className="btn-primary text-lg px-8 py-3">
            Create Market
          </Link>
          <button className="btn-secondary text-lg px-8 py-3">
            Learn More
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="card text-center">
          <div className="text-3xl font-bold text-neon-blue mb-2">{markets.length}</div>
          <div className="text-gray-400">Total Markets</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-neon-green mb-2">
            {markets.filter(m => !m.isResolved).length}
          </div>
          <div className="text-gray-400">Active Markets</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-neon-purple mb-2">
            {markets.filter(m => m.isResolved).length}
          </div>
          <div className="text-gray-400">Resolved Markets</div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6">
        {[
          { key: 'all', label: 'All Markets' },
          { key: 'active', label: 'Active' },
          { key: 'resolved', label: 'Resolved' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === key
                ? 'bg-neon-blue text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Markets Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market, index) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MarketCard market={market} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {filter === 'all' ? 'No markets available' : `No ${filter} markets`}
            </div>
            {filter === 'all' && (
              <Link to="/create" className="btn-primary">
                Create First Market
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Home