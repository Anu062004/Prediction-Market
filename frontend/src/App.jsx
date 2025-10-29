import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SocketProvider } from './contexts/SocketContext'
import { WalletProvider } from './contexts/WalletContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MarketDetail from './pages/MarketDetail'
import Wallet from './pages/Wallet'
import CreateMarket from './pages/CreateMarket'
import Mines from './pages/Mines'

function App() {
  return (
    <Router>
      <WalletProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-900">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market/:id" element={<MarketDetail />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/create" element={<CreateMarket />} />
                <Route path="/mines" element={<Mines />} />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151'
                }
              }}
            />
          </div>
        </SocketProvider>
      </WalletProvider>
    </Router>
  )
}

export default App