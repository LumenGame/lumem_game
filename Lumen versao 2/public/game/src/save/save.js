/**
 * save.js
 * -------
 * Sistema de salvamento usando LocalStorage.
 * Persiste: fase atual, pontuação e melhor pontuação (high score).
 */

import { CONFIG } from '../config/config.js'

export const SaveSystem = {
  /** Lê o estado salvo. Retorna um objeto padrão se não houver nada. */
  load() {
    try {
      const raw = localStorage.getItem(CONFIG.SAVE_KEY)
      if (!raw) return this._default()
      const data = JSON.parse(raw)
      return { ...this._default(), ...data }
    } catch (e) {
      console.log('[v0] Falha ao ler save:', e.message)
      return this._default()
    }
  },

  /** Salva o progresso atual. */
  save(state) {
    try {
      const current = this.load()
      const data = {
        level: state.level ?? current.level,
        score: state.score ?? current.score,
        highScore: Math.max(current.highScore || 0, state.score || 0),
        pages: state.pages ?? current.pages,
      }
      localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(data))
      return data
    } catch (e) {
      console.log('[v0] Falha ao salvar:', e.message)
      return null
    }
  },

  /** Limpa o progresso salvo. */
  clear() {
    try {
      localStorage.removeItem(CONFIG.SAVE_KEY)
    } catch (e) {
      console.log('[v0] Falha ao limpar save:', e.message)
    }
  },

  _default() {
    return { level: 0, score: 0, highScore: 0, pages: 0 }
  },
}
