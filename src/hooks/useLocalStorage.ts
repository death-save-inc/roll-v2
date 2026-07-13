import { useEffect } from 'react'

import { type PlayerState } from '../store/playerStore'

const STORAGE_KEY = 'rfi-players'

export function useLocalStorage(state: PlayerState): void {
  // Persist on every state change (players + dungeonMaster only)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota exceeded
    }
  }, [state])
}
