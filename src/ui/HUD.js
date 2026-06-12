/**
 * HUD.js
 * ------
 * Desenha a interface: corações (vidas), pontuação, contador de páginas,
 * energia da Lanterna, estado do poder especial e os banners de easter egg.
 * Também desenha as telas de menu, game over e vitória.
 */

import { CONFIG } from '../config/config.js'

export class HUD {
  constructor(ctx) {
    this.ctx = ctx
    this.W = CONFIG.WIDTH
    this.H = CONFIG.HEIGHT
  }

  /** Desenha um coração vetorial. cheio=true para coração preenchido. */
  _heart(x, y, size, filled) {
    const ctx = this.ctx
    ctx.save()
    ctx.translate(x, y)
    ctx.beginPath()
    const s = size
    ctx.moveTo(0, s * 0.3)
    ctx.bezierCurveTo(0, 0, -s * 0.5, 0, -s * 0.5, s * 0.35)
    ctx.bezierCurveTo(-s * 0.5, s * 0.65, 0, s * 0.85, 0, s)
    ctx.bezierCurveTo(0, s * 0.85, s * 0.5, s * 0.65, s * 0.5, s * 0.35)
    ctx.bezierCurveTo(s * 0.5, 0, 0, 0, 0, s * 0.3)
    ctx.closePath()
    if (filled) {
      ctx.fillStyle = '#e8536b'
      ctx.fill()
    } else {
      ctx.strokeStyle = '#6a3540'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    ctx.restore()
  }

  /** Desenha o HUD principal durante o jogo. */
  draw(state) {
    const ctx = this.ctx
    const { player, score, pagesCollected, pagesTotal, levelName } = state

    // Painel
    ctx.fillStyle = 'rgba(8,8,20,0.7)'
    ctx.fillRect(10, 10, 280, 96)
    ctx.strokeStyle = 'rgba(127,176,224,0.3)'
    ctx.strokeRect(10, 10, 280, 96)

    // Corações
    for (let i = 0; i < CONFIG.MAX_HEARTS; i++) {
      this._heart(40 + i * 30, 22, 20, i < player.hearts)
    }

    // Pontuação
    ctx.fillStyle = '#e6e6f0'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('Pontuacao: ' + score, 22, 66)

    // Páginas
    ctx.fillStyle = '#ffd633'
    ctx.font = '13px monospace'
    ctx.fillText('Paginas: ' + pagesCollected + ' / ' + pagesTotal, 22, 86)

    // Estado do poder especial
    ctx.font = 'bold 12px monospace'
    if (player.powerReady) {
      ctx.fillStyle = '#ffd633'
      ctx.fillText('PODER ESPECIAL PRONTO [E]', 22, 102)
    } else if (player.isUsingPower) {
      ctx.fillStyle = '#fff0a0'
      ctx.fillText('PODER ESPECIAL ATIVO!', 22, 102)
    } else {
      ctx.fillStyle = '#6a7a90'
      ctx.fillText('Poder: bloqueado', 22, 102)
    }

    // Barra de energia da Lanterna (canto superior direito)
    const lw = 160
    const lx = this.W - lw - 20
    ctx.fillStyle = 'rgba(8,8,20,0.7)'
    ctx.fillRect(lx - 10, 12, lw + 20, 40)
    ctx.fillStyle = '#aee3ff'
    ctx.font = '11px monospace'
    ctx.fillText('LANTERNA DE ETER [ESPACO]', lx, 26)
    ctx.fillStyle = '#16263a'
    ctx.fillRect(lx, 34, lw, 10)
    ctx.fillStyle = player.lanternOn ? '#7fd1ff' : '#4a90c0'
    ctx.fillRect(lx, 34, (player.lanternEnergy / CONFIG.LANTERN_MAX) * lw, 10)

    // Nome da fase (rodapé centralizado)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(200,210,230,0.6)'
    ctx.font = '12px monospace'
    ctx.fillText(levelName, this.W / 2, this.H - 16)
    ctx.textAlign = 'left'
  }

  /** Banner temporário de easter egg / mensagem secreta. */
  drawBanner(banner) {
    if (!banner) return
    const ctx = this.ctx
    const w = 560
    const x = (this.W - w) / 2
    const y = 90
    ctx.globalAlpha = Math.min(1, banner.timer)
    ctx.fillStyle = 'rgba(20,16,30,0.92)'
    ctx.fillRect(x, y, w, 70)
    ctx.strokeStyle = '#ffd633'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, 70)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffd633'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('* ' + banner.title + ' *', this.W / 2, y + 28)
    ctx.fillStyle = '#e6e6f0'
    ctx.font = '13px monospace'
    ctx.fillText(banner.text, this.W / 2, y + 52)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  }

  /** Dica de tutorial no início da fase. */
  drawTip(tip, timer) {
    if (!tip || timer <= 0) return
    const ctx = this.ctx
    ctx.globalAlpha = Math.min(1, timer)
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(8,8,20,0.8)'
    ctx.fillRect(this.W / 2 - 320, this.H - 90, 640, 40)
    ctx.fillStyle = '#aee3ff'
    ctx.font = '13px monospace'
    ctx.fillText(tip, this.W / 2, this.H - 64)
    ctx.textAlign = 'left'
    ctx.globalAlpha = 1
  }

