import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSocket } from '../contexts/SocketContext'
import { useWallet } from '../contexts/WalletContext'
import BetModal from '../components/BetModal'
import LoadingSpinner from '../components/LoadingSpinner'

const MarketDetail = () => {
  const { id } = useParams()
  const [market, setMarket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBetModal, setShowBetModal] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState(null)
  const { socket, joinMarket, leaveMarket } = useSocket()
  const { isConnected } = useWallet()

  useEffect(() => {
    fetchMarket()
    joinMarket(id)

    return () => {
      leaveMarket(id)
    }
  }, [id])

  useEffect(() => {
    if (socket) {
      socket.on('oddsUpdated', ({ marketId, odds }) => {
        if (marketId === id) {
          setMarket(prev => prev ? { ...prev, odds } : null)
        }
      })

      socket.on('betPlaced', ({ marketId }) => {
        if (marketId === id) {
          fetchMarket() // Refresh market data
        }
      })

      socket.on('marketResolved', ({ marketId, winningOutcome }) => {
        if (marketId === id) {
          setMarket(prev => prev ? { 
            ...prev, 
            isResolved: true, 
            winningOutcome 
          } : null)
          toast.success(`Market resolved! Winner: ${market?.outcomes[winningOutcome]}`)
        }
      })

      return () => {
        socket.off('oddsUpdated')
        socket.off('betPlaced')
        socket.off('marketResolved')
      }
    }
  }, [socket, id, market])

  const fetchMarket = async () => {
    try {
      const response = await axios.get(`/api/markets/${id}`)
      setMarket(response.data)
    } catch (error) {
      console.error('Failed to fetch market:', error)
      toast.error('Failed to load market')
    } finally {
      setLoading(false)
    }
  }

  const handleBetClick = (outcomeIndex) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (market.isResolved) {
      toast.error('Market is already resolved')
      return
    }

    if (new Date() > new Date(market.expiryTime)) {
      toast.error('Market has expired')
      return
    }

    setSelectedOutcome(outcomeIndex)
    setShowBetModal(true)
  }

  const formatTimeRemaining = (expiryTime) => {
    const now = new Date()
    const expiry = new Date(expiryTime)
    const diff = expiry - now

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!market) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Market Not Found</h2>
        <p className="text-gray-400">The market you're looking for doesn't exist.</p>
      </div>
    )
  }

  const totalPool = market.totalPool?.reduce((sum, pool) => sum + pool, 0) || 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Market Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-4">{market.question}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Created: {new Date(market.createdAt).toLocaleDateString()}</span>
              <span>Total Pool: {totalPool} FLASH</span>
              <span className={market.isResolved ? 'text-green-400' : 'text-yellow-400'}>
                {market.isResolved ? 'Resolved' : `Expires: ${formatTimeRemaining(market.expiryTime)}`}
              </span>
            </div>
          </div>
          {market.isResolved && (
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Winner</div>
              <div className="text-lg font-bold text-green-400">
                {market.outcomes[market.winningOutcome]}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Outcomes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4"
      >
        {market.outcomes.map((outcome, index) => {
          const odds = market.odds?.[index] || 1.0 / market.outcomes.length
          const percentage = (odds * 100).toFixed(1)
          const pool = market.totalPool?.[index] || 0
          const isWinner = market.isResolved && market.winningOutcome === index

          return (
            <motion.div
              key={index}
              whileHover={!market.isResolved ? { scale: 1.02 } : {}}
              className={`card cursor-pointer transition-all duration-300 ${
                isWinner ? 'neon-border border-green-400 shadow-green-400/20' :
                !market.isResolved ? 'hover:neon-border' : ''
              }`}
              onClick={() => handleBetClick(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{outcome}</h3>
                    {isWinner && (
                      <span className="bg-green-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                        WINNER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Pool: {pool} FLASH</span>
                    <span>Probability: {percentage}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neon-blue mb-1">
                    {(1 / odds).toFixed(2)}x
                  </div>
                  <div className="text-xs text-gray-400">Payout</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isWinner ? 'bg-green-400' : 'bg-gradient-to-r from-neon-blue to-neon-purple'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Bet Modal */}
      {showBetModal && (
        <BetModal
          market={market}
          outcomeIndex={selectedOutcome}
          onClose={() => setShowBetModal(false)}
          onBetPlaced={() => {
            setShowBetModal(false)
            fetchMarket()
          }}
        />
      )}
    </div>
  )
}

export default MarketDetail