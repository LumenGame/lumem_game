/**
 * Renderer.js
 * -----------
 * Responsável por todo o desenho no canvas: cenário, entidades, projéteis,
 * a luz da Lanterna de Éter e o HUD. Mantém a lógica de jogo separada do desenho.
 */

import { CONFIG } from '../config/config.js'

const PLAYER_WALK_FRAME_MS = 200
const ENEMY_WALK_FRAME_MS = 220
const BACKGROUND_DARKEN_ALPHA = 0.45

export class Renderer {
  constructor(ctx, assets = {}) {
    this.ctx = ctx
    this.assets = assets
    this.W = CONFIG.WIDTH
    this.H = CONFIG.HEIGHT
    this.ctx.imageSmoothingEnabled = false

  }

  _drawSprite(img, x, y, w, h) {
    if (!img) return false
    this.ctx.drawImage(img, x, y, w, h)
    return true
  }

  _drawPlatformImage(img, x, y, w, h) {
    if (!img) return false
    const ctx = this.ctx

    const tileWidth = img.width
    const tileHeight = img.height
    const drawHeight = Math.min(tileHeight, h)
    const drawY = y
    const sourceY = tileHeight - drawHeight

    for (let dx = 0; dx < w; dx += tileWidth) {
      const sliceWidth = Math.min(tileWidth, w - dx)
      ctx.drawImage(img, 0, sourceY, sliceWidth, drawHeight, x + dx, drawY, sliceWidth, drawHeight)
    }
    return true
  }

  /** Desenha o fundo: gradiente noturno + estrelas com parallax. */
  drawBackground(cameraX) {
    const ctx = this.ctx
    const bg = this.assets.background
    if (bg) {
      ctx.drawImage(bg, 0, 0, this.W, this.H)
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, this.H)
      grad.addColorStop(0, '#0a0a14')
      grad.addColorStop(0.6, '#141426')
      grad.addColorStop(1, '#1d1d38')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, this.W, this.H)

