/**
 * easterEggs.js
 * -------------
 * Definição dos 3 segredos exigidos pela especificação.
 *
 * 1) hiddenBook  (FASE 1) - "Livro escondido com mensagem secreta"
 *    Localização: flutuando no alto, à direita da primeira plataforma flutuante.
 *    Como desbloquear: tocar no livro dourado. Exibe uma mensagem secreta.
 *    Implementação: Collectible do tipo 'book'. Ao coletar, dispara um banner.
 *
 * 2) literaryRef (FASE 2) - "Referência a personagens clássicos da literatura"
 *    Localização: placa oculta no meio da fase, revelada pela Lanterna.
 *    Como desbloquear: iluminar a área com a Lanterna de Éter.
 *    Implementação: objeto secreto com onReveal -> banner citando Dom Quixote,
 *    Alice e Capitão Ahab (Fantasmas de Nanquim).
 *
 * 3) secretRoom  (FASE 3) - "Sala secreta acessível apenas usando a Lanterna"
 *    Localização: nicho escondido na parte inferior das ruínas.
 *    Como desbloquear: iluminar a parede falsa; revela uma sala com página bônus.
 *    Implementação: objeto secreto + Collectible escondido (hidden) que só
 *    pode ser coletado depois de revelado pela luz.
 *
 * Cada fábrica retorna { secrets:[], bonusPages:[] } para a fase montar.
 */

export const EASTER_EGGS = {
  // 1) Livro escondido com mensagem secreta
  hiddenBook(ctx) {
    return {
      books: [{ x: 600, y: 250 }], // página tipo 'book'
      secrets: [],
      message: {
        trigger: 'book',
        title: 'Livro Secreto',
        text: '"Enquanto houver luz e memoria, nenhuma historia sera esquecida."',
      },
    }
  },

  // 2) Referência literária revelada pela Lanterna
  literaryRef(ctx) {
    return {
      books: [],
      secrets: [
        {
          x: 2050,
          y: 300,
          w: 60,
          h: 80,
          revealed: false,
          kind: 'plaque',
          banner: {
            title: 'Heróis Esquecidos',
            text: 'Os Fantasmas de Nanquim foram Dom Quixote, Alice e o Capitao Ahab.',
          },
        },
      ],
    }
  },

  // 3) Sala secreta acessível só com a Lanterna
  secretRoom(ctx) {
    return {
      books: [],
      secrets: [
        {
          x: 2500,
          y: 300,
          w: 220,
          h: 170,
          revealed: false,
          kind: 'room',
          banner: {
            title: 'Sala Secreta',
            text: 'Uma camara oculta entre as estantes guardava uma pagina rara!',
          },
        },
      ],
      // página bônus escondida dentro da sala secreta
      hiddenPages: [{ x: 2600, y: 360 }],
    }
  },
}
