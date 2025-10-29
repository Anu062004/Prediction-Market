import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Markets from './pages/Markets'
import Event from './pages/Event'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Markets />} />
        <Route path="/event/:id" element={<Event />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = document.getElementById('root')!
createRoot(root).render(<App />)
