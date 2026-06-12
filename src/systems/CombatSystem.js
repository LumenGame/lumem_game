/**
 * CombatSystem.js
 * ---------------
 * Gerencia projéteis (do jogador e do chefão) e resolve as colisões de combate.
 *
 *  - Ataque comum: curto alcance + dispara um projétil fraco. Dano básico em inimigos.
 *  - Ataque especial: leque de projéteis poderosos. Único que fere o Traça-Mundo.
 *  - Projéteis do chefão: ferem o jogador.
 */

import { CONFIG } from '../config/config.js'
import { overlap, dist } from './utils.js'

export class CombatSystem {
  constructor(particles) {
    this.projectiles = []
    this.particles = particles
  }

  clear() {
    this.projectiles.length = 0
  }

  /** Ataque comum: golpe corpo-a-corpo + projétil curto. */
  playerAttack(player, enemies) {
    const dir = player.facingRight ? 1 : -1
    const ax = player.facingRight ? player.x + player.w : player.x - CONFIG.ATTACK_RANGE
    let killed = 0
    for (const e of enemies) {
      if (!e.alive) continue
      if (overlap(ax, player.y, CONFIG.ATTACK_RANGE, player.h, e.x, e.y, e.w, e.h)) {
        if (e.hit(1)) {
          killed++
          this.particles.spawn(e.x + e.w / 2, e.y + e.h / 2, '#7fd1ff', 8)
        }
      }
    }
    this.projectiles.push({
      x: player.cx,
      y: player.cy,
      vx: dir * 7,
      vy: 0,
      fromBoss: false,
      fromPlayer: true,
      special: false,
      alive: true,
      size: 8,
    })
    return killed
  }

  /** Ataque especial: leque de projéteis dourados de alto dano. */
  playerPower(player) {
    const dir = player.facingRight ? 1 : -1
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * 0.7 - 0.35
      this.projectiles.push({
        x: player.cx,
        y: player.cy,
        vx: dir * (8 + i * 0.4),
        vy: Math.sin(angle) * 4,
        fromBoss: false,
        fromPlayer: true,
        special: true,
        alive: true,
        size: 12,
      })
    }
    this.particles.spawn(player.cx, player.cy, '#ffd633', 24)
  }

  /** Adiciona projéteis disparados pelo chefão. */
  addBossProjectiles(list) {
    for (const p of list) {
      this.projectiles.push({ ...p, fromPlayer: false, special: false, alive: true })
    }
  }

  /**
   * Atualiza projéteis e resolve colisões.
   * @returns {Object} resultado { bossKilled, enemiesKilled, bossDamage }
   */
  update(dt, player, enemies, boss, cameraX) {
    const result = { bossKilled: false, enemiesKilled: 0, bossDamage: 0 }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]
      if (!p.alive) {
        this.projectiles.splice(i, 1)
        continue
      }
      p.x += p.vx
      p.y += p.vy
      if (p.fromBoss) p.vy += 0.05 // gravidade leve nos projéteis do boss

      // Fora da tela
      if (p.y > CONFIG.HEIGHT + 40 || p.x < cameraX - 60 || p.x > cameraX + CONFIG.WIDTH + 60) {
        p.alive = false
        continue
      }

      // Projétil do chefão atinge o jogador
      if (p.fromBoss && player.invincibleTimer <= 0) {
        if (dist(p.x, p.y, player.cx, player.cy) < p.size + 14) {
          if (player.damage(1)) {
            p.alive = false
            this.particles.spawn(p.x, p.y, '#c77dff', 6)
          }
        }
      }

      // Projétil do jogador
      if (p.fromPlayer) {
        // contra inimigos
        for (const e of enemies) {
          if (!e.alive) continue
          if (overlap(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, e.x, e.y, e.w, e.h)) {
            if (e.hit(p.special ? 2 : 1)) {
              result.enemiesKilled++
              this.particles.spawn(e.x + e.w / 2, e.y + e.h / 2, '#7fd1ff', 8)
            }
            p.alive = false
            break
          }
        }
        // contra o chefão (somente o especial causa dano relevante)
        if (p.alive && boss && boss.alive) {
          if (overlap(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, boss.x, boss.y, boss.w, boss.h)) {
            const dmg = p.special ? 3 : 0.25
            const killed = boss.hit(dmg)
            if (boss.invincibleTimer >= 0.14) result.bossDamage += dmg
            p.alive = false
            this.particles.spawn(p.x, p.y, p.special ? '#ffd633' : '#7fd1ff', 5)
            if (killed) {
              result.bossKilled = true
              this.particles.spawn(boss.cx, boss.cy, '#ffd633', 36)
            }
          }
        }
      }
    }

    return result
  }
}
