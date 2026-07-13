import { useEffect, useRef } from 'react'

import { emit, off, on } from '../eventbus'
import { type PlayerState } from '../store/playerStore'
import { type Player } from '../types/player'

interface Options {
  state: PlayerState
  setResults: (results: Player[]) => void
}

// Converts a React Player to the payload shape that ThreeJS DungeonManager expects
function toThreeJsPayload(player: Player) {
  return {
    uuid: player.id,
    name: player.name,
    imageSrc: player.imgUrl || null,
    type: player.type,
    modifier: player.modifier,
    color: player.type === 'dm' ? 0xff0000 : 0xff00ff,
  }
}

export function useEventBridge({ state, setResults }: Options): void {
  // Keep a stable ref to the current state so event callbacks don't go stale
  const stateRef = useRef(state)
  stateRef.current = state

  // Track which player IDs ThreeJS currently has
  const knownIds = useRef<Set<string>>(new Set())

  // Track whether ThreeJS has signalled it is ready
  const sceneReady = useRef(false)

  // Helper: push all current players to ThreeJS from scratch
  const pushAllPlayers = () => {
    const { dungeonMaster, players } = stateRef.current
    const all = [dungeonMaster, ...players]
    for (const player of all) {
      emit('player:add', toThreeJsPayload(player))
      knownIds.current.add(player.id)
    }
  }

  // ---- Wait for the ThreeJS scene to signal readiness ----------------------
  useEffect(() => {
    const onSceneReady = () => {
      sceneReady.current = true
      knownIds.current.clear()
      pushAllPlayers()
    }

    on('scene:ready', onSceneReady)
    emit('ui:ready')
    return () => off('scene:ready', onSceneReady)
  }, [])

  // ---- Sync player changes to ThreeJS once scene is ready ------------------
  useEffect(() => {
    if (!sceneReady.current) return

    const allReact = [state.dungeonMaster, ...state.players]
    const allReactIds = new Set(allReact.map((p) => p.id))

    // Add new players
    for (const player of allReact) {
      if (!knownIds.current.has(player.id)) {
        emit('player:add', toThreeJsPayload(player))
        knownIds.current.add(player.id)
      }
    }

    // Remove deleted players
    for (const id of [...knownIds.current]) {
      if (!allReactIds.has(id)) {
        emit('player:delete', { uuid: id })
        knownIds.current.delete(id)
      }
    }

    // Push updates for existing players
    for (const player of allReact) {
      if (knownIds.current.has(player.id)) {
        emit('player:update', toThreeJsPayload(player))
      }
    }
  }, [state.players, state.dungeonMaster])

  // ---- Listen for roll:complete from ThreeJS --------------------------------
  useEffect(() => {
    const onRollComplete = (threeJsPlayers: any[]) => {
      if (!Array.isArray(threeJsPlayers)) return
      const allReact = [stateRef.current.dungeonMaster, ...stateRef.current.players]
      const results: Player[] = threeJsPlayers
        .map((tp) => {
          const match = allReact.find((p) => p.id === tp.uuid)
          if (!match) return null
          const result: Player = { ...match, roll: tp.roll ?? 0 }
          if (tp.reroll != null) result.reroll = tp.reroll
          return result
        })
        .filter((p): p is Player => p !== null)

      setResults(results)
    }

    on('roll:complete', onRollComplete)
    return () => off('roll:complete', onRollComplete)
  }, [setResults])
}
