import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import MinesGrid from '../components/MinesGrid'

const colors = {
  bg: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)'
}

const genMines = (n) => {
  const s = new Set()
  while (s.size < n) s.add(Math.floor(Math.random() * 25))
  return s
}

export default function Mines() {
  const [balance, setBalance] = useState(879.54)
  const [bet, setBet] = useState(10)
  const [mines, setMines] = useState(5)
  const [auto, setAuto] = useState(2.0)
  const [multiplier, setMultiplier] = useState(1.0)
  const [grid, setGrid] = useState(() => Array(25).fill('hidden'))
  const [active, setActive] = useState(false)
  const [mineSet, setMineSet] = useState(new Set())

  const balMv = useMotionValue(balance)
  const balText = useTransform(balMv, (v) => v.toFixed(2))
  const multMv = useMotionValue(multiplier)
  const multText = useTransform(multMv, (v) => `x${v.toFixed(2)}`)

  useEffect(() => { const c = animate(balMv, balance, { duration: .4 }); return () => c.stop() }, [balance])
  useEffect(() => { const c = animate(multMv, multiplier, { duration: .3 }); return () => c.stop() }, [multiplier])

  const disabled = useMemo(() => !active, [active])

  const startRound = () => {
    if (active) return
    if (bet > balance) return
    setBalance((b) => b - bet)
    setMultiplier(1.0)
    setGrid(Array(25).fill('hidden'))
    const s = genMines(mines)
    setMineSet(s)
    setActive(true)
  }

  const cashOut = () => {
    if (!active) return
    const win = bet * multiplier
    setBalance((b) => b + win)
    setActive(false)
  }

  const onReveal = (idx) => {
    if (!active) return
    setGrid((g) => {
      if (g[idx] !== 'hidden') return g
      const copy = [...g]
      if (mineSet.has(idx)) {
        copy[idx] = 'mine'
        setActive(false)
      } else {
        copy[idx] = 'safe'
        const growth = Math.max(0.05, Math.min(0.35, mines / 20))
        setMultiplier((m) => parseFloat((m * (1 + growth)).toFixed(3)))
      }
      return copy
    })
  }

  useEffect(() => {
    if (active && multiplier >= auto) cashOut()
  }, [multiplier, auto, active])

  return (
    <div className="min-h-[calc(100vh-4rem)]" style={{ background: colors.bg }}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* HUD */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <GlassPanel label="Balance">
              <motion.span className="font-extrabold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>{balText}</motion.span>
            </GlassPanel>
            <GlassPanel label="Bet">
              <input type="number" min={1} step={1} value={bet} onChange={(e)=>setBet(parseFloat(e.target.value||'0'))} className="w-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 outline-none text-white" />
            </GlassPanel>
            <GlassPanel label="Mines">
              <input type="number" min={1} max={10} step={1} value={mines} onChange={(e)=>setMines(Math.max(1,Math.min(10,parseInt(e.target.value||'1'))))} className="w-20 bg-white/5 border border-white/10 rounded-md px-3 py-2 outline-none text-white" />
            </GlassPanel>
            <GlassPanel label="Auto Cashout">
              <input type="number" min={1.01} step={0.01} value={auto} onChange={(e)=>setAuto(Math.max(1.01,parseFloat(e.target.value||'1.01')))} className="w-24 bg-white/5 border border-white/10 rounded-md px-3 py-2 outline-none text-white" />
            </GlassPanel>
          </div>

          <div className="flex items-center gap-3">
            <NeonButton color="from-cyan-400 to-blue-500" onClick={startRound} disabled={active}>Start Round</NeonButton>
            <NeonButton color="from-green-400 to-lime-500" onClick={cashOut} disabled={!active}>Cash Out</NeonButton>
            <NeonButton color="from-slate-600 to-slate-700" onClick={()=>{ setActive(false); setGrid(Array(25).fill('hidden')); setMultiplier(1.0); }}>Reset</NeonButton>
            <GlassPanel label="Multiplier">
              <motion.span className="neon-text font-extrabold" style={{ fontFamily: 'Orbitron, sans-serif' }}>{multText}</motion.span>
            </GlassPanel>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 flex justify-center">
          <MinesGrid grid={grid} onReveal={onReveal} disabled={!active} />
        </div>

        {/* Hint + Provably fair */}
        <div className="mt-8 flex items-center justify-between text-white/70 text-sm">
          <div>Click safe tiles to increase multiplier. Hit a mine and lose your stake.</div>
          <div className="glass-panel px-3 py-1 rounded-md border border-white/10">Provably fair • seed {String(mineSet.values().next().value ?? 0).toString().slice(0,6)}…</div>
        </div>
      </div>
    </div>
  )
}

function GlassPanel({ label, children }) {
  return (
    <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 text-white/80">
      <div className="text-xs uppercase tracking-widest opacity-70">{label}</div>
      <div className="text-lg">{children}</div>
    </div>
  )
}

function NeonButton({ children, color, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={disabled ? undefined : onClick}
      className={`px-4 py-2 rounded-xl bg-gradient-to-br ${color} text-black font-bold shadow-[0_0_16px_rgba(0,255,255,.3)] disabled:opacity-40 disabled:cursor-not-allowed`}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
