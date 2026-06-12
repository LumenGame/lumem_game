/**
 * config.js
 * ---------
 * Constantes globais de configuração do jogo LÚMEN.
 * Centraliza valores de física, dimensões e regras para facilitar o balanceamento.
 */

export const CONFIG = {
  // Dimensões da tela de jogo (canvas)
  WIDTH: 900,
  HEIGHT: 600,

  // Física
  GRAVITY: 0.5,
  PLAYER_SPEED: 4,
  JUMP_FORCE: -11.5,
  GROUND_Y: 500,

  // Combate
  ATTACK_DURATION: 0.25, // segundos
  ATTACK_RANGE: 50,
  ATTACK_COOLDOWN: 0.35,
  INVINCIBLE_DURATION: 1.2, // segundos de invencibilidade após dano

  // Poder especial
  POWER_DURATION: 4,

  // Lanterna de Éter
  LANTERN_RADIUS: 140, // raio de iluminação
  LANTERN_MAX: 100, // energia máxima
  LANTERN_DRAIN: 28, // gasto por segundo enquanto acesa
  LANTERN_REGEN: 18, // recarga por segundo quando apagada

  // Vidas
  MAX_HEARTS: 3,

  // Chefão
  BOSS_ATTACK_INTERVAL: 1.6,

  // Inimigos (controle global de velocidade de patrulha)
  ENEMY_SPEED_MULTIPLIER: 1,

  // Pontuação
  SCORE_PER_PAGE: 100,
  SCORE_PER_ENEMY: 50,
  SCORE_BOSS: 1000,

  // Chave de salvamento no LocalStorage
  SAVE_KEY: 'lumen_save_v1',
}
