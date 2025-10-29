import React from 'react'
import { motion } from 'framer-motion'

const tileVariants = {
  initial: { rotateY: 0, scale: 1, boxShadow: '0 0 0px rgba(0,255,255,0)' },
  hover: { scale: 1.02, boxShadow: '0 0 12px rgba(0,255,255,0.35)' },
  flip: { rotateY: 180, transition: { duration: 0.35 } }
}

const face = (state) => {
  switch (state) {
    case 'safe':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-cyan-300 text-2xl drop-shadow-[0_0_8px_#00ffff]">💎</span>
        </div>
      )
    case 'mine':
      return (
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-pink-500 text-2xl drop-shadow-[0_0_8px_#ff0040]">💣</span>
        </div>
      )
    default:
      return null
  }
}

export default function MinesGrid({ grid, onReveal, disabled }) {
  return (
    <div className="mx-auto" style={{ width: 600, maxWidth: '92vw' }}>
      <div className="grid grid-cols-5 gap-3 place-items-center">
        {grid.map((state, idx) => (
          <motion.button
            key={idx}
            className="relative w-[110px] h-[110px] max-w-[18vw] max-h-[18vw] rounded-xl bg-white/5 border border-white/10 backdrop-blur-md [transform-style:preserve-3d]"
            variants={tileVariants}
            initial="initial"
            whileHover={!disabled && state==='hidden' ? 'hover' : undefined}
            animate={state !== 'hidden' ? 'flip' : 'initial'}
            onClick={() => !disabled && state==='hidden' && onReveal(idx)}
            style={{ perspective: 800 }}
          >
            {/* front */}
            <div className="absolute inset-0 rounded-xl bg-white/[0.02] border border-cyan-400/10 [backface-visibility:hidden]" />
            {/* back */}
            <div className="absolute inset-0 rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gradient-to-br from-cyan-900/20 to-cyan-500/10">
              {face(state)}
            </div>
            {/* glow ring */}
            {state === 'safe' && (
              <motion.span
                className="absolute inset-0 rounded-xl"
                initial={{ boxShadow: '0 0 0px rgba(0,255,255,0)' }}
                animate={{ boxShadow: ['0 0 0px rgba(0,255,255,0)', '0 0 20px rgba(0,255,255,0.35)', '0 0 0px rgba(0,255,255,0)'] }}
                transition={{ duration: 0.9 }}
              />
            )}
            {state === 'mine' && (
              <motion.span
                className="absolute -inset-2 rounded-2xl"
                initial={{ boxShadow: '0 0 0px rgba(255,0,64,0)' }}
                animate={{ boxShadow: ['0 0 0px rgba(255,0,64,0)', '0 0 30px rgba(255,0,64,0.45)', '0 0 0px rgba(255,0,64,0)'] }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}


