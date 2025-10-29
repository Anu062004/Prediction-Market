import Phaser from 'phaser'

// Simple seeded RNG using crypto
function randomInt(max: number) {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}

const GRID = 5
const TILE_SIZE = 80
const GAP = 8

type Tile = { r: number, c: number, rect: Phaser.GameObjects.Rectangle, revealed: boolean, mine: boolean }

type RoundState = {
  active: boolean
  tiles: Tile[]
  minesSet: Set<string>
  minesCount: number
  multiplier: number
  stake: number
}

const state: RoundState = {
  active: false,
  tiles: [],
  minesSet: new Set(),
  minesCount: 5,
  multiplier: 1,
  stake: 0
}

function getBalance(): number {
  const v = localStorage.getItem('mines.balance')
  return v ? parseFloat(v) : 1000
}

function setBalance(b: number) {
  localStorage.setItem('mines.balance', b.toFixed(2))
  const el = document.getElementById('balance')!
  el.textContent = b.toFixed(2)
}

function toast(msg: string) {
  const t = document.getElementById('toast')!
  t.textContent = msg
  t.style.display = 'block'
  setTimeout(() => (t.style.display = 'none'), 1400)
}

class MinesScene extends Phaser.Scene {
  gridOriginX = 100
  gridOriginY = 120

  create() {
    setBalance(getBalance())
    this.drawGrid()
    this.bindUI()
  }

  bindUI() {
    const start = document.getElementById('start') as HTMLButtonElement
    const cashout = document.getElementById('cashout') as HTMLButtonElement
    const reset = document.getElementById('reset') as HTMLButtonElement
    const mines = document.getElementById('mines') as HTMLInputElement

    start.onclick = () => this.startRound()
    cashout.onclick = () => this.cashOut()
    reset.onclick = () => this.resetRound(true)
    mines.onchange = () => {
      const m = Math.max(1, Math.min(10, parseInt(mines.value || '5')))
      mines.value = String(m)
      state.minesCount = m
      if (!state.active) this.resetRound(false)
    }
  }

  startRound() {
    if (state.active) return
    const betEl = document.getElementById('bet') as HTMLInputElement
    const start = document.getElementById('start') as HTMLButtonElement
    const cashout = document.getElementById('cashout') as HTMLButtonElement

    const bet = Math.max(1, parseFloat(betEl.value || '1'))
    const balance = getBalance()
    if (bet > balance) { toast('Insufficient balance'); return }

    setBalance(balance - bet)
    state.active = true
    state.stake = bet
    state.multiplier = 1

    this.placeMines()
    start.disabled = true
    cashout.disabled = false
    toast('Round started')
  }

  cashOut() {
    if (!state.active) return
    const cash = state.stake * state.multiplier
    setBalance(getBalance() + cash)
    toast(`Cashed out: +${cash.toFixed(2)}`)
    this.endRound()
  }

  endRound() {
    const start = document.getElementById('start') as HTMLButtonElement
    const cashout = document.getElementById('cashout') as HTMLButtonElement
    state.active = false
    state.stake = 0
    state.minesSet.clear()
    state.tiles.forEach(t => { t.revealed = false; t.rect.fillColor = 0x26323f })
    start.disabled = false
    cashout.disabled = true
  }

  resetRound(showToast: boolean) {
    if (showToast) toast('Reset grid')
    this.endRound()
  }

  placeMines() {
    state.minesSet.clear()
    const total = GRID * GRID
    while (state.minesSet.size < state.minesCount) {
      const idx = randomInt(total)
      const r = Math.floor(idx / GRID)
      const c = idx % GRID
      state.minesSet.add(`${r},${c}`)
    }
  }

  drawGrid() {
    state.tiles = []
    const baseX = this.gridOriginX
    const baseY = this.gridOriginY
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = baseX + c * (TILE_SIZE + GAP)
        const y = baseY + r * (TILE_SIZE + GAP)
        const rect = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0x26323f).setInteractive()
        const tile: Tile = { r, c, rect, revealed: false, mine: false }
        rect.on('pointerdown', () => this.onTile(tile))
        state.tiles.push(tile)
      }
    }
  }

  onTile(tile: Tile) {
    if (!state.active || tile.revealed) return
    tile.revealed = true

    const key = `${tile.r},${tile.c}`
    const isMine = state.minesSet.has(key)
    if (isMine) {
      tile.rect.fillColor = 0x8b0000
      toast(`Boom! Lost ${state.stake.toFixed(2)}`)
      this.endRound()
      return
    }

    tile.rect.fillColor = 0x2e8b57
    // Simple multiplier growth per safe click based on mines density
    const growth = Math.max(0.05, Math.min(0.35, state.minesCount / 20))
    state.multiplier = parseFloat((state.multiplier * (1 + growth)).toFixed(3))
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1000,
  height: 720,
  backgroundColor: '#0b0f14',
  parent: 'app',
  scene: [MinesScene]
})
