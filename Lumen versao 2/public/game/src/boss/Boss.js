/**
 * Boss.js
 * -------
 * Traça-Mundo: o chefão final. Possui múltiplas fases (quanto menor o HP,
 * mais agressivo), dispara projéteis e invoca Fantasmas de Nanquim.
 * Só pode ser derrotado com o Ataque Especial de Alex.
 */

import { CONFIG } from '../config/config.js'

export class Boss {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.w = 90
    this.h = 90
    this.maxHp = 24
    this.hp = this.maxHp
    this.alive = true
    this.phase = 1
    this.attackTimer = 0
    this.attackState = 0
    this.attackDuration = 0.22
    this.invincibleTimer = 0
    this.summonTimer = 5
  }

  get cx() {
    return this.x + this.w / 2
  }
  get cy() {
    return this.y + this.h / 2
  }

  /**
   * Atualiza o chefão.
   * @returns {Object} ações: { shoot: [...projéteis], summon: bool }
   */
  update(dt, player) {
    const actions = { shoot: [], summon: false }
    if (!this.alive) return actions

    if (this.attackState > 0) {
      this.attackState -= dt
      if (this.attackState < 0) this.attackState = 0
    }
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt

    // Fases: 1 (>50% HP), 2 (25-50%), 3 (<25%)
    if (this.hp > this.maxHp * 0.5) this.phase = 1
    else if (this.hp > this.maxHp * 0.25) this.phase = 2
    else this.phase = 3

    // Ataque à distância
    this.attackTimer -= dt
    if (this.attackTimer <= 0) {
      this.attackTimer = CONFIG.BOSS_ATTACK_INTERVAL / this.phase
      this.attackState = this.attackDuration
      const dir = player.x > this.x ? 1 : -1
      actions.shoot.push({
        x: this.cx,
        y: this.y + 40,
        vx: dir * (4 + this.phase),
        vy: -1,
        fromBoss: true,
        size: 12,
      })
      // Ataque em leque nas fases avançadas
      if (this.phase >= 2) {
        actions.shoot.push({ x: this.cx, y: this.y + 55, vx: dir * 4, vy: -3.5, fromBoss: true, size: 9 })
      }
      if (this.phase >= 3) {
        actions.shoot.push({ x: this.cx, y: this.y + 55, vx: dir * 6, vy: 1, fromBoss: true, size: 9 })
      }
    }

    // Invocação de Fantasmas de Nanquim
    this.summonTimer -= dt
    if (this.summonTimer <= 0) {
      this.summonTimer = 8 - this.phase * 1.5
      actions.summon = true
    }

    return actions
  }

  get isAttacking() {
    return this.attackState > 0
  }

  /** Recebe dano (somente do ataque especial causa dano relevante). */
  hit(amount) {
    if (this.invincibleTimer > 0) return false
    this.hp -= amount
    this.invincibleTimer = 0.15
    if (this.hp <= 0) {
      this.hp = 0
      this.alive = false
      return true // derrotado
    }
    return false
  }
}