      // Estrelas
      ctx.fillStyle = 'rgba(220,225,255,0.45)'
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137 + 50) % this.W + (cameraX * 0.04) % this.W + this.W) % this.W
        const sy = (i * 89 + 30) % (this.H * 0.45)
        const s = (i % 3) + 1
        ctx.fillRect(sx, sy, s, s)
      }

      // Silhueta de estantes/ruínas ao fundo (parallax lento)
      ctx.fillStyle = 'rgba(40,40,70,0.5)'
      for (let i = 0; i < 14; i++) {
        const bx = ((i * 220 - cameraX * 0.25) % (this.W + 240) + this.W + 240) % (this.W + 240) - 120
        const bh = 120 + (i % 4) * 40
        ctx.fillRect(bx, this.H - bh - 100, 90, bh)
      }
    }

    // Escurece levemente o fundo para destacar personagem e gameplay.
    ctx.fillStyle = `rgba(0, 0, 0, ${BACKGROUND_DARKEN_ALPHA})`
    ctx.fillRect(0, 0, this.W, this.H)
  }

  drawPlatforms(platforms, cameraX, lanternActive) {
    const ctx = this.ctx
    for (const pl of platforms) {
      const px = pl.x - cameraX

      if (pl.hidden && !pl.visible) {
        // Dica fantasma de plataforma oculta apenas quando a lanterna está acesa
        if (lanternActive) {
          ctx.strokeStyle = 'rgba(120,200,255,0.25)'
          ctx.setLineDash([6, 6])
          ctx.strokeRect(px, pl.y, pl.w, pl.h)
          ctx.setLineDash([])
        }
        continue
      }

      if (pl.hidden) {
        if (this._drawPlatformImage(this.assets.tileMagic, px, pl.y, pl.w, pl.h)) continue

        ctx.fillStyle = 'rgba(90,180,255,0.85)'
        ctx.fillRect(px, pl.y, pl.w, pl.h)
        ctx.strokeStyle = '#aee3ff'
        ctx.lineWidth = 2
        ctx.strokeRect(px, pl.y, pl.w, pl.h)
      } else if (pl.type === 'ground') {
        const groundSprite = pl.w >= 180 ? this.assets.tileLong : pl.w >= 120 ? this.assets.tileMedium : this.assets.tileShort
        if (this._drawPlatformImage(groundSprite, px, pl.y, pl.w, pl.h)) continue

        ctx.fillStyle = '#2a3a5a'
        ctx.fillRect(px, pl.y, pl.w, pl.h)
        ctx.fillStyle = '#3a527a'
        ctx.fillRect(px, pl.y, pl.w, 6)
      } else {
        const floatingSprite = pl.w >= 180 ? this.assets.tileLong : this.assets.tileShort
        if (this._drawPlatformImage(floatingSprite, px, pl.y, pl.w, pl.h)) continue

        ctx.fillStyle = '#4a5578'
        ctx.fillRect(px, pl.y, pl.w, pl.h)
        ctx.fillStyle = '#6678a0'
        ctx.fillRect(px, pl.y, pl.w, 4)
      }
    }
  }

  /** Desenha segredos revelados (salas / placas dos easter eggs). */
  drawSecrets(secrets, cameraX) {
    const ctx = this.ctx
    for (const s of secrets) {
      if (!s.revealed) continue
      const x = s.x - cameraX
      if (s.kind === 'room') {
        ctx.fillStyle = 'rgba(70,55,40,0.85)'
        ctx.fillRect(x, s.y, s.w, s.h)
        ctx.strokeStyle = '#c9a86a'
        ctx.lineWidth = 2
        ctx.strokeRect(x, s.y, s.w, s.h)
        ctx.fillStyle = '#c9a86a'
        ctx.font = '12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('SALA SECRETA', x + s.w / 2, s.y + 20)
        ctx.textAlign = 'left'
      } else if (s.kind === 'plaque') {
        ctx.fillStyle = '#5a4a2a'
        ctx.fillRect(x, s.y, s.w, s.h)
        ctx.strokeStyle = '#e0c070'
        ctx.lineWidth = 2
        ctx.strokeRect(x, s.y, s.w, s.h)
      }
    }
  }

  /** Desenha páginas (e livros secretos) coletáveis. */
  drawCollectibles(items, cameraX, time) {
    const ctx = this.ctx
    for (const c of items) {
      if (c.collected) continue
      if (c.hidden && !c.revealed) continue
      const cx = c.x - cameraX
      const cy = c.floatY(time)

      if (c.kind === 'book') {
        // Livro dourado (easter egg)
        ctx.fillStyle = 'rgba(255,210,80,0.25)'
        ctx.beginPath()
        ctx.arc(cx, cy, c.radius + 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#d4a017'
        ctx.fillRect(cx - 12, cy - 14, 24, 28)
        ctx.fillStyle = '#ffe08a'
        ctx.fillRect(cx - 9, cy - 11, 18, 22)
        ctx.strokeStyle = '#7a5a00'
        ctx.lineWidth = 2
        ctx.strokeRect(cx - 12, cy - 14, 24, 28)
      } else {
        // Página perdida (brilho)
        ctx.fillStyle = 'rgba(255,225,120,0.25)'
        ctx.beginPath()
        ctx.arc(cx, cy, c.radius + 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#f4f0e0'
        ctx.fillRect(cx - 8, cy - 10, 16, 20)
        ctx.strokeStyle = '#caa84a'
        ctx.lineWidth = 1.5
        ctx.strokeRect(cx - 8, cy - 10, 16, 20)
        ctx.strokeStyle = '#caa84a'
        ctx.beginPath()
        ctx.moveTo(cx - 4, cy - 5)
        ctx.lineTo(cx + 4, cy - 5)
        ctx.moveTo(cx - 4, cy)
        ctx.lineTo(cx + 4, cy)
        ctx.moveTo(cx - 4, cy + 5)
        ctx.lineTo(cx + 4, cy + 5)
        ctx.stroke()
      }
    }
  }

  /** Desenha os Fantasmas de Nanquim (inimigos). */
  drawEnemies(enemies, cameraX) {
    const ctx = this.ctx
    for (const e of enemies) {
      if (!e.alive) continue
      const ex = e.x - cameraX
      const ecx = ex + e.w / 2
      const moving = Math.abs(e.vx) > 0.05
      const step = Math.floor(performance.now() / ENEMY_WALK_FRAME_MS) % 2
      let sprite = moving ? (step === 0 ? this.assets.enemyWalkA : this.assets.enemyWalkB) : this.assets.enemyWalkA
      if (!sprite) sprite = this.assets.enemy
      if (sprite) {
        ctx.save()
        if (!e.facingRight) {
          ctx.translate(ex + e.w / 2, 0)
          ctx.scale(-1, 1)
          ctx.translate(-(ex + e.w / 2), 0)
        }
        this.ctx.drawImage(sprite, ex, e.y, e.w, e.h)
        ctx.restore()

        // mantém barra de HP igual
        if (e.hp < e.maxHp) {
          this.ctx.fillStyle = '#311'
          this.ctx.fillRect(ex, e.y - 8, e.w, 4)
          this.ctx.fillStyle = '#7fd1ff'
          this.ctx.fillRect(ex, e.y - 8, (e.hp / e.maxHp) * e.w, 4)
        }
        continue
      }
      // Corpo fantasmagórico
      ctx.fillStyle = e.type === 'walker' ? 'rgba(60,80,130,0.92)' : 'rgba(120,80,150,0.92)'
      ctx.beginPath()
      ctx.arc(ecx, e.y + e.h * 0.4, e.w / 2, Math.PI, 0)
      ctx.lineTo(ex + e.w, e.y + e.h)
      // base ondulada
      ctx.lineTo(ex + e.w * 0.66, e.y + e.h - 6)
      ctx.lineTo(ex + e.w * 0.5, e.y + e.h)
      ctx.lineTo(ex + e.w * 0.33, e.y + e.h - 6)
      ctx.lineTo(ex, e.y + e.h)
      ctx.closePath()
      ctx.fill()

      // Olhos (de nanquim)
      ctx.fillStyle = '#0b0b14'
      const dir = e.facingRight ? 3 : -3
      ctx.beginPath()
      ctx.arc(ecx - 6 + dir, e.y + e.h * 0.4, 3.5, 0, Math.PI * 2)
      ctx.arc(ecx + 6 + dir, e.y + e.h * 0.4, 3.5, 0, Math.PI * 2)
      ctx.fill()

      // Barra de HP
      if (e.hp < e.maxHp) {
        ctx.fillStyle = '#311'
        ctx.fillRect(ex, e.y - 8, e.w, 4)
        ctx.fillStyle = '#7fd1ff'
        ctx.fillRect(ex, e.y - 8, (e.hp / e.maxHp) * e.w, 4)
      }
    }
  }

  /** Desenha o chefão Traça-Mundo. */
  drawBoss(boss, cameraX) {
    if (!boss || !boss.alive) return
    const ctx = this.ctx
    const bcx = boss.cx - cameraX
    const bcy = boss.cy
    const br = boss.w / 2

    if (this.assets.boss) {
      const x = boss.x - cameraX
      const flash = boss.invincibleTimer > 0 && Math.floor(boss.invincibleTimer * 20) % 2 === 0
      const sprite = boss.isAttacking && this.assets.bossAttack ? this.assets.bossAttack : this.assets.boss
      const drawW = boss.w
      const drawH = Math.round((sprite.height / sprite.width) * drawW)
      const drawY = boss.y + boss.h - drawH

      if (flash) this.ctx.globalAlpha = 0.5
      this.ctx.drawImage(sprite, x, drawY, drawW, drawH)
      this.ctx.globalAlpha = 1

      // mantém barra de HP já existente
      const bcx = boss.cx - cameraX
      const barW = 160
      const barX = bcx - barW / 2
      const barY = boss.y - 28
      this.ctx.fillStyle = '#300'
      this.ctx.fillRect(barX, barY, barW, 10)
      this.ctx.fillStyle = '#c0306a'
      this.ctx.fillRect(barX, barY, (boss.hp / boss.maxHp) * barW, 10)
      this.ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      this.ctx.strokeRect(barX, barY, barW, 10)
      this.ctx.fillStyle = '#e0a0c0'
      this.ctx.font = 'bold 11px monospace'
      this.ctx.textAlign = 'center'
      this.ctx.fillText('TRACA-MUNDO  -  FASE ' + boss.phase, bcx, barY - 6)
      this.ctx.textAlign = 'left'
      return
    }
    // Aura pulsante
    ctx.fillStyle = 'rgba(120,40,150,0.2)'
    ctx.beginPath()
    ctx.arc(bcx, bcy, br + 18 + Math.sin(Date.now() * 0.003) * 8, 0, Math.PI * 2)
    ctx.fill()

    // Corpo (traça/mariposa devoradora)
    ctx.fillStyle = '#3a2050'
    ctx.beginPath()
    ctx.arc(bcx, bcy, br, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#7a3aa0'
    ctx.lineWidth = 3
    ctx.stroke()

    // Asas
    ctx.fillStyle = 'rgba(90,50,120,0.8)'
    ctx.beginPath()
    ctx.ellipse(bcx - br, bcy, br * 0.8, br * 1.2, -0.4, 0, Math.PI * 2)
    ctx.ellipse(bcx + br, bcy, br * 0.8, br * 1.2, 0.4, 0, Math.PI * 2)
    ctx.fill()

    // Olhos vermelhos
    ctx.fillStyle = '#ff3344'
    ctx.beginPath()
    ctx.arc(bcx - 16, bcy - 10, 8, 0, Math.PI * 2)
    ctx.arc(bcx + 16, bcy - 10, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(bcx - 16, bcy - 10, 3, 0, Math.PI * 2)
    ctx.arc(bcx + 16, bcy - 10, 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1

    // Barra de HP grande
    const barW = 160
    const barX = bcx - barW / 2
    const barY = boss.y - 28
    ctx.fillStyle = '#300'
    ctx.fillRect(barX, barY, barW, 10)
    ctx.fillStyle = '#c0306a'
    ctx.fillRect(barX, barY, (boss.hp / boss.maxHp) * barW, 10)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.strokeRect(barX, barY, barW, 10)
    ctx.fillStyle = '#e0a0c0'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('TRACA-MUNDO  -  FASE ' + boss.phase, bcx, barY - 6)
    ctx.textAlign = 'left'
  }

  /** Desenha projéteis (jogador comum, especial e do chefão). */
  drawProjectiles(projectiles, cameraX) {
    const ctx = this.ctx
    for (const pr of projectiles) {
      if (!pr.alive) continue
      const prx = pr.x - cameraX
      const color = pr.fromBoss ? '#c77dff' : pr.special ? '#ffd633' : '#7fd1ff'
      ctx.fillStyle = color + '55'
      ctx.beginPath()
      ctx.arc(prx, pr.y, pr.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(prx, pr.y, pr.size * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /** Desenha Alex (o jogador) com indicadores de ataque/poder. */
  drawPlayer(player, cameraX) {
    const ctx = this.ctx
    const ppx = player.x - cameraX
    const moving = Math.abs(player.vx) > 0.25 && player.onGround
    const step = Math.floor(performance.now() / PLAYER_WALK_FRAME_MS) % 2

    let sprite = null
    if (player.lanternOn) {
      sprite = moving
        ? (step === 0 ? this.assets.playerWalkLampA : this.assets.playerWalkLampB)
        : this.assets.playerIdleLamp
      // fallback para chaves antigas
      if (!sprite) sprite = this.assets.playerLamp
    } else {
      sprite = moving ? (step === 0 ? this.assets.playerWalkA : this.assets.playerWalkB) : this.assets.playerIdle
      // fallback para chaves antigas
      if (!sprite) sprite = this.assets.player
    }

    if (sprite) {
      if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 12) % 2 === 0) {
        ctx.globalAlpha = 0.4
      }

      // Espelha o sprite quando o personagem está virado para a esquerda.
      ctx.save()
      if (!player.facingRight) {
        ctx.translate(ppx + player.w / 2, 0)
        ctx.scale(-1, 1)
        ctx.translate(-(ppx + player.w / 2), 0)
      }
      ctx.drawImage(sprite, ppx, player.y, player.w, player.h)
      ctx.restore()

      ctx.globalAlpha = 1

      if (player.isAttacking) {
        ctx.fillStyle = 'rgba(127,209,255,0.8)'
        const atkX = player.facingRight ? ppx + player.w : ppx - 18
        ctx.fillRect(atkX, player.y + 8, 18, player.h - 16)
      }

      if (player.powerReady || player.isUsingPower) {
        ctx.strokeStyle = player.isUsingPower ? '#ffd633' : 'rgba(255,214,51,0.5)'
        ctx.lineWidth = player.isUsingPower ? 3 : 1.5
        const ar = 32 + Math.sin(Date.now() * 0.005) * 5
        ctx.beginPath()
        ctx.arc(ppx + player.w / 2, player.y + player.h / 2, ar, 0, Math.PI * 2)
        ctx.stroke()
      }

      return
    }

    const flash = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 12) % 2 === 0
    if (flash) ctx.globalAlpha = 0.4

    // Corpo (bibliotecário de manto azul)
    ctx.fillStyle = '#3a6ea5'
    ctx.fillRect(ppx, player.y, player.w, player.h)
    ctx.fillStyle = '#2a5080'
    ctx.fillRect(ppx, player.y + player.h * 0.55, player.w, player.h * 0.45)
    ctx.strokeStyle = '#7fb0e0'
    ctx.lineWidth = 2
    ctx.strokeRect(ppx, player.y, player.w, player.h)

    // Rosto
    ctx.fillStyle = '#f0d0b0'
    ctx.fillRect(ppx + 6, player.y + 6, player.w - 12, 12)
    // Olhos
    const eyeX = player.facingRight ? ppx + player.w - 14 : ppx + 6
    ctx.fillStyle = '#1a1a2a'
    ctx.fillRect(eyeX, player.y + 9, 4, 4)
    ctx.fillRect(eyeX + 6, player.y + 9, 4, 4)

    // Indicador de ataque comum
    if (player.isAttacking) {
      ctx.fillStyle = 'rgba(127,209,255,0.8)'
      const atkX = player.facingRight ? ppx + player.w : ppx - 18
      ctx.fillRect(atkX, player.y + 8, 18, player.h - 16)
    }

    // Aura do poder especial
    if (player.powerReady || player.isUsingPower) {
      ctx.strokeStyle = player.isUsingPower ? '#ffd633' : 'rgba(255,214,51,0.5)'
      ctx.lineWidth = player.isUsingPower ? 3 : 1.5
      const ar = 32 + Math.sin(Date.now() * 0.005) * 5
      ctx.beginPath()
      ctx.arc(ppx + player.w / 2, player.y + player.h / 2, ar, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  /**
   * Desenha a luz da Lanterna de Éter como sobreposição.
   * Escurece a cena e abre um círculo de luz ao redor do jogador.
   */
  drawLanternLight(player, cameraX, active) {
    const ctx = this.ctx
    const lx = player.cx - cameraX
    const ly = player.cy

    if (active) {
      // Vinheta escura com furo de luz radial
      const r = CONFIG.LANTERN_RADIUS
      const g = ctx.createRadialGradient(lx, ly, r * 0.2, lx, ly, r * 1.8)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(0.5, 'rgba(0,0,0,0.45)')
      g.addColorStop(1, 'rgba(0,0,0,0.78)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, this.W, this.H)

      // Brilho central da lanterna
      const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, r)
      glow.addColorStop(0, 'rgba(160,210,255,0.35)')
      glow.addColorStop(1, 'rgba(160,210,255,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(lx, ly, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
