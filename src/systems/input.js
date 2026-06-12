/**
 * input.js
 * --------
 * Sistema de entrada (teclado). Mapeia teclas para ações lógicas do jogo,
 * suportando os dois esquemas de controle (destro e canhoto) descritos na spec.
 *
 * Ações:
 *  - left / right : movimentação
 *  - jump         : pulo
 *  - attack       : ataque comum (X ou Enter)
 *  - power        : ataque especial (E)
 *  - lantern      : Lanterna de Éter (Espaço) - mantida pressionada
 *  - confirm      : confirmar em menus (Enter)
 */

export class Input {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      jump: false,
      attack: false,
      power: false,
      lantern: false,
    }
    // Eventos de "uma vez" (edge-triggered), consumidos pelo jogo
    this.pressed = {}
    this._bind()
  }

  _bind() {
    window.addEventListener('keydown', (e) => this._onKey(e, true))
    window.addEventListener('keyup', (e) => this._onKey(e, false))
  }

  _onKey(e, down) {
    const k = e.key
    switch (k) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keys.left = down
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keys.right = down
        break
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keys.jump = down
        e.preventDefault()
        break
      case ' ': // Espaço = Lanterna de Éter
        this.keys.lantern = down
        e.preventDefault()
        break
      case 'x':
      case 'X':
        this.keys.attack = down
        break
      case 'e':
      case 'E':
        this.keys.power = down
        break
      case 'Enter':
        this.keys.attack = down
        break
    }

    // Registra teclas pressionadas (edge) para uso em menus / toggles
    if (down) this.pressed[k] = true
  }

  /** Consome um "pressionamento único" de uma tecla. Retorna true só uma vez. */
  consume(key) {
    if (this.pressed[key]) {
      this.pressed[key] = false
      return true
    }
    return false
  }

  /** Verifica se qualquer uma das teclas de confirmação foi pressionada. */
  consumeConfirm() {
    return this.consume('Enter') || this.consume(' ')
  }
}
