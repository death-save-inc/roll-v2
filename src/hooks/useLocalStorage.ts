import { useEffect } from 'react'

import { type PlayerState } from '../store/playerStore'

const STORAGE_KEY = 'rfi-players'

export function useLocalStorage(state: PlayerState, hydrate: (state: PlayerState) => void): void {
  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as PlayerState
        hydrate(saved)
      }
    } catch {
      // Ignore corrupt data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on every state change (players + dungeonMaster only)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota exceeded
    }
  }, [state])
}
