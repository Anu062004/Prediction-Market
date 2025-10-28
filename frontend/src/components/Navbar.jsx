import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWallet } from '../contexts/WalletContext'
import { useSocket } from '../contexts/SocketContext'

const Navbar = () => {
  const location = useLocation()
  const { isConnected, address, balance, connectWallet, disconnectWallet, isLoading } = useWallet()
  const { connected } = useSocket()

  const isActive = (path) => location.pathname === path

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold gradient-text">FlashBet</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-neon-blue border-b-2 border-neon-blue' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Markets
            </Link>
            <Link
              to="/create"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/create') 
                  ? 'text-neon-blue border-b-2 border-neon-blue' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Create Market
            </Link>
            <Link
              to="/wallet"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/wallet') 
                  ? 'text-neon-blue border-b-2 border-neon-blue' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Wallet
            </Link>
          </div>

          {/* Status Indicators & Wallet */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Wallet */}
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{balance} FLASH</div>
                  <div className="text-xs text-gray-400">{formatAddress(address)}</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-xs"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar