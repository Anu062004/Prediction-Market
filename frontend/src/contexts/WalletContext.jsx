import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState(1000) // Simulated balance
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('wallet_address')
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
    }
  }, [])

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAddress = `linera1${Math.random().toString(36).substr(2, 40)}`
      setAddress(mockAddress)
      setIsConnected(true)
      localStorage.setItem('wallet_address', mockAddress)
      
      toast.success('Wallet connected successfully!')
    } catch (error) {
      toast.error('Failed to connect wallet')
      console.error('Wallet connection error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAddress('')
    setIsConnected(false)
    localStorage.removeItem('wallet_address')
    toast.success('Wallet disconnected')
  }

  const placeBet = async (amount) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    if (amount > balance) {
      throw new Error('Insufficient balance')
    }

    // Simulate transaction
    setBalance(prev => prev - amount)
    return {
      txHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      success: true
    }
  }

  const addFunds = (amount) => {
    setBalance(prev => prev + amount)
    toast.success(`Added ${amount} tokens to wallet`)
  }

  const value = {
    isConnected,
    address,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
    placeBet,
    addFunds
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}