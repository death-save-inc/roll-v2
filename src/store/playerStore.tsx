import { type ReactNode, createContext, useCallback, useContext, useReducer } from 'react'

import { type Player } from '../types/player'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
export interface PlayerState {
  dungeonMaster: Player
  players: Player[]
  results: Player[]
  modalOpen: boolean
  hasRolled: boolean
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
type Action =
  | { type: 'ADD_PLAYER' }
  | { type: 'DELETE_PLAYER'; id: string }
  | { type: 'UPDATE_PLAYER'; id: string; data: Partial<Player> }
  | { type: 'UPDATE_DM'; data: Partial<Player> }
  | { type: 'SET_RESULTS'; results: Player[] }
  | { type: 'OPEN_MODAL' }
  | { type: 'CLOSE_MODAL' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const generatePlayer = (name: string, type: 'player' | 'dm' = 'player'): Player => ({
  id: crypto.randomUUID(),
  name,
  modifier: 0,
  imgUrl: '',
  roll: 0,
  reroll: null,
  type,
})

const DEFAULT_DM = generatePlayer('Monsters', 'dm')
const DEFAULT_PLAYER = generatePlayer('Player 1')

const initialState: PlayerState = {
  dungeonMaster: DEFAULT_DM,
  players: [DEFAULT_PLAYER],
  results: [],
  modalOpen: false,
  hasRolled: false,
}

const STORAGE_KEY = 'rfi-players'

// Read synchronously on first render so React never renders (and pushes to
// ThreeJS) the default state before swapping it for saved data a moment later.
function loadInitialState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PlayerState
  } catch {
    // Ignore corrupt data
  }
  return initialState
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function reducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const name = `Player ${state.players.length + 1}`
      return { ...state, players: [...state.players, generatePlayer(name)] }
    }

    case 'DELETE_PLAYER': {
      if (state.players.length <= 1) return state
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.id),
      }
    }

    case 'UPDATE_PLAYER': {
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.id ? { ...p, ...action.data } : p)),
      }
    }

    case 'UPDATE_DM': {
      return {
        ...state,
        dungeonMaster: { ...state.dungeonMaster, ...action.data },
      }
    }

    case 'SET_RESULTS': {
      return { ...state, results: action.results, hasRolled: true }
    }

    case 'OPEN_MODAL': {
      return { ...state, modalOpen: true }
    }

    case 'CLOSE_MODAL': {
      return { ...state, modalOpen: false }
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface PlayerContextValue {
  state: PlayerState
  addPlayer: () => void
  deletePlayer: (id: string) => void
  updatePlayer: (id: string, data: Partial<Player>) => void
  updateDM: (data: Partial<Player>) => void
  setResults: (results: Player[]) => void
  openModal: () => void
  closeModal: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)

  const addPlayer = useCallback(() => dispatch({ type: 'ADD_PLAYER' }), [])
  const deletePlayer = useCallback((id: string) => dispatch({ type: 'DELETE_PLAYER', id }), [])
  const updatePlayer = useCallback(
    (id: string, data: Partial<Player>) => dispatch({ type: 'UPDATE_PLAYER', id, data }),
    [],
  )
  const updateDM = useCallback((data: Partial<Player>) => dispatch({ type: 'UPDATE_DM', data }), [])
  const setResults = useCallback(
    (results: Player[]) => dispatch({ type: 'SET_RESULTS', results }),
    [],
  )
  const openModal = useCallback(() => dispatch({ type: 'OPEN_MODAL' }), [])
  const closeModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), [])

  return (
    <PlayerContext.Provider
      value={{
        state,
        addPlayer,
        deletePlayer,
        updatePlayer,
        updateDM,
        setResults,
        openModal,
        closeModal,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePlayerStore() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayerStore must be used inside <PlayerProvider>')
  return ctx
}

// ---------------------------------------------------------------------------
// Re-export helper so other modules can call it standalone
// ---------------------------------------------------------------------------
export { generatePlayer }
