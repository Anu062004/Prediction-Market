import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

type EventRow = {
  id: string
  question: string
  p_true?: number
}

export default function Markets() {
  const [rows, setRows] = useState<EventRow[]>([])

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get('/api/markets')
        setRows(res.data || [])
      } catch (e) {
        setRows([])
      }
    }
    load()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Markets</h1>
      <ul>
        {rows.map(r => (
          <li key={r.id}>
            <Link to={`/event/${r.id}`}>{r.question}</Link>
            {typeof r.p_true === 'number' && <span> — p_true: {r.p_true.toFixed(2)}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
