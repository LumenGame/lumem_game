/**
 * Game.js
 * -------
 * Cena principal e máquina de estados do jogo. Orquestra entidades,
 * sistemas, fases, easter eggs, HUD e salvamento.
 *
 * Estados:
 *  menu | playing | levelComplete | gameover | victory
 *
 * Fluxo de uma fase:
 *  buildLevel() monta plataformas, ocultas, inimigos, páginas, segredos e boss
 *  update() roda física/combate/lanterna; checa coleta, vitória e morte
 *  render() desenha tudo via Renderer + HUD
 */

import { CONFIG } from '../config/config.js'
import { Player } from '../player/Player.js'
import { Enemy } from '../enemies/Enemy.js'
import { Boss } from '../boss/Boss.js'
import { Platform, HiddenPlatform } from '../systems/Platform.js'
import { Collectible } from '../systems/Collectible.js'
import { LanternSystem } from '../systems/LanternSystem.js'
import { CombatSystem } from '../systems/CombatSystem.js'
import { ParticleSystem } from '../systems/particles.js'
import { Camera } from '../systems/camera.js'
import { Renderer } from '../ui/Renderer.js'
import { HUD } from '../ui/HUD.js'
import { SaveSystem } from '../save/save.js'
import { LEVELS } from './levels.js'
import { EASTER_EGGS } from './easterEggs.js'
import { dist } from '../systems/utils.js'

export class Game {
  constructor(ctx, input, assets = {}) {
    this.ctx = ctx
    this.input = input
    this.renderer = new Renderer(ctx, assets)
    this.hud = new HUD(ctx)
    this.particles = new ParticleSystem()
    this.combat = new CombatSystem(this.particles)
    this.lantern = new LanternSystem()
    this.camera = new Camera()

    this.state = 'menu'
    this.levelIndex = 0
    this.score = 0
    this.time = 0

    this.banner = null
    this.tipTimer = 0
    this.victoryPhase = 0
    this.victoryTimer = 0

    this.save = SaveSystem.load()
  }

  /** Inicia uma nova partida do começo (fase 1). */
  startNew() {
    this.levelIndex = 0
    this.score = 0
    this.buildLevel()
    this.state = 'playing'
  }

  /** Continua a partir da fase salva. */
  continueSaved() {
    this.levelIndex = Math.min(this.save.level || 0, LEVELS.length - 1)
    this.score = this.save.score || 0
    this.buildLevel()
    this.state = 'playing'
  }

  /** Monta todas as entidades da fase atual a partir da definição em LEVELS. */
  buildLevel() {
    const def = LEVELS[this.levelIndex]
    this.levelDef = def
    this.levelWidth = def.width

    // Plataformas normais
    this.platforms = def.platforms.map((p) => new Platform(p[0], p[1], p[2], p[3], p[4]))
    // Plataformas ocultas (reveladas pela Lanterna)
    for (const h of def.hidden || []) {
      this.platforms.push(new HiddenPlatform(h[0], h[1], h[2], h[3]))
    }

    // Inimigos
    this.enemies = (def.enemies || []).map((e) => {
      const enemy = new Enemy(e[0], e[1], e[2], e[3])
      if (e[1] === 'walker') enemy.setGroundY(CONFIG.GROUND_Y)
      return enemy
    })

    // Páginas
    this.collectibles = (def.pages || []).map((p) => new Collectible(p[0], p[1], 'page'))

    // Segredos / easter eggs
    this.secrets = []
    for (const key of def.secrets || []) {
      const egg = EASTER_EGGS[key] && EASTER_EGGS[key]({})
      if (!egg) continue
      // livros secretos (colecionáveis especiais)
      for (const b of egg.books || []) {
        const book = new Collectible(b.x, b.y, 'book')
        book.message = egg.message
        this.collectibles.push(book)
      }
      // objetos secretos revelados pela lanterna
      for (const s of egg.secrets || []) {
        this.secrets.push(s)
      }
      // páginas escondidas dentro de salas secretas
      for (const hp of egg.hiddenPages || []) {
        const page = new Collectible(hp.x, hp.y, 'page')
        page.hidden = true
        this.collectibles.push(page)
      }
    }

    // Total de páginas necessárias = páginas visíveis (não as escondidas em segredos)
    this.pagesTotal = this.collectibles.filter((c) => c.kind === 'page' && !c.hidden).length
    this.pagesCollected = 0

    // Chefão (fase final)
    this.boss = def.boss ? new Boss(def.boss.x, def.boss.y) : null

    // Jogador
    this.player = new Player(def.playerStart.x, def.playerStart.y)

    // Reset de sistemas
    this.combat.clear()
    this.particles.clear()
    this.camera.reset()
    this.banner = null
    this.tipTimer = 6
    this.time = 0
  }

