import { Player } from '../actors/player.js'
import { EventBus } from '../lib/eventbus.js'

// DungeonManager is now driven by the React UI via the EventBus.
// Players are created, updated, and deleted in response to events emitted
// by the React layer — no vanilla DOM UI or localStorage bootstrapping here.
export class DungeonManager {
  constructor(controller) {
    this.controller = controller
    this.players = []
  }

  async init() {
    EventBus.on('player:add', (playerData) => {
      this.addPlayer(playerData)
    })

    EventBus.on('player:delete', (playerData) => {
      this.deletePlayer(playerData)
    })

    EventBus.on('player:update', (playerData) => {
      this.updatePlayer(playerData)
    })

    // React mounts after this runs, so it can't hear this initial emit.
    // Re-emit once React signals it has subscribed.
    EventBus.on('ui:ready', () => {
      EventBus.emit('scene:ready')
    })

    // Signal to the React UI that ThreeJS is ready for player events
    EventBus.emit('scene:ready')
  }

  resetPlayerRolls() {
    for (const player of this.players) {
      if (player) {
        player.roll = null
      }
    }
  }

  addPlayer(playerData) {
    if (!playerData || !playerData.name || !playerData.uuid) {
      console.warn('DungeonManager.addPlayer: invalid payload', playerData)
      return null
    }

    // Avoid duplicates if React re-emits for an already-known player
    const existing = this.players.find((p) => p.uuid === playerData.uuid)
    if (existing) {
      console.log('DungeonManager: Player already exists', playerData.uuid)
      return existing
    }

    console.log('DungeonManager: Creating new player', playerData.name, playerData.uuid)

    const newPlayer = new Player(
      this.controller,
      playerData.name,
      playerData.uuid,
      playerData.imageSrc || null,
      playerData.type || 'player',
      playerData.modifier || 0,
      playerData.color || 0xff00ff,
    )
    this.players.push(newPlayer)

    // Ensure card initialization completes (but don't block)
    newPlayer.card.initPromise
      .then(() => {
        console.log('DungeonManager: Card initialized for player', newPlayer.uuid)
      })
      .catch((err) => {
        console.error('Failed to initialize card for player:', newPlayer.uuid, err)
      })

    return newPlayer
  }

  updatePlayer(playerData) {
    if (!playerData || !playerData.uuid) return
    const player = this.players.find((p) => p.uuid === playerData.uuid)
    if (!player) return

    if (playerData.name !== undefined && playerData.name !== player.name) {
      player.setName(playerData.name)
    }
    if (playerData.modifier !== undefined) player.modifier = playerData.modifier
    if (playerData.imageSrc !== undefined && playerData.imageSrc !== player.imageSrc) {
      player.setPicture(playerData.imageSrc)
    }
  }

  deletePlayer(playerData) {
    const index = this.players.findIndex((p) => p.uuid === playerData.uuid)
    if (index !== -1) {
      this.players[index].delete()
      this.players.splice(index, 1)
    }
  }
}