  _gradientBg() {
    const ctx = this.ctx
    const grad = ctx.createLinearGradient(0, 0, 0, this.H)
    grad.addColorStop(0, '#0a0a14')
    grad.addColorStop(0.6, '#141426')
    grad.addColorStop(1, '#1d1d38')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, this.W, this.H)
  }

  /** Tela de menu inicial. */
  drawMenu(save) {
    const ctx = this.ctx
    this._gradientBg()
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, this.W, this.H)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffd633'
    ctx.font = 'bold 64px monospace'
    ctx.fillText('LUMEN', this.W / 2, this.H / 2 - 120)
    ctx.fillStyle = '#aee3ff'
    ctx.font = '16px monospace'
    ctx.fillText('A Biblioteca de Elin', this.W / 2, this.H / 2 - 86)

    ctx.fillStyle = '#c8d2e6'
    ctx.font = '14px monospace'
    ctx.fillText('Use a Lanterna de Eter para revelar o caminho,', this.W / 2, this.H / 2 - 40)
    ctx.fillText('recupere as Paginas Perdidas e derrote o Traca-Mundo.', this.W / 2, this.H / 2 - 18)

    // Controles
    ctx.fillStyle = '#8a96ac'
    ctx.font = '12px monospace'
    ctx.fillText('Mover: <- ->  ou  A D    |    Pular: ^ ou W', this.W / 2, this.H / 2 + 24)
    ctx.fillText('Lanterna: ESPACO    |    Atacar: X / Enter    |    Especial: E', this.W / 2, this.H / 2 + 44)

    if (save && save.highScore > 0) {
      ctx.fillStyle = '#ffd633'
      ctx.font = '13px monospace'
      ctx.fillText('Melhor pontuacao: ' + save.highScore, this.W / 2, this.H / 2 + 78)
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px monospace'
    const blink = Math.floor(Date.now() / 500) % 2 === 0
    if (blink) ctx.fillText('Pressione ENTER para comecar', this.W / 2, this.H / 2 + 118)
    if (save && save.level > 0) {
      ctx.fillStyle = '#aee3ff'
      ctx.font = '12px monospace'
      ctx.fillText('Pressione C para continuar (Fase ' + (save.level + 1) + ')', this.W / 2, this.H / 2 + 146)
    }
    ctx.textAlign = 'left'
  }

  /** Transição entre fases. */
  drawLevelComplete(levelName, nextName) {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(0,0,0,0.78)'
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#7fd1ff'
    ctx.font = 'bold 40px monospace'
    ctx.fillText('FASE CONCLUIDA', this.W / 2, this.H / 2 - 30)
    ctx.fillStyle = '#c8d2e6'
    ctx.font = '16px monospace'
    ctx.fillText(levelName, this.W / 2, this.H / 2 + 6)
    ctx.fillStyle = '#ffd633'
    ctx.font = '14px monospace'
    ctx.fillText('Proxima: ' + nextName, this.W / 2, this.H / 2 + 36)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('Pressione ENTER para continuar', this.W / 2, this.H / 2 + 76)
    ctx.textAlign = 'left'
  }

  /** Tela de game over. */
  drawGameOver(score) {
    const ctx = this.ctx
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#e8536b'
    ctx.font = 'bold 52px monospace'
    ctx.fillText('GAME OVER', this.W / 2, this.H / 2 - 20)
    ctx.fillStyle = '#c8d2e6'
    ctx.font = '16px monospace'
    ctx.fillText('A escuridao consumiu mais uma historia...', this.W / 2, this.H / 2 + 16)
    ctx.fillStyle = '#ffd633'
    ctx.fillText('Pontuacao: ' + score, this.W / 2, this.H / 2 + 44)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('Pressione ENTER para reiniciar a fase', this.W / 2, this.H / 2 + 84)
    ctx.textAlign = 'left'
  }

  /** Tela final de vitória com o plot twist. */
  drawVictory(score, phase) {
    const ctx = this.ctx
    this._gradientBg()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, this.W, this.H)
    ctx.textAlign = 'center'

    if (phase === 1) {
      ctx.fillStyle = '#ffd633'
      ctx.font = 'bold 44px monospace'
      ctx.fillText('ELIN RESTAURADA', this.W / 2, this.H / 2 - 60)
      ctx.fillStyle = '#c8d2e6'
      ctx.font = '15px monospace'
      ctx.fillText('O Traca-Mundo foi derrotado. As historias voltam a brilhar.', this.W / 2, this.H / 2 - 20)
      ctx.fillStyle = '#aee3ff'
      ctx.fillText('Alex desperta em sua mesa de trabalho...', this.W / 2, this.H / 2 + 10)
      ctx.fillText('Tera sido tudo um sonho?', this.W / 2, this.H / 2 + 32)
    } else {
      ctx.fillStyle = '#ffd633'
      ctx.font = 'italic bold 18px monospace'
      ctx.fillText('"Enquanto houver luz e memoria,', this.W / 2, this.H / 2 - 10)
      ctx.fillText('nenhuma historia sera esquecida."', this.W / 2, this.H / 2 + 16)
    }

    ctx.fillStyle = '#ffd633'
    ctx.font = '14px monospace'
    ctx.fillText('Pontuacao final: ' + score, this.W / 2, this.H / 2 + 78)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 15px monospace'
    const blink = Math.floor(Date.now() / 500) % 2 === 0
    if (blink) ctx.fillText('Pressione ENTER para voltar ao menu', this.W / 2, this.H / 2 + 112)
    ctx.textAlign = 'left'
  }
}
