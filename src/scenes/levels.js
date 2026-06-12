/**
 * levels.js
 * ---------
 * Definição declarativa das fases (progressão crescente de dificuldade).
 *
 * Cada fase contém:
 *  - width        : largura do mundo
 *  - playerStart  : posição inicial de Alex
 *  - platforms    : [x, y, w, h, type]
 *  - hidden       : plataformas ocultas reveladas pela Lanterna [x, y, w, h]
 *  - enemies      : [x, type, patrolStart, patrolEnd]
 *  - pages        : [x, y] páginas a coletar (todas necessárias p/ poder especial)
 *  - secrets      : easter eggs (ver easterEggs.js)
 *  - boss         : presente apenas na fase final
 *  - tip          : dica de tutorial exibida no início
 *
 * FASE 1 - Tutorial da Lanterna (poucos inimigos, pontes ocultas simples)
 * FASE 2 - Mais inimigos e mais plataformas ocultas
 * FASE 3 - Combinação de desafios (vãos maiores, voadores)
 * FASE 4 - Batalha final contra o Traça-Mundo
 */

import { CONFIG } from '../config/config.js'

const G = CONFIG.GROUND_Y

export const LEVELS = [
  // ---------------- FASE 1 : Tutorial da Lanterna ----------------
  {
    name: 'A Entrada da Biblioteca',
    tip: 'Segure ESPAÇO para acender a Lanterna de Éter e materializar as pontes ocultas (em azul).',
    width: 3000,
    playerStart: { x: 50, y: 400 },
    platforms: [
      [0, G, 700, 100, 'ground'],
      [1100, G, 500, 100, 'ground'],
      [1900, G, 1100, 100, 'ground'],
      [300, 400, 140, 20, 'floating'],
      [1300, 380, 140, 20, 'floating'],
      [2200, 390, 150, 20, 'floating'],
    ],
    hidden: [
      // ponte sobre o primeiro vão (tutorial)
      [760, 470, 120, 32],
      [900, 470, 120, 32],
      [1620, 470, 120, 32],
    ],
    enemies: [
      [500, 'walker', 350, 650],
      [2100, 'walker', 1950, 2500],
    ],
    pages: [
      [350, 360],
      [820, 430],
      [1350, 340],
      [2250, 350],
      [2600, 440],
    ],
    secrets: ['hiddenBook'],
  },

  // ---------------- FASE 2 : Estantes Quebradas ----------------
  {
    name: 'Estantes Quebradas',
    tip: 'Mais Fantasmas de Nanquim surgem. Use a Lanterna para encontrar plataformas e páginas escondidas.',
    width: 4200,
    playerStart: { x: 50, y: 400 },
    platforms: [
      [0, G, 600, 100, 'ground'],
      [1000, G, 400, 100, 'ground'],
      [1800, G, 500, 100, 'ground'],
      [2700, G, 400, 100, 'ground'],
      [3300, G, 900, 100, 'ground'],
      [300, 400, 120, 20, 'floating'],
      [1100, 380, 120, 20, 'floating'],
      [1950, 390, 120, 20, 'floating'],
      [2800, 380, 120, 20, 'floating'],
    ],
    hidden: [
      [650, 470, 110, 24],
      [800, 440, 110, 24],
      [1450, 470, 110, 24],
      [1600, 440, 110, 24],
      [2350, 470, 120, 24],
      [2500, 440, 120, 24],
      [3150, 470, 110, 24],
    ],
    enemies: [
      [450, 'walker', 300, 580],
      [1150, 'walker', 1010, 1380],
      [1300, 'flyer', 1100, 1700],
      [2000, 'walker', 1810, 2280],
      [2900, 'walker', 2710, 3080],
      [2600, 'flyer', 2300, 2900],
    ],
    pages: [
      [350, 360],
      [1150, 340],
      [1950, 350],
      [2000, 430],
      [2850, 340],
      [3500, 440],
      [3800, 440],
    ],
    secrets: ['literaryRef'],
  },

  // ---------------- FASE 3 : Ruínas da Cidade ----------------
  {
    name: 'Ruínas da Cidade',
    tip: 'Vãos maiores e voadores. Combine pulo, Lanterna e ataque para sobreviver.',
    width: 4800,
    playerStart: { x: 50, y: 400 },
    platforms: [
      [0, G, 500, 100, 'ground'],
      [1300, G, 400, 100, 'ground'],
      [2300, G, 400, 100, 'ground'],
      [3300, G, 500, 100, 'ground'],
      [4100, G, 700, 100, 'ground'],
      [250, 410, 110, 20, 'floating'],
      [1400, 390, 110, 20, 'floating'],
      [2400, 390, 110, 20, 'floating'],
      [3400, 400, 110, 20, 'floating'],
    ],
    hidden: [
      [560, 460, 100, 24],
      [720, 420, 100, 24],
      [880, 380, 100, 24],
      [1040, 420, 100, 24],
      [1820, 460, 100, 24],
      [1980, 420, 100, 24],
      [2140, 460, 100, 24],
      [2680, 470, 100, 24],
      [2820, 440, 100, 24],
      [2980, 400, 100, 24],
      [3140, 440, 100, 24],
      [3860, 435, 100, 24],
    ],
    enemies: [
      [400, 'walker', 250, 480],
      [1450, 'flyer', 1300, 1700],
      [1500, 'walker', 1310, 1680],
      [2400, 'flyer', 2300, 2700],
      [2450, 'walker', 2310, 2680],
      [3450, 'walker', 3310, 3780],
      [3500, 'flyer', 3300, 3800],
      [4300, 'walker', 4110, 4780],
    ],
    pages: [
      [300, 360],
      [930, 340],
      [1450, 320],
      [2080, 380],
      [2450, 320],
      [3050, 360],
      [3450, 340],
      [4400, 440],
    ],
    secrets: ['secretRoom'],
  },

  // ---------------- FASE 4 : O Coração de Elin (Boss) ----------------
  {
    name: 'O Coração de Elin',
    tip: 'O Traça-Mundo aguarda. Colete as páginas, carregue o Ataque Especial [E] e o derrote!',
    width: 3200,
    playerStart: { x: 50, y: 400 },
    platforms: [
      [0, G, 3200, 100, 'ground'],
      [400, 380, 140, 20, 'floating'],
      [900, 340, 140, 20, 'floating'],
      [1500, 360, 140, 20, 'floating'],
      [2100, 340, 140, 20, 'floating'],
    ],
    hidden: [
      [650, 420, 120, 24],
      [1200, 400, 120, 24],
      [1800, 420, 120, 24],
    ],
    enemies: [
      [600, 'walker', 400, 900],
      [1400, 'flyer', 1200, 1700],
    ],
    pages: [
      [450, 340],
      [950, 300],
      [1550, 320],
      [2150, 300],
      [1200, 360],
    ],
    secrets: [],
    boss: { x: 2750, y: G - 90 },
  },
]
