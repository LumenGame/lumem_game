/**
 * particles.js
 * ------------
 * Sistema de partículas simples para efeitos visuais (impactos, coletas, explosões).
 */

export class ParticleSystem {
  constructor() {
    this.particles = []
  }

  clear() {
    this.particles.length = 0
  }

  /** Cria um conjunto de partículas em (x, y) com determinada cor. */
  spawn(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 4,
      })
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1
      p.life -= dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }
  }

  render(ctx, cameraX) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - cameraX - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1
  }
}
