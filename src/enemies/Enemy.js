/**
 * Enemy.js
 * --------
 * Fantasmas de Nanquim: inimigos comuns que patrulham uma área.
 * Tipos:
 *  - walker : anda no chão
 *  - flyer  : flutua em senoide pelo ar
 * Causam dano por contato com o jogador.
 */

import { CONFIG } from '../config/config.js'

export class Enemy {
  constructor(x, type, patrolStart, patrolEnd) {
    this.type = type
    this.w = 64
    this.h = 80
    this.y = type === 'flyer' ? 340 : 0 // y do walker é ajustado pela fase
    this.x = x
    this.vx = type === 'walker' ? 1 : 0.8
    this.vy = 0
    this.hp = 2
    this.maxHp = 2
    this.alive = true
    this.facingRight = true
    this.patrolStart = patrolStart
    this.patrolEnd = patrolEnd
    this.baseY = this.y
  }

  /** Define a posição vertical de base (usado por walkers ao nascer no chão). */
  setGroundY(y) {
    this.y = y - this.h
    this.baseY = this.y
  }

  update(dt, time) {
    if (!this.alive) return
    this.x += this.vx * CONFIG.ENEMY_SPEED_MULTIPLIER
    if (this.x <= this.patrolStart || this.x >= this.patrolEnd) {
      this.vx *= -1
      this.facingRight = this.vx > 0
    }
    if (this.type === 'flyer') {
      this.y = this.baseY + Math.sin(time * 2 + this.patrolStart) * 30
    }
  }

  hit(amount = 1) {
    this.hp -= amount
    if (this.hp <= 0) this.alive = false
    return !this.alive
  }
}
