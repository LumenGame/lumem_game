/**
 * Platform.js
 * -----------
 * Plataformas do cenário. Dois comportamentos:
 *  - Normais: sempre visíveis e sólidas (chão e plataformas flutuantes).
 *  - Ocultas (HiddenPlatform): começam invisíveis e atravessáveis
 *    (visible:false, solid:false). Quando iluminadas pela Lanterna de Éter
 *    passam a visible:true, solid:true. Conforme a spec do jogo.
 */

export class Platform {
  constructor(x, y, w, h, type = 'floating') {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.type = type // 'ground' | 'floating'
    this.visible = true
    this.solid = true
    this.hidden = false
  }
}

export class HiddenPlatform extends Platform {
  constructor(x, y, w, h, type = 'floating') {
    super(x, y, w, h, type)
    this.hidden = true
    this.visible = false
    this.solid = false
    this.litTimer = 0 // tempo restante "materializada" após sair da luz
  }
}
