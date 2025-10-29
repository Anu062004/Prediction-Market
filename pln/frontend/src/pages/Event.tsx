import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function kellyFraction(p: number, odds: number) {
  const f = p - (1 - p) / (odds - 1)
  return Math.max(0, Math.min(0.25, f))
}

export default function Event() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [stake, setStake] = useState(10)

  useEffect(() => {
    axios.get(`/api/markets/${id}`).then(r => setEvent(r.data)).catch(() => setEvent(null))
  }, [id])

  const suggestion = useMemo(() => {
    const p = event?.p_true ?? 0.5
    const odds = p > 0 ? Math.max(1.01, 1 / p) : 2
    const f = kellyFraction(p, odds)
    return { odds: Number(odds.toFixed(2)), fraction: Number(f.toFixed(2)), stake: Number((stake * f).toFixed(2)) }
  }, [event, stake])

  if (!event) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ padding: 24 }}>
      <h1>{event.question}</h1>
      <div>p_true: {(event.p_true ?? 0.5).toFixed(2)} | odds≈ {suggestion.odds}</div>
      <div style={{ marginTop: 12 }}>
        <label>
          Bankroll: <input type="number" value={stake} onChange={e => setStake(Number(e.target.value))} />
        </label>
        <div>Suggested Kelly stake: {suggestion.stake} ({suggestion.fraction * 100}%)</div>
      </div>
      <hr />
      <h3>Commit</h3>
      <p>Commit–reveal flow will be wired to Linera contracts in the next step.</p>
    </div>
  )
}
