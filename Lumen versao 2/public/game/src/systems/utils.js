/**
 * utils.js
 * --------
 * Funções utilitárias compartilhadas: colisão, distância e clamp.
 */

/** Teste de sobreposição entre dois retângulos (AABB). */
export function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
}

/** Distância euclidiana entre dois pontos. */
export function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by)
}

/** Limita um valor entre min e max. */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max))
}