  /** Reinicia apenas a fase atual (após game over). */
  restartLevel() {
    this.buildLevel()
    this.state = 'playing'
  }

  /** Mostra um banner temporário (easter egg / mensagem). */
  showBanner(title, text, seconds = 4) {
    this.banner = { title, text, timer: seconds }
  }

  // ===================== UPDATE =====================
  update(dt) {
    this.time += dt

    if (this.state !== 'playing') {
      this._updateNonPlaying(dt)
      return
    }

    const p = this.player

    // Lanterna de Éter (mecânica principal)
    this.lantern.update(dt, this.input.keys.lantern, p, this.platforms, this.collectibles, this.secrets)

    // Disparo de banners ao revelar segredos
    for (const s of this.secrets) {
      if (s.revealed && !s._announced && s.banner) {
        s._announced = true
        this.showBanner(s.banner.title, s.banner.text)
      }
    }

    // Jogador
    p.update(dt, this.input, this.platforms)

    // Queda em buraco -> perde um coração e respawn
    if (p.y > CONFIG.HEIGHT + 60) {
      if (p.damage(1)) this.particles.spawn(p.x, CONFIG.HEIGHT, '#c77dff', 10)
      p.x = Math.max(this.camera.x + 60, p.spawnX)
      p.y = 300
      p.vy = 0
    }
    p.x = Math.max(0, Math.min(p.x, this.levelWidth - p.w))

    // Ataque comum
    if (this.input.keys.attack && p.tryAttack()) {
      this.combat.playerAttack(p, this.enemies)
    }
    // Ataque especial
    if (this.input.keys.power && p.tryPower()) {
      this.combat.playerPower(p)
      this.showBanner('Ataque Especial!', 'A luz das paginas perdidas fere o Traca-Mundo!', 2.5)
    }

    // Inimigos
    for (const e of this.enemies) {
      e.update(dt, this.time)
      if (e.alive && p.invincibleTimer <= 0) {
        if (this._overlapPlayer(e)) {
          if (p.damage(1)) this.particles.spawn(p.cx, p.cy, '#c77dff', 8)
        }
      }
    }

    // Chefão
    if (this.boss && this.boss.alive) {
      const actions = this.boss.update(dt, p)
      if (actions.shoot.length) this.combat.addBossProjectiles(actions.shoot)
      if (actions.summon) this._summonGhost()
      if (p.invincibleTimer <= 0 && this._overlapPlayer(this.boss)) {
        if (p.damage(1)) this.particles.spawn(p.cx, p.cy, '#c77dff', 8)
      }
    }

    // Combate / projéteis
    const res = this.combat.update(dt, p, this.enemies, this.boss, this.camera.x)
    if (res.enemiesKilled) this.score += res.enemiesKilled * CONFIG.SCORE_PER_ENEMY
    if (res.bossKilled) this._onBossDefeated()

    // Coleta de páginas / livros
    this._checkCollectibles()

    // Partículas + câmera
    this.particles.update(dt)
    this.camera.follow(p, this.levelWidth)

    // Banner / dica
    if (this.banner) {
      this.banner.timer -= dt
      if (this.banner.timer <= 0) this.banner = null
    }
    if (this.tipTimer > 0) this.tipTimer -= dt

    // Condições de fim
    if (p.isDead()) this._onGameOver()
    else this._checkLevelComplete()
  }

  _updateNonPlaying(dt) {
    // Atualiza partículas em telas finais para efeito visual
    this.particles.update(dt)
    if (this.state === 'victory') this.victoryTimer += dt
  }

  _overlapPlayer(e) {
    const p = this.player
    return p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y
  }

  /** O chefão invoca um Fantasma de Nanquim perto de si. */
  _summonGhost() {
    if (!this.boss) return
    const e = new Enemy(this.boss.x - 80, 'flyer', this.boss.x - 300, this.boss.x + 100)
    this.enemies.push(e)
    this.particles.spawn(e.x, e.y, '#c77dff', 12)
  }

