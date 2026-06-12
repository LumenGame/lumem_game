/**
 * camera.js
 * ---------
 * Câmera lateral com suavização (lerp). Segue o jogador e respeita
 * os limites da fase para nunca mostrar fora do mundo.
 */

import { CONFIG } from '../config/config.js'

export class Camera {
  constructor() {
    this.x = 0
    this.y = 0
  }

  reset() {
    this.x = 0
    this.y = 0
  }

  /** Atualiza a posição da câmera seguindo um alvo (o jogador). */
  follow(target, levelWidth) {
    const desired = target.x - CONFIG.WIDTH / 3
    this.x += (desired - this.x) * 0.08
    this.x = Math.max(0, Math.min(this.x, levelWidth - CONFIG.WIDTH))
  }
}
