/**
 * LanternSystem.js
 * ----------------
 * Sistema da Lanterna de Éter - mecânica principal do jogo.
 *
 * Enquanto o jogador segura Espaço (e há energia), um raio de luz circular
 * é projetado a partir dele. Tudo dentro do raio que esteja "oculto"
 * (HiddenPlatform, salas/objetos secretos) é materializado:
 *    visible: false, solid: false  ->  visible: true, solid: true
 *
 * Plataformas ocultas permanecem materializadas por um curto período
 * (litTimer) após saírem da luz, para permitir que o jogador passe por elas.
 *
 * A lanterna consome energia ao ficar acesa e recarrega quando apagada.
 */

import { CONFIG } from '../config/config.js'
import { dist } from './utils.js'

const LINGER = 3.0 // segundos que uma plataforma fica sólida após sair da luz

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

export class LanternSystem {
  constructor() {
    this.active = false
    this.exhausted = false
    this.radius = CONFIG.LANTERN_RADIUS
  }

  /**
   * Atualiza o estado da lanterna e revela objetos ocultos.
   * @param {boolean} wantOn - jogador está segurando Espaço
   * @param {Player} player
   * @param {Platform[]} platforms
   * @param {Collectible[]} collectibles
   * @param {Object[]} secrets - objetos com {x,y,w,h,revealed}
   */
  update(dt, wantOn, player, platforms, collectibles, secrets = []) {
    // Gestão de energia
    if (wantOn && !this.exhausted && player.lanternEnergy > 0) {
      this.active = true
      player.lanternEnergy = Math.max(0, player.lanternEnergy - CONFIG.LANTERN_DRAIN * dt)
      if (player.lanternEnergy <= 0) {
        this.active = false
        this.exhausted = true
      }
    } else {
      this.active = false
      if (!wantOn) this.exhausted = false
      player.lanternEnergy = Math.min(CONFIG.LANTERN_MAX, player.lanternEnergy + CONFIG.LANTERN_REGEN * dt)
    }
    player.lanternOn = this.active

    const lx = player.cx
    const ly = player.cy

    // Revela plataformas ocultas dentro do raio
    for (const pl of platforms) {
      if (!pl.hidden) continue
      const closestX = clamp(lx, pl.x, pl.x + pl.w)
      const closestY = clamp(ly, pl.y, pl.y + pl.h)
      const inLight = this.active && dist(lx, ly, closestX, closestY) < this.radius
      if (inLight) {
        pl.visible = true
        pl.solid = true
        pl.litTimer = LINGER
      } else if (pl.litTimer > 0) {
        pl.litTimer -= dt
        if (pl.litTimer <= 0) {
          pl.visible = false
          pl.solid = false
        }
      }
    }

    // Revela páginas escondidas (em salas secretas)
    for (const c of collectibles) {
      if (!c.hidden || c.revealed) continue
      if (this.active && dist(lx, ly, c.x, c.y) < this.radius) {
        c.revealed = true
      }
    }

    // Revela objetos secretos (easter eggs)
    for (const s of secrets) {
      if (s.revealed) continue
      if (this.active && dist(lx, ly, s.x + (s.w || 0) / 2, s.y + (s.h || 0) / 2) < this.radius) {
        s.revealed = true
        if (typeof s.onReveal === 'function') s.onReveal()
      }
    }
  }
}
