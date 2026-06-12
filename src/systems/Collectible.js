/**
 * Collectible.js
 * --------------
 * Páginas Perdidas - colecionáveis que somam pontos, atualizam o HUD
 * e contam para o desbloqueio do Ataque Especial.
 *
 * Suporta um tipo especial "book" usado nos easter eggs (livro secreto).
 */

export class Collectible {
  constructor(x, y, kind = 'page') {
    this.x = x
    this.y = y
    this.kind = kind // 'page' | 'book'
    this.collected = false
    this.radius = kind === 'book' ? 16 : 12
    this.floatOffset = Math.random() * Math.PI * 2
    this.floatSpeed = 1.5 + Math.random()
    // Páginas dentro de salas secretas só aparecem quando iluminadas
    this.hidden = false
    this.revealed = false
  }

  /** Retorna o y atual com a animação de flutuação. */
  floatY(time) {
    return this.y + Math.sin(time * this.floatSpeed + this.floatOffset) * 6
  }
}
