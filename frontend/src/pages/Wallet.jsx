import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  WalletIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'
import { useWallet } from '../contexts/WalletContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const Wallet = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    connectWallet, 
    disconnectWallet, 
    addFunds, 
    isLoading 
  } = useWallet()
  const [userBets, setUserBets] = useState([])
  const [loadingBets, setLoadingBets] = useState(false)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [fundAmount, setFundAmount] = useState('')

  useEffect(() => {
    if (isConnected && address) {
      fetchUserBets()
    }
  }, [isConnected, address])

  const fetchUserBets = async () => {
    setLoadingBets(true)
    try {
      // Simulate fetching user bets
      // In production, this would be an API call
      const mockBets = [
        {
          id: 'bet_1',
          marketId: 'market_1',
          market: {
            question: 'Will Bitcoin reach $100,000 by end of year?',
            outcomes: ['Yes', 'No']
          },
          outcome: 0,
          amount: 50,
          odds: 0.6,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'active'
        },
        {
          id: 'bet_2',
          marketId: 'market_2',
          market: {
            question: 'Will it rain tomorrow?',
            outcomes: ['Yes', 'No']
          },
          outcome: 1,
          amount: 25,
          odds: 0.4,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: 'won',
          payout: 62.5
        }
      ]
      setUserBets(mockBets)
    } catch (error) {
      console.error('Failed to fetch user bets:', error)
      toast.error('Failed to load betting history')
    } finally {
      setLoadingBets(false)
    }
  }

  const handleAddFunds = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    addFunds(parseFloat(fundAmount))
    setFundAmount('')
    setShowAddFunds(false)
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const getBetStatusColor = (status) => {
    switch (status) {
      case 'won': return 'text-green-400'
      case 'lost': return 'text-red-400'
      case 'active': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getBetStatusIcon = (status) => {
    switch (status) {
      case 'won': return <ArrowUpIcon className="w-4 h-4" />
      case 'lost': return <ArrowDownIcon className="w-4 h-4" />
      case 'active': return <ClockIcon className="w-4 h-4" />
      default: return null
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your Linera wallet to view your balance and betting history
          </p>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="btn-primary px-8 py-3"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wallet Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-text">My Wallet</h1>
          <button
            onClick={disconnectWallet}
            className="btn-secondary text-sm"
          >
            Disconnect
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance */}
          <div className="bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-lg p-6 border border-neon-blue/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Balance</h3>
              <button
                onClick={() => setShowAddFunds(true)}
                className="text-neon-blue hover:text-neon-purple transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{balance} FLASH</div>
            <div className="text-sm text-gray-400">Available for betting</div>
          </div>

          {/* Address */}
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
            <div className="font-mono text-sm text-gray-300 break-all">
              {formatAddress(address)}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(address)
                toast.success('Address copied to clipboard')
              }}
              className="text-xs text-neon-blue hover:text-neon-purple transition-colors mt-2"
            >
              Copy Full Address
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddFunds(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Add Funds</h3>
            <div className="space-y-4">
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  className="flex-1 btn-primary"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Betting History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Betting History</h2>
        
        {loadingBets ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-neon-blue rounded-full mx-auto"></div>
          </div>
        ) : userBets.length > 0 ? (
          <div className="space-y-4">
            {userBets.map((bet) => (
              <div key={bet.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      to={`/market/${bet.marketId}`}
                      className="text-white hover:text-neon-blue transition-colors font-medium"
                    >
                      {bet.market.question}
                    </Link>
                    <div className="text-sm text-gray-400 mt-1">
                      Bet on: {bet.market.outcomes[bet.outcome]}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${getBetStatusColor(bet.status)}`}>
                    {getBetStatusIcon(bet.status)}
                    <span className="text-sm font-medium capitalize">{bet.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-4">
                    <span className="text-gray-400">
                      Amount: <span className="text-white">{bet.amount} FLASH</span>
                    </span>
                    <span className="text-gray-400">
                      Odds: <span className="text-white">{(1 / bet.odds).toFixed(2)}x</span>
                    </span>
                    {bet.payout && (
                      <span className="text-gray-400">
                        Payout: <span className="text-green-400">{bet.payout} FLASH</span>
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">
                    {new Date(bet.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No bets placed yet</div>
            <Link to="/" className="btn-primary">
              Browse Markets
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Wallet