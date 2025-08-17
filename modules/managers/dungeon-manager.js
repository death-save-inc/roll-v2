import { Player } from "../actors/player.js";
import { RollUI } from "../UI/roll.js";
import { PlayersEditor } from "../UI/players-editor.js";
import { EventBus } from "../lib/eventbus.js";
import { LocalStorageManager } from "../lib/manage-local-storage.js";
import { PlayerEditorHud } from "../UI/players-editor-hud.js";
import { SaveSlotsUI } from "../UI/save-slots.js";
export class DungeonManager {
  constructor(controller) {
    this.controller = controller;
    this.players = [];
  }

  async init() {
    this.playersEditor = new PlayersEditor();
    this.RollUI = new RollUI();
    this.playerEditorHud = new PlayerEditorHud()
    this.saveSlotsUI = new SaveSlotsUI()

    const storageManager = LocalStorageManager.getInstance();
    const saveData = storageManager.getCurrentSave();
    const players = await saveData.get("players");

    if (players.length > 0) {
      for (const player of players) {
        const addedPlayer = this.addPlayer(player);
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const newPlayer = Player.empty(this.controller);
        this.players.push(newPlayer);
      }
      saveData.set("players", this.players.map((p) => p.toJSON()));
      storageManager.saveToExistingSlot("players", this.players.map((p) => p.toJSON()));
    }

    EventBus.on("player:add", () => {
      this.addPlayer(null);
    });

    EventBus.on("player:delete", (player) => {
      this.deletePlayer(player);
    });
  }

  resetPlayerRolls() {
    for (const player of this.players) {
        if (player) { // Ensure player is not undefined or null
            player.roll = null;
        } else {
            console.warn("Encountered undefined or null player in resetPlayerRolls.");
        }
    }
  }

  addPlayer(playerData) {
    if (!playerData || !playerData.name || !playerData.uuid) {
        console.warn("Invalid player data provided to addPlayer:", playerData);
        return null;
    }

    if (playerData.name === "Dungeon master") {
        const dmPlayer = Player.dungeonMaster(this.controller);
        this.players.push(dmPlayer);
        return dmPlayer;
    } else {
        console.log("Retrieved players from local storage:", LocalStorageManager.getInstance().getDataByKey("players"));
        const existingPlayer = LocalStorageManager.getInstance().getDataByKey("players")?.find(player => player.uuid === playerData.uuid);
        if (existingPlayer) {
            const newPlayer = new Player(
                this.controller,
                playerData.name,
                playerData.uuid,
                playerData.imageSrc,
                playerData.type,
                playerData.modifier,
                playerData.color
            );
            this.players.push(newPlayer);
            return newPlayer;
        }
    }

    console.warn("Player data not found in local storage:", playerData);
    return null;
  }

  deletePlayer(player) {
    const index = this.players.findIndex((p) => p.uuid === player.uuid);
    if (index !== -1) {
      localStorage.removeItem(player.uuid);
      this.players[index].delete();
      this.players.splice(index, 1);
    }
  }

  readLocalStorage() {
    const items = { ...localStorage };
    const players = [];

    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith("player")) {
        players.push({ ...JSON.parse(value) });
      }
    }
    return players;
  }
}
