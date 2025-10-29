import 'dotenv/config'
import axios from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:8002'
const POLL_MS = Number(process.env.POLL_MS || 10000)

async function updateLoop() {
  try {
    const { data } = await axios.post(`${API_URL}/update_probabilities`, { eventIds: [] })
    for (const upd of data.updated || []) {
      await updateEventProbability(upd.eventId, upd.p_true)
    }
  } catch (err) {
    console.error('update_probabilities failed:', (err as any)?.message)
  }
}

async function updateEventProbability(eventId: string, p: number) {
  // placeholder: replace with real Linera call
  console.log(`[bridge] update_event_probability(${eventId}) p=${p.toFixed(3)}`)
}

async function main() {
  console.log('[bridge] starting, API =', API_URL)
  setInterval(updateLoop, POLL_MS)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
