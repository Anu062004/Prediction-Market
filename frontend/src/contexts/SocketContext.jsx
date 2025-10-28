import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
    
    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('marketCreated', (market) => {
      toast.success(`New market created: ${market.question}`)
    })

    newSocket.on('betPlaced', ({ marketId, bet }) => {
      toast.success(`Bet placed on market ${marketId}`)
    })

    newSocket.on('oddsUpdated', ({ marketId, odds }) => {
      console.log(`Odds updated for market ${marketId}:`, odds)
    })

    newSocket.on('marketResolved', ({ marketId, winningOutcome, payouts }) => {
      toast.success(`Market ${marketId} resolved! Winning outcome: ${winningOutcome}`)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const joinMarket = (marketId) => {
    if (socket) {
      socket.emit('joinMarket', marketId)
    }
  }

  const leaveMarket = (marketId) => {
    if (socket) {
      socket.emit('leaveMarket', marketId)
    }
  }

  const value = {
    socket,
    connected,
    joinMarket,
    leaveMarket
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}