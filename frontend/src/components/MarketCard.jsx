import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const MarketCard = ({ market }) => {
  const formatTimeRemaining = (expiryTime) => {
    const now = new Date()
    const expiry = new Date(expiryTime)
    const diff = expiry - now

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getStatusColor = () => {
    if (market.isResolved) return 'text-green-400'
    if (new Date() > new Date(market.expiryTime)) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getStatusIcon = () => {
    if (market.isResolved) return <CheckCircleIcon className="w-4 h-4" />
    return <ClockIcon className="w-4 h-4" />
  }

  const totalPool = market.totalPool?.reduce((sum, pool) => sum + pool, 0) || 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className="card hover:neon-border transition-all duration-300"
    >
      <Link to={`/market/${market.id}`} className="block">
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {market.isResolved ? 'Resolved' : formatTimeRemaining(market.expiryTime)}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Pool: {totalPool} FLASH
          </div>
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2">
          {market.question}
        </h3>

        {/* Outcomes */}
        <div className="space-y-2 mb-4">
          {market.outcomes.map((outcome, index) => {
            const odds = market.odds?.[index] || 1.0 / market.outcomes.length
            const percentage = (odds * 100).toFixed(1)
            
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate flex-1">
                  {outcome}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-700">
          <span>Created {new Date(market.createdAt).toLocaleDateString()}</span>
          {market.isResolved && market.winningOutcome !== null && (
            <span className="text-green-400 font-medium">
              Winner: {market.outcomes[market.winningOutcome]}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default MarketCard