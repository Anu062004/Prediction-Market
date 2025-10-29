import Phaser from 'phaser'
import axios from 'axios'

const GRID = 5

class MinesScene extends Phaser.Scene {
  roundId: string | null = null
  serverSeedHash: string | null = null

  create() {
    this.add.text(10, 10, 'Mines Demo', { color: '#0f0' })
    this.startRound()
    this.drawGrid()
  }

  async startRound() {
    const res = await axios.post('/api/games/mines/rounds')
    this.roundId = res.data.roundId
    this.serverSeedHash = res.data.serverSeedHash
    console.log('Round started', this.roundId, this.serverSeedHash)
  }

  drawGrid() {
    const size = 60
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const x = 100 + c * (size + 6)
        const y = 100 + r * (size + 6)
        const rect = this.add.rectangle(x, y, size, size, 0x333333).setInteractive()
        rect.on('pointerdown', () => this.onCell(r, c, rect))
      }
    }
  }

  async onCell(r: number, c: number, rect: Phaser.GameObjects.Rectangle) {
    if (!this.roundId) return
    try {
      await axios.post(`/api/games/mines/rounds/${this.roundId}/bet`, { amount: 1, choice: `${r},${c}`, userId: 'demo' })
      rect.fillColor = 0x2e8b57
    } catch (e) {
      rect.fillColor = 0x8b0000
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111',
  parent: 'app',
  scene: [MinesScene]
})
