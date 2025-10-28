import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useWallet } from '../contexts/WalletContext'
import LoadingSpinner from './LoadingSpinner'

const BetModal = ({ market, outcomeIndex, onClose, onBetPlaced }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const { balance, address, placeBet } = useWallet()

  const outcome = market.outcomes[outcomeIndex]
  const odds = market.odds?.[outcomeIndex] || 1.0 / market.outcomes.length
  const payout = amount ? (parseFloat(amount) / odds).toFixed(2) : '0'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid bet amount')
      return
    }

    if (parseFloat(amount) > balance) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    
    try {
      // Place bet through wallet (simulated transaction)
      await placeBet(parseFloat(amount))
      
      // Submit bet to backend
      await axios.post(`/api/markets/${market.id}/bet`, {
        outcome: outcomeIndex,
        amount: parseFloat(amount),
        user: address
      })

      toast.success(`Bet placed successfully! Potential payout: ${payout} FLASH`)
      onBetPlaced()
    } catch (error) {
      console.error('Failed to place bet:', error)
      toast.error(error.response?.data?.error || 'Failed to place bet')
    } finally {
      setLoading(false)
    }
  }

  const quickAmounts = [10, 25, 50, 100]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Place Bet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Outcome Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-1">Betting on:</div>
          <div className="text-lg font-semibold text-white mb-2">{outcome}</div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current Odds:</span>
            <span className="text-neon-blue font-medium">{(1 / odds).toFixed(2)}x</span>
          </div>
        </div>

        {/* Bet Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount (FLASH)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue"
              disabled={loading}
            />
            <div className="text-xs text-gray-400 mt-1">
              Balance: {balance} FLASH
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                {quickAmount}
              </button>
            ))}
          </div>

          {/* Payout Info */}
          {amount && (
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Bet Amount:</span>
                <span className="text-white">{amount} FLASH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Payout:</span>
                <span className="text-neon-green font-medium">{payout} FLASH</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Placing Bet...</span>
              </>
            ) : (
              'Place Bet'
            )}
          </button>
        </form>

        {/* Disclaimer */}
        <div className="text-xs text-gray-400 mt-4 text-center">
          Bets are final and cannot be cancelled once placed.
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BetModal