  /** Verifica coleta de páginas e livros secretos. */
  _checkCollectibles() {
    const p = this.player
    for (const c of this.collectibles) {
      if (c.collected) continue
      if (c.hidden && !c.revealed) continue
      if (dist(p.cx, p.cy, c.x, c.y) < c.radius + 22) {
        c.collected = true
        if (c.kind === 'book' && c.message) {
          // Easter egg: livro secreto
          this.showBanner(c.message.title, c.message.text, 5)
          this.score += 250
        } else {
          if (!c.hidden) this.pagesCollected++
          this.score += CONFIG.SCORE_PER_PAGE
          this.particles.spawn(c.x, c.y, '#ffd633', 8)
          // Desbloqueia o poder ao coletar todas as páginas obrigatórias
          if (this.pagesCollected >= this.pagesTotal) {
            this.player.powerReady = true
          }
        }
      }
    }
  }

  _onBossDefeated() {
    this.score += CONFIG.SCORE_BOSS
    this.state = 'victory'
    this.victoryPhase = 1
    this.victoryTimer = 0
    SaveSystem.save({ level: 0, score: this.score, pages: 0 })
  }

  _onGameOver() {
    this.state = 'gameover'
  }

  /** Conclui a fase quando todas as páginas foram coletadas (fases sem boss). */
  _checkLevelComplete() {
    if (this.boss) return // fase final termina ao derrotar o boss
    if (this.pagesCollected >= this.pagesTotal && this.pagesTotal > 0) {
      // exige chegar perto do fim da fase
      if (this.player.x > this.levelWidth - 200) {
        this.state = 'levelComplete'
        SaveSystem.save({ level: this.levelIndex + 1, score: this.score })
      }
    }
  }

  // ===================== INPUT (transições de estado) =====================
  handleMenuInput() {
    if (this.state === 'menu') {
      if (this.input.consumeConfirm()) this.startNew()
      else if (this.input.consume('c') || this.input.consume('C')) {
        if (this.save && this.save.level > 0) this.continueSaved()
      }
    } else if (this.state === 'levelComplete') {
      if (this.input.consumeConfirm()) {
        this.levelIndex++
        if (this.levelIndex >= LEVELS.length) {
          this.state = 'menu'
        } else {
          this.buildLevel()
          this.state = 'playing'
        }
      }
    } else if (this.state === 'gameover') {
      if (this.input.consumeConfirm()) this.restartLevel()
    } else if (this.state === 'victory') {
      if (this.victoryTimer > 3 && this.input.consumeConfirm()) {
        if (this.victoryPhase === 1) {
          this.victoryPhase = 2 // mostra a mensagem final
          this.victoryTimer = 0
        } else {
          this.save = SaveSystem.load()
          this.state = 'menu'
        }
      }
    }
  }

  // ===================== RENDER =====================
  render() {
    const ctx = this.ctx

    if (this.state === 'menu') {
      this.hud.drawMenu(this.save)
      return
    }
    if (this.state === 'victory') {
      this.hud.drawVictory(this.score, this.victoryPhase)
      return
    }

    // Cena
    this.renderer.drawBackground(this.camera.x)
    this.renderer.drawSecrets(this.secrets, this.camera.x)
    this.renderer.drawPlatforms(this.platforms, this.camera.x, this.lantern.active)
    this.renderer.drawCollectibles(this.collectibles, this.camera.x, this.time)
    this.renderer.drawEnemies(this.enemies, this.camera.x)
    this.renderer.drawBoss(this.boss, this.camera.x)
    this.renderer.drawProjectiles(this.combat.projectiles, this.camera.x)
    this.particles.render(ctx, this.camera.x)
    this.renderer.drawPlayer(this.player, this.camera.x)

    // Luz da Lanterna (sobreposição)
    this.renderer.drawLanternLight(this.player, this.camera.x, this.lantern.active)

    // HUD
    this.hud.draw({
      player: this.player,
      score: this.score,
      pagesCollected: this.pagesCollected,
      pagesTotal: this.pagesTotal,
      levelName: this.levelDef.name,
    })
    this.hud.drawTip(this.levelDef.tip, this.tipTimer)
    this.hud.drawBanner(this.banner)

    if (this.state === 'levelComplete') {
      const next = LEVELS[this.levelIndex + 1]
      this.hud.drawLevelComplete(this.levelDef.name, next ? next.name : 'Final')
    }
    if (this.state === 'gameover') {
      this.hud.drawGameOver(this.score)
    }
  }
}
