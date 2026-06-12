import { CONFIG } from './config/config.js'
import { Input } from './systems/input.js'
import { Game } from './scenes/Game.js'

const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

let game = null
const input = new Input()
let lastTime = performance.now()

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = path
  })
}

async function loadAssets() {
  async function tryLoad(path) {
    try {
      return await loadImage(path)
    } catch {
      return null
    }
  }

  return {
    background: await tryLoad(new URL('../assets/ui/Background_Lumen.png', import.meta.url).href),

    playerIdle: await tryLoad(new URL('../assets/player/p_p_idle.png', import.meta.url).href),
    playerWalkA: await tryLoad(new URL('../assets/player/p_p_walk.png', import.meta.url).href),
    playerWalkB: await tryLoad(new URL('../assets/player/p_p_walk1.png', import.meta.url).href),
    playerIdleLamp: await tryLoad(new URL('../assets/player/p_p_idle_lamp.png', import.meta.url).href),
    playerWalkLampA: await tryLoad(new URL('../assets/player/p_p_walk_lamp.png', import.meta.url).href),
    playerWalkLampB: await tryLoad(new URL('../assets/player/p_p_walk_lamp2.png', import.meta.url).href),

    // Compatibilidade com chaves antigas usadas no renderer.
    player: await tryLoad(new URL('../assets/player/p_p_walk.png', import.meta.url).href),
    playerLamp: await tryLoad(new URL('../assets/player/p_p_walk_lamp.png', import.meta.url).href),

    enemyWalkA: await tryLoad(new URL('../assets/enemies/Fantasma_nanquim.png', import.meta.url).href),
    enemyWalkB: await tryLoad(new URL('../assets/enemies/Fantasma_nanquim1.png', import.meta.url).href),
    enemy: await tryLoad(new URL('../assets/enemies/Fantasma_nanquim.png', import.meta.url).href),
    boss: await tryLoad(new URL('../assets/boss/traca_mundo_idle.png', import.meta.url).href),
    bossAttack: await tryLoad(new URL('../assets/boss/traca_mundo_atack.png', import.meta.url).href),

    tileShort: await tryLoad(new URL('../assets/tiles/tile_visible_short.png', import.meta.url).href),
    tileMedium: await tryLoad(new URL('../assets/tiles/tile_visible_medium.png', import.meta.url).href),
    tileLong: await tryLoad(new URL('../assets/tiles/tile_visible_long.png', import.meta.url).href),
    tileMagic: (await tryLoad(new URL('../assets/tiles/tile_magic.png', import.meta.url).href)) || (await tryLoad(new URL('../assets/tiles/tile_magic1.png', import.meta.url).href)),
  }
}

function loop() {
  if (!game) return
  const now = performance.now()
  const dt = Math.min((now - lastTime) / 1000, 0.05)
  lastTime = now

  game.handleMenuInput()
  game.update(dt)
  game.render()

  requestAnimationFrame(loop)
}

async function start() {
  canvas.width = CONFIG.WIDTH
  canvas.height = CONFIG.HEIGHT

  const assets = await loadAssets()
  game = new Game(ctx, input, assets)

  requestAnimationFrame(loop)
}

start()

