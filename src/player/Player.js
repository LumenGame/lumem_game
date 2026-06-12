/**
 * Player.js
 * ---------
 * Classe do protagonista Alex. Responsável por:
 *  - Movimento lateral, pulo e gravidade
 *  - Colisão com plataformas (sólidas)
 *  - Ataque comum e ataque especial
 *  - Estado de vidas (corações) e invencibilidade
 *  - Energia da Lanterna de Éter
 */

import { CONFIG } from '../config/config.js'
import { overlap } from '../systems/utils.js'

export class Player {
  constructor(x, y) {
    this.spawnX = x
    this.spawnY = y
    this.reset()
  }

  /** Reinicia o jogador para o estado inicial da fase. */
  reset() {
    this.x = this.spawnX
    this.y = this.spawnY
    this.vx = 0
    this.vy = 0
    this.w = 45
    this.h = 60
    this.facingRight = true
    this.onGround = false

    // Vidas
    this.hearts = CONFIG.MAX_HEARTS
    this.invincibleTimer = 0

    // Ataque comum
    this.isAttacking = false
    this.attackTimer = 0
    this.attackCooldown = 0

    // Ataque especial
    this.powerReady = false
    this.isUsingPower = false
    this.powerTimer = 0

    // Lanterna de Éter
    this.lanternOn = false
    this.lanternEnergy = CONFIG.LANTERN_MAX
  }

  get cx() {
    return this.x + this.w / 2
  }
  get cy() {
    return this.y + this.h / 2
  }

  /** Atualiza física e estados temporais do jogador. */
  update(dt, input, platforms) {
    // --- Movimento horizontal ---
    if (input.keys.left) {
      this.vx = -CONFIG.PLAYER_SPEED
      this.facingRight = false
    } else if (input.keys.right) {
      this.vx = CONFIG.PLAYER_SPEED
      this.facingRight = true
    } else {
      this.vx *= 0.7 // atrito
    }

    // --- Pulo ---
    if (input.keys.jump && this.onGround) {
      this.vy = CONFIG.JUMP_FORCE
      this.onGround = false
    }

    // --- Gravidade ---
    this.vy += CONFIG.GRAVITY
    this.x += this.vx
    this.y += this.vy

    // --- Colisão com plataformas sólidas ---
    this.onGround = false
    for (const pl of platforms) {
      if (!pl.solid) continue // plataformas ocultas não iluminadas são atravessáveis
      if (overlap(this.x, this.y, this.w, this.h, pl.x, pl.y, pl.w, pl.h)) {
        if (this.vy > 0 && this.y + this.h - this.vy <= pl.y + 6) {
          // Pousando em cima
          this.y = pl.y - this.h
          this.vy = 0
          this.onGround = true
        } else if (this.vy < 0 && this.y - this.vy >= pl.y + pl.h - 6) {
          // Batendo a cabeça
          this.y = pl.y + pl.h
          this.vy = 0
        }
      }
    }

    // --- Timers ---
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt
    if (this.attackCooldown > 0) this.attackCooldown -= dt

    if (this.isAttacking) {
      this.attackTimer -= dt
      if (this.attackTimer <= 0) this.isAttacking = false
    }
    if (this.isUsingPower) {
      this.powerTimer -= dt
      if (this.powerTimer <= 0) this.isUsingPower = false
    }
  }

  /** Tenta iniciar um ataque comum. Retorna true se disparou. */
  tryAttack() {
    if (this.isAttacking || this.attackCooldown > 0) return false
    this.isAttacking = true
    this.attackTimer = CONFIG.ATTACK_DURATION
    this.attackCooldown = CONFIG.ATTACK_COOLDOWN
    return true
  }

  /** Tenta iniciar o ataque especial (apenas se carregado). Retorna true se disparou. */
  tryPower() {
    if (!this.powerReady || this.isUsingPower) return false
    this.isUsingPower = true
    this.powerTimer = CONFIG.POWER_DURATION
    this.powerReady = false
    return true
  }

  /** Aplica dano (remove um coração) respeitando a invencibilidade. */
  damage(amount = 1) {
    if (this.invincibleTimer > 0) return false
    this.hearts -= amount
    this.invincibleTimer = CONFIG.INVINCIBLE_DURATION
    return true
  }

  isDead() {
    return this.hearts <= 0
  }
}